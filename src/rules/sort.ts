import { Rule, SourceCode } from 'eslint';
import { ImportDeclaration, ImportSpecifier } from 'estree';

import { importDeclarations, linesBetween, sortBy, SortOptions } from '../util';

interface Configuration extends SortOptions {
    specifier: 'imported' | 'local';
}

const defaultConfiguration: Configuration = {
    specifier: 'imported',
    locales: ['en-US'],
    numeric: true,
    caseFirst: 'lower',
};

function sortModules(
    context: Rule.RuleContext,
    source: SourceCode,
    configuration: Configuration,
    group: ImportDeclaration[],
) {
    const sorted = sortBy(group, ['source', 'value'], configuration);

    if (sorted.some((node, i) => node !== group[i])) {
        const first = group[0];
        const last = group[group.length - 1];

        context.report({
            node: last,
            message: `Expected modules in group to be sorted`,
            fix(fixer) {
                if (!first.range || !last.range) {
                    return null;
                }

                return fixer.replaceTextRange(
                    [first.range[0], last.range[1]],
                    sorted.map((node) => source.getText(node)).join('\n'),
                );
            },
        });
    }
}

function sortSpecifiers(
    context: Rule.RuleContext,
    source: SourceCode,
    configuration: Configuration,
    specifiers: ImportSpecifier[],
) {
    const sorted = sortBy(specifiers, [configuration.specifier, 'name'], configuration);

    if (sorted.some((node, i) => node !== specifiers[i])) {
        const first = specifiers[0];
        const last = specifiers[specifiers.length - 1];

        context.report({
            node: last,
            message: `Expected specifiers to be sorted`,
            fix(fixer) {
                if (!first.range || !last.range) {
                    return null;
                }

                return fixer.replaceTextRange(
                    [first.range[0], last.range[1]],
                    sorted.map((node) => source.getText(node)).join(', '),
                );
            },
        });
    }
}

export const meta: Rule.RuleMetaData = {
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
            },
        },
    ],
};

export function create(context: Rule.RuleContext): Rule.RuleListener {
    const configuration: Configuration = { ...defaultConfiguration, ...context.options[0] };

    const source = context.getSourceCode();

    importDeclarations(source)
        .reduce<ImportDeclaration[][]>(
            (result, node, index, imports) => {
                if (index > 0 && linesBetween(imports[index - 1], node) > 0) {
                    result.push([]);
                }

                result[result.length - 1].push(node);

                return result;
            },
            [[]],
        )
        .forEach((group) => {
            sortModules(context, source, configuration, group);
            group.forEach((node) => {
                sortSpecifiers(
                    context,
                    source,
                    configuration,
                    node.specifiers.filter(($): $ is ImportSpecifier => $.type === 'ImportSpecifier'),
                );
            });
        });

    return {};
}
