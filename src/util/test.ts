import Ajv from 'ajv';
import { Linter } from 'eslint';

import type { PartialMap, RuleModule } from './rule';

export function code([source]: TemplateStringsArray): string {
	return source
		.split('\n')
		.map((line) => line.trim())
		.join('\n')
		.trim();
}

export enum LintResult {
	Valid = 'valid',
	Invalid = 'invalid',
	Fixed = 'fixed',
}

export interface LintReport {
	result: LintResult;
	code: string;
	errors: Linter.LintMessage[];
}

export class AggregateError extends Error {
	readonly name = 'AggregateError';
	constructor(readonly errors: readonly Error[], readonly message: string) {
		super(message);
	}
}

export class LintReporter<Configuration extends unknown[]> {
	private static readonly ajv = new Ajv({
		verbose: true,
		allErrors: true,
	});

	private readonly linter = new Linter();

	constructor(private readonly rule: RuleModule<Configuration>) {
		this.linter.defineRule('test', rule);
	}

	lint(source: string, options: PartialMap<Configuration> = [] as PartialMap<Configuration>, linterConfig?: Linter.Config, filename?: string): LintReport {
		const schemas = this.rule.meta?.schema instanceof Array ? this.rule.meta.schema : this.rule.meta?.schema ? [this.rule.meta.schema] : [];

		if (!options.every((option, index) => LintReporter.ajv.validate(schemas[index], option))) {
			throw new Error(LintReporter.ajv.errorsText());
		}

		const config: Linter.Config = {
			...linterConfig,
			parserOptions: {
				ecmaVersion: 2018,
				sourceType: 'module',
				...linterConfig?.parserOptions,
			},
			rules: {
				test: ['error', ...options],
			},
		};

		if (config.parser) {
			// eslint-disable-next-line @typescript-eslint/no-require-imports
			this.linter.defineParser(config.parser, require(config.parser));
		}

		const errorReport = this.linter.verify(source, config, filename);
		const fatalParsingErrors = errorReport.filter(({ fatal }) => fatal).map(({ message }) => new Error(message));

		if (fatalParsingErrors.length) {
			throw new AggregateError(fatalParsingErrors, 'parsing error before fix');
		}

		const fixReport = this.linter.verifyAndFix(source, config, filename);
		const fatalFixErrors = fixReport.messages.filter(({ fatal }) => fatal).map(({ message }) => new Error(message));

		if (fatalFixErrors.length) {
			throw new AggregateError(fatalFixErrors, 'parsing error after fix');
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
			errors: errorReport,
		};
	}
}
