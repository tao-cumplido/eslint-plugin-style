import type { ExportSpecifier, ImportDeclaration, ImportSpecifier, Node } from 'estree';

import type { RuleModule, SortOptions } from '../util';
import { extrema, fixRange, importDeclarations, linesBetween, sortBy } from '../util';
import type { ExportFromDeclaration } from '../util/export-from-declarations';
import { exportFromDeclarations } from '../util/export-from-declarations';

export interface Configuration extends SortOptions {
	specifier: 'source' | 'rename';
	sortExports: boolean;
}

const defaultConfiguration: Configuration = {
	specifier: 'source',
	locales: ['en-US'],
	numeric: true,
	caseFirst: 'lower',
	sortExports: true,
};

export const rule: RuleModule<[Configuration]> = {
	meta: {
		fixable: 'code',
		schema: [
			{
				type: 'object',
				properties: {
					locales: {
						type: 'array',
						items: {
							type: 'string',
						},
					},
					sensitivity: {
						enum: ['base', 'accent', 'case', 'variant'],
					},
					ignorePunctuation: {
						type: 'boolean',
					},
					numeric: {
						type: 'boolean',
					},
					caseFirst: {
						enum: ['upper', 'lower', 'false'],
					},
					caseGroups: {
						type: 'boolean',
					},
					specifier: {
						enum: ['source', 'rename'],
					},
					sortExports: {
						type: 'boolean',
					},
				},
			},
		],
	},
	create(context) {
		const configuration = { ...defaultConfiguration, ...context.options[0] };

		const source = context.getSourceCode();

		const partition = <T extends Node>(result: T[][], node: T, index: number, from: T[]) => {
			if (index > 0 && linesBetween(from[index - 1], node) > 0) {
				result.push([]);
			}

			result[result.length - 1].push(node);

			return result;
		};

		const sortImportModules = (group: ImportDeclaration[]) => {
			const sorted = sortBy(group, ['source', 'value'], configuration);

			if (sorted.some((node, i) => node !== group[i])) {
				fixRange(context, {
					range: extrema(group),
					message: 'Expected modules in group to be sorted',
					code: sorted.map((node) => source.getText(node)).join('\n'),
				});
			}
		};

		const sortImportSpecifiers = (specifiers: ImportSpecifier[]) => {
			const from: 'imported' | 'local' = configuration.specifier === 'source' ? 'imported' : 'local';
			const sorted = sortBy(specifiers, [from, 'name'], configuration);

			if (sorted.some((node, i) => node !== specifiers[i])) {
				fixRange(context, {
					range: extrema(specifiers),
					message: 'Expected specifiers to be sorted',
					code: sorted.map((node) => source.getText(node)).join(', '),
				});
			}
		};

		importDeclarations(source)
			.reduce<ImportDeclaration[][]>(partition, [[]])
			.forEach((group) => {
				sortImportModules(group);
				group.forEach((node) => {
					sortImportSpecifiers(node.specifiers.filter(($): $ is ImportSpecifier => $.type === 'ImportSpecifier'));
				});
			});

		if (configuration.sortExports) {
			const sortExportModules = (group: ExportFromDeclaration[]) => {
				const sorted = sortBy(group, ['source', 'value'], configuration);

				if (sorted.some((node, i) => node !== group[i])) {
					fixRange(context, {
						range: extrema(group),
						message: 'Expected modules in group to be sorted',
						code: sorted.map((node) => source.getText(node)).join('\n'),
					});
				}
			};

			const sortExportSpecifiers = (specifiers: ExportSpecifier[]) => {
				const from: 'exported' | 'local' = configuration.specifier === 'source' ? 'local' : 'exported';
				const sorted = sortBy(specifiers, [from, 'name'], configuration);

				if (sorted.some((node, i) => node !== specifiers[i])) {
					fixRange(context, {
						range: extrema(specifiers),
						message: 'Expected specifiers to be sorted',
						code: sorted.map((node) => source.getText(node)).join(', '),
					});
				}
			};

			exportFromDeclarations(source)
				.reduce<ExportFromDeclaration[][]>(partition, [[]])
				.forEach((group) => {
					sortExportModules(group);
					group.forEach((node) => sortExportSpecifiers(node.specifiers ?? []));
				});
		}

		return {};
	},
};
