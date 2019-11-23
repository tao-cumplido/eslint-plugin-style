import { Rule, SourceCode } from 'eslint';
import { ImportDeclaration, ImportSpecifier } from 'estree';

import { extrema, fixRange, importDeclarations, linesBetween, sortBy, SortOptions } from '../util';

export interface Configuration extends SortOptions {
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
        fixRange(context, {
            range: extrema(group),
            message: `Expected modules in group to be sorted`,
            code: sorted.map((node) => source.getText(node)).join('\n'),
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
        fixRange(context, {
            range: extrema(specifiers),
            message: `Expected specifiers to be sorted`,
            code: sorted.map((node) => source.getText(node)).join(', '),
        });
    }
}

export const rule: Rule.RuleModule = {
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
                },
            },
        ],
    },
    create(context) {
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
    },
};
