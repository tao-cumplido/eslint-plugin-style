import type { AST, Linter } from 'eslint';

import type { RuleModule } from '../../util';

interface Parser {
	parse?: (code: string, options?: Linter.ParserOptions) => AST.Program;
	// eslint-disable-next-line @typescript-eslint/naming-convention
	parseForESLint?: (code: string, options?: Linter.ParserOptions) => Linter.ESLintParseResult;
}

export interface Configuration {
	ignorePatterns: string[];
	extendDefaultIgnorePatterns: boolean;
}

const defaultConfiguration: Configuration = {
	ignorePatterns: ['^eslint-', '^@ts-'],
	extendDefaultIgnorePatterns: false,
};

function mapPatternReducer(result: RegExp[], pattern: string) {
	try {
		result.push(new RegExp(pattern, 'u'));
	} catch {}

	return result;
}

function parseIgnorePatterns(config?: Partial<Configuration>) {
	if (!config?.ignorePatterns) {
		return;
	}

	const ignorePatterns = new Set(config.ignorePatterns);

	if (config.extendDefaultIgnorePatterns) {
		defaultConfiguration.ignorePatterns.forEach((pattern) => ignorePatterns.add(pattern));
	}

	return [...ignorePatterns].reduce(mapPatternReducer, []);
}

export const rule: RuleModule<[Configuration]> = {
	create(context) {
		function isSyntaxError(error: unknown) {
			if (error instanceof SyntaxError) {
				return true;
			}

			return context.parserPath.includes('@typescript-eslint/parser') && !(error instanceof Error);
		}

		// eslint-disable-next-line @typescript-eslint/no-require-imports
		const parser = require(context.parserPath) as unknown as Parser;
		const source = context.getSourceCode();

		const ignorePatterns = parseIgnorePatterns(context.options[0]) ?? defaultConfiguration.ignorePatterns.reduce(mapPatternReducer, []);

		for (const comment of source.getAllComments().filter(({ value }) => ignorePatterns.every((pattern) => !pattern.test(value.trim())))) {
			if (!comment.loc) {
				continue;
			}

			const lines = [...source.getLines()];

			if (comment.type === 'Line') {
				const lineIndex = comment.loc.start.line - 1;
				const line = [...lines[lineIndex]];

				line.splice(comment.loc.start.column, 2);

				lines[lineIndex] = line.join('');
			} else {
				const startIndex = comment.loc.start.line - 1;
				const endIndex = comment.loc.end.line - 1;

				const start = [...lines[startIndex]];

				start.splice(comment.loc.start.column, 2);

				if (startIndex === endIndex) {
					start.splice(comment.loc.end.column - 4, 2);
				} else {
					const end = [...lines[endIndex]];
					end.splice(comment.loc.end.column - 2, 2);
					lines[endIndex] = end.join('');
				}

				lines[startIndex] = start.join('');
			}

			try {
				const parse = parser.parse ?? parser.parseForESLint;
				parse?.(lines.join('\n'), {
					...context.parserOptions,
					// provide same parser defaults as eslint (https://github.com/eslint/eslint/blob/82669fa66670a00988db5b1d10fe8f3bf30be84e/lib/linter/linter.js#L636-L645)
					// the typescript parser would potentially error without the 'filePath' or 'range' options (https://github.com/typescript-eslint/typescript-eslint/issues/2742)
					loc: true,
					range: true,
					raw: true,
					tokens: true,
					comment: true,
					eslintVisitorKeys: true,
					eslintScopeManager: true,
					filePath: context.getFilename(),
				});
				context.report({
					loc: comment.loc,
					message: `comment contains code: ${comment.value}`,
				});
			} catch (error: unknown) {
				if (isSyntaxError(error)) {
					// comment is not code
					return {};
				}

				throw error;
			}
		}

		return {};
	},
};
