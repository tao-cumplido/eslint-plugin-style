import { Linter, Rule } from 'eslint';

export function javascript([code]: TemplateStringsArray) {
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

export class LintReporter<T extends object = object> {
    private linter = new Linter();

    constructor(rule: Rule.RuleModule) {
        this.linter.defineRule('test', rule);
    }

    lint(code: string, options?: Partial<T>): LintReport {
        const config: Linter.Config = {
            parserOptions: {
                ecmaVersion: 2018,
                sourceType: 'module',
            },
            rules: {
                test: ['error', options],
            },
        };

        const errorReport = this.linter.verify(code, config);

        if (errorReport.some(({ fatal }) => fatal)) {
            throw new Error(`parsing error before fix`);
        }

        const fixReport = this.linter.verifyAndFix(code, config);

        if (fixReport.messages.some(({ fatal }) => fatal)) {
            throw new Error(`parsing error after fix`);
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
