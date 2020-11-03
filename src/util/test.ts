import { Linter } from 'eslint';

import type { PartialMap, RuleModule } from './types';



export function javascript([code]: TemplateStringsArray): string {
	return code
		.split('\n')
		.map((line) => line.trim())
		.join('\n');
}

export enum LintResult {
	Valid = 'valid',
	Invalid = 'invalid',
	Fixed = 'fixed',
}

export interface LintReport {
	result: LintResult;
	code: string;
	errors: string[];
}

export class LintReporter<Configuration extends unknown[]> {
	private readonly linter = new Linter();

	constructor(rule: RuleModule<Configuration>) {
		this.linter.defineRule('test', rule);
	}

	lint(code: string, options: PartialMap<Configuration> = [] as PartialMap<Configuration>, linterConfig?: Linter.Config): LintReport {
		const config: Linter.Config = {
			parserOptions: {
				ecmaVersion: 2018,
				sourceType: 'module',
			},
			...linterConfig,
			rules: {
				test: ['error', ...options],
			},
		};

		if (config.parser) {
			// eslint-disable-next-line @typescript-eslint/no-require-imports
			this.linter.defineParser(config.parser, require(config.parser));
		}

		const errorReport = this.linter.verify(code, config);

		if (errorReport.some(({ fatal }) => fatal)) {
			throw new Error('parsing error before fix');
		}

		const fixReport = this.linter.verifyAndFix(code, config);

		if (fixReport.messages.some(({ fatal }) => fatal)) {
			throw new Error('parsing error after fix');
		}

		let result = LintResult.Valid;

		if (fixReport.fixed) {
			result = LintResult.Fixed;
		} else if (errorReport.length > 0) {
			result = LintResult.Invalid;
		}

		return {
			result,
			code: fixReport.output,
			errors: errorReport.map(({ message }) => message),
		};
	}
}
