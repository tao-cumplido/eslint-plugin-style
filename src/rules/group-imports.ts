import { isAbsolute } from 'path';

import builtinModules from 'builtin-modules';

import type { ImportModuleDeclaration } from '../util/ast';
import { extrema, importModules, linesBetween, onlyWhiteSpaceBetween } from '../util/ast';
import type { RuleContext, RuleModule } from '../util/rule';
import { fixRange } from '../util/rule';
import { sortByPath } from '../util/sort';

export enum ModuleClass {
	Node = 'node',
	External = 'external',
	Absolute = 'absolute',
	Relative = 'relative',
}

export enum TypeImportConfiguration {
	Include = 'include',
	Exclude = 'exclude', // eslint-disable-line @typescript-eslint/no-shadow
	Only = 'only',
}

interface ModuleClassConfiguration {
	class: ModuleClass;
	types?: TypeImportConfiguration;
}

interface ModulePackageConfiguration {
	package: string;
	types?: TypeImportConfiguration;
}

type ModuleConfiguration = string | ModulePackageConfiguration | ModuleClassConfiguration;

export type GroupConfiguration = ModuleConfiguration | ModuleConfiguration[];

const defaultConfiguration: GroupConfiguration[] = [{ class: ModuleClass.Node }, { class: ModuleClass.External }, { class: ModuleClass.Absolute }, { class: ModuleClass.Relative }];

function groupIndex(node: ImportModuleDeclaration, groups: GroupConfiguration[]) {
	if (typeof node.source.value !== 'string') {
		return groups.length;
	}

	const importPath = node.source.value;
	const pathSegments = importPath.split('/');

	const module = importPath.startsWith('/') ? `/${pathSegments[1]}` : pathSegments[0];

	const findIndex = (callback: (group: ModuleConfiguration) => boolean) => groups.findIndex(($) => $ instanceof Array ? $.find(($$) => callback($$)) : callback($));

	const isTypeImport = node.importKind === 'type';

	const hardCodedIndex = findIndex((group) => {
		if (typeof group === 'string') {
			return group === module;
		}

		if (!Reflect.has(group, 'package')) {
			return false;
		}

		if (isTypeImport) {
			return group.package === module && group.types !== TypeImportConfiguration.Exclude;
		}

		return group.package === module && group.types !== TypeImportConfiguration.Only;
	});

	if (hardCodedIndex >= 0) {
		return hardCodedIndex;
	}

	let moduleClass = ModuleClass.External;

	if (builtinModules.includes(module)) {
		moduleClass = ModuleClass.Node;
	} else if (/^(\/|\.)/u.exec(module)) {
		moduleClass = isAbsolute(module) ? ModuleClass.Absolute : ModuleClass.Relative;
	}

	const classIndex = findIndex((group) => {
		if (typeof group !== 'object' || !Reflect.has(group, 'class')) {
			return false;
		}

		if (isTypeImport) {
			return group.class === moduleClass && group.types !== TypeImportConfiguration.Exclude;
		}

		return group.class === moduleClass && group.types !== TypeImportConfiguration.Only;
	});

	return classIndex >= 0 ? classIndex : groups.length;
}

function checkLines(
	context: RuleContext<GroupConfiguration[]>,
	previous: ImportModuleDeclaration,
	next: ImportModuleDeclaration,
	lineCount: number,
) {
	if (linesBetween(previous, next) === lineCount) {
		return;
	}

	context.report({
		node: previous,
		message: `Expected ${lineCount} empty line${lineCount === 1 ? '' : 's'} after import`,
		fix(fixer) {
			if (!previous.range || !next.range || !onlyWhiteSpaceBetween(previous, next, context.getSourceCode())) {
				return null;
			}

			return fixer.replaceTextRange([previous.range[1], next.range[0]], ''.padEnd(lineCount + 1, '\n'));
		},
	});
}

function groupLabels(groups: GroupConfiguration[]) {
	return groups.map((group) => {
		if (group instanceof Array || typeof group === 'string' || Reflect.has(group, 'package')) {
			return 'custom';
		}

		return group.class.toUpperCase();
	});
}

export const rule: RuleModule<GroupConfiguration[]> = {
	meta: {
		fixable: 'code',
		schema: {
			definitions: {
				typeImportConfiguration: {
					enum: ['include', 'exclude', 'only'],
				},
				moduleConfiguration: {
					oneOf: [
						{ type: 'string' },
						{
							type: 'object',
							properties: {
								class: {
									enum: ['node', 'external', 'absolute', 'relative'],
								},
								types: {
									$ref: '#/definitions/typeImportConfiguration',
								},
							},
							required: ['class'],
							additionalProperties: false,
						},
						{
							type: 'object',
							properties: {
								package: {
									type: 'string',
								},
								types: {
									$ref: '#/definitions/typeImportConfiguration',
								},
							},
							required: ['package'],
							additionalProperties: false,
						},
					],
				},
			},
			type: 'array',
			items: {
				anyOf: [
					{
						$ref: '#/definitions/moduleConfiguration',
					},
					{
						type: 'array',
						items: {
							$ref: '#/definitions/moduleConfiguration',
						},
					},
				],
			},
		},
	},
	create(context) {
		const groupConfigurations = context.options.length ? context.options : defaultConfiguration;

		const source = context.getSourceCode();

		const imports = importModules(source).map((node) => {
			return {
				index: groupIndex(node, groupConfigurations),
				node,
			};
		});

		if (imports.length === 0) {
			return {};
		}

		const sorted = sortByPath(imports, ['index']);

		let previousIndex = sorted[0].index;

		const groups = sorted.reduce<ImportModuleDeclaration[][]>(
			(r, v) => {
				const current = r[r.length - 1];

				if (previousIndex === v.index) {
					current.push(v.node);
				} else {
					r.push([v.node]);
				}

				previousIndex = v.index;

				return r;
			},
			[[]],
		);

		if (sorted.some((node, i) => node !== imports[i])) {
			fixRange(context, {
				range: extrema(imports.map(({ node }) => node)),
				message: `Expected import groups: ${groupLabels(groupConfigurations).join(', ')}`,
				code: groups.map((nodes) => nodes.map((node) => source.getText(node)).join('\n')).join('\n\n'),
			});
		} else {
			groups.forEach((group, i) => {
				for (let j = 1; j < group.length; j++) {
					const previous = group[j - 1];
					const current = group[j];
					checkLines(context, previous, current, 0);
				}

				if (i === 0) {
					return;
				}

				const previous = groups[i - 1][groups[i - 1].length - 1];
				const [current] = group;
				checkLines(context, previous, current, 1);
			});
		}

		return {};
	},
};
