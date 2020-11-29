import type { ExportSpecifier, ImportSpecifier, Node } from 'estree';

import type { ExportModuleDeclaration, ImportModuleDeclaration, ModuleDeclaration } from '../util/ast';
import { exportModules, extrema, importModules, isTypeImportOrExport, linesBetween } from '../util/ast';
import type { RuleModule } from '../util/rule';
import { fixRange } from '../util/rule';
import type { SortOptions } from '../util/sort';
import { sortByPath } from '../util/sort';

export enum TypeImportPosition {
	Ignore = 'ignore',
	Top = 'top',
	Bottom = 'bottom',
	AboveValue = 'above-value',
	BelowValue = 'below-value',
}

export interface Configuration extends SortOptions {
	specifier: 'source' | 'rename';
	sortExports: boolean;
	typesInGroup: TypeImportPosition;
}

const defaultConfiguration: Configuration = {
	specifier: 'source',
	locales: ['en-US'],
	numeric: true,
	caseFirst: 'lower',
	sortExports: true,
	typesInGroup: TypeImportPosition.Ignore,
};

export const rule: RuleModule<[Partial<Configuration>?]> = {
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
					typesInGroup: {
						enum: ['ignore', 'top', 'bottom', 'above-value', 'below-value'],
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

		const sortModules = (group: ModuleDeclaration[]) => {
			const sorted = sortByPath(group, ['source', 'value'], configuration);

			if (configuration.typesInGroup !== TypeImportPosition.Ignore) {
				sorted.sort((a, b) => {
					const aIsType = isTypeImportOrExport(a);
					const bIsType = isTypeImportOrExport(b);

					if (aIsType === bIsType) {
						return 0;
					}

					// eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
					switch (configuration.typesInGroup) {
						case TypeImportPosition.Top:
							return aIsType ? -1 : 1;
						case TypeImportPosition.Bottom:
							return aIsType ? 1 : -1;
					}

					if (a.source.value === b.source.value) {
						// eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
						switch (configuration.typesInGroup) {
							case TypeImportPosition.AboveValue:
								return aIsType ? -1 : 1;
							case TypeImportPosition.BelowValue:
								return aIsType ? 1 : -1;
						}
					}

					return 0;
				});
			}

			if (sorted.some((node, i) => node !== group[i])) {
				fixRange(context, {
					range: extrema(group),
					message: 'Expected modules in group to be sorted',
					code: sorted.map((node) => source.getText(node)).join('\n'),
				});
			}
		};

		const sortSpecifiers = <T extends ImportSpecifier | ExportSpecifier>(specifiers: T[]) => {
			if (!specifiers.length) {
				return;
			}

			let sorted: Array<ImportSpecifier | ExportSpecifier>;

			if (specifiers[0].type === 'ImportSpecifier') {
				const from: 'imported' | 'local' = configuration.specifier === 'source' ? 'imported' : 'local';
				sorted = sortByPath(specifiers as ImportSpecifier[], [from, 'name'], configuration);
			} else {
				const from: 'exported' | 'local' = configuration.specifier === 'source' ? 'local' : 'exported';
				sorted = sortByPath(specifiers as ExportSpecifier[], [from, 'name'], configuration);
			}

			if (sorted.some((node, i) => node !== specifiers[i])) {
				fixRange(context, {
					range: extrema(specifiers),
					message: 'Expected specifiers to be sorted',
					code: sorted.map((node) => source.getText(node)).join(', '),
				});
			}
		};

		importModules(source)
			.reduce<ImportModuleDeclaration[][]>(partition, [[]])
			.forEach((group) => {
				sortModules(group);
				group.forEach((node) => {
					sortSpecifiers(node.specifiers.filter(($): $ is ImportSpecifier => $.type === 'ImportSpecifier'));
				});
			});

		if (configuration.sortExports) {
			const sortExportSpecifiers = (specifiers: ExportSpecifier[]) => {
				const from: 'exported' | 'local' = configuration.specifier === 'source' ? 'local' : 'exported';
				const sorted = sortByPath(specifiers, [from, 'name'], configuration);

				if (sorted.some((node, i) => node !== specifiers[i])) {
					fixRange(context, {
						range: extrema(specifiers),
						message: 'Expected specifiers to be sorted',
						code: sorted.map((node) => source.getText(node)).join(', '),
					});
				}
			};

			exportModules(source)
				.reduce<ExportModuleDeclaration[][]>(partition, [[]])
				.forEach((group) => {
					sortModules(group);
					group.forEach((node) => sortExportSpecifiers(node.specifiers ?? []));
				});
		}

		return {};
	},
};
