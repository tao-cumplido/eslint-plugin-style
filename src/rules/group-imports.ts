import { isAbsolute } from 'path';

import builtinModules from 'builtin-modules';

import type { ImportModuleDeclaration } from '../util/ast';
import { extrema, importModules, linesBetween } from '../util/ast';
import type { RuleContext, RuleModule } from '../util/rule';
import { fixRange } from '../util/rule';
import { sortByPath } from '../util/sort';

export enum GroupClass {
	Node = '#NODE',
	External = '#EXTERNAL',
	Absolute = '#ABSOLUTE',
	Relative = '#RELATIVE',
}

type GroupConfiguration = Array<string | string[]>;

export interface Configuration {
	groups: GroupConfiguration;
}

const defaultConfiguration: Configuration = {
	groups: [GroupClass.Node, GroupClass.External, GroupClass.Absolute, GroupClass.Relative],
};

function groupIndex(node: ImportModuleDeclaration, groups: GroupConfiguration) {
	if (typeof node.source.value !== 'string') {
		return groups.length;
	}

	const importPath = node.source.value;
	const pathSegments = importPath.split('/');

	const module = importPath.startsWith('/') ? `/${pathSegments[1]}` : pathSegments[0];

	const findIndex = (callback: (group: string) => unknown) => groups.findIndex(($) => $ instanceof Array ? $.find(($$) => callback($$)) : callback($));

	const hardCodedIndex = findIndex((group) => group === module);

	if (hardCodedIndex >= 0) {
		return hardCodedIndex;
	}

	let moduleClass = GroupClass.External;

	if (builtinModules.includes(module)) {
		moduleClass = GroupClass.Node;
	} else if (/^(\/|\.)/u.exec(module)) {
		moduleClass = isAbsolute(module) ? GroupClass.Absolute : GroupClass.Relative;
	}

	const classIndex = findIndex((group) => group === moduleClass);

	return classIndex >= 0 ? classIndex : groups.length;
}

function checkLines(
	context: RuleContext<[Configuration]>,
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
			if (!previous.range || !next.range) {
				return null;
			}

			return fixer.replaceTextRange([previous.range[1], next.range[0]], ''.padEnd(lineCount + 1, '\n'));
		},
	});
}

function groupLabels(groups: GroupConfiguration) {
	return groups.map((group) => {
		if (group instanceof Array || !Object.values<string>(GroupClass).includes(group)) {
			return 'custom';
		}

		return group;
	});
}

export const rule: RuleModule<[Configuration]> = {
	meta: {
		fixable: 'code',
		schema: [
			{
				type: 'object',
				properties: {
					groups: {
						type: 'array',
						items: {
							type: ['string', 'array'],
							items: {
								type: 'string',
							},
						},
					},
				},
			},
		],
	},
	create(context) {
		const groupConfiguration = context.options[0]?.groups ?? defaultConfiguration.groups;

		const source = context.getSourceCode();

		const imports = importModules(source).map((node) => {
			return {
				index: groupIndex(node, groupConfiguration),
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
				message: `Expected import groups: ${groupLabels(groupConfiguration).join(', ')}`,
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
