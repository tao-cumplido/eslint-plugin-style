import { code, LintReporter, LintResult } from '../../util/test';
import { rule } from './no-commented-code';

describe('rule: no-commented-code', () => {
	const reporter = new LintReporter(rule);

	const tsParser = {
		parser: '@typescript-eslint/parser',
	};

	describe('valid code', () => {
		test('no comments', () => {
			const report = reporter.lint('');
			expect(report.result).toEqual(LintResult.Valid);
		});

		test('docstyle comment can contain code', () => {
			const report = reporter.lint(code`
				/**
				 * const foo = 1;
				 */
			`);

			expect(report.result).toEqual(LintResult.Valid);
		});

		test('line comments (JS)', () => {
			const report = reporter.lint(code`
				// hello world
				console.log(0); // !
			`);

			expect(report.result).toEqual(LintResult.Valid);
		});

		test('line comments (TS)', () => {
			const report = reporter.lint(code`
				// hello world
				console.log(0); // !
			`, [], tsParser);

			expect(report.result).toEqual(LintResult.Valid);
		});

		test('directive comments', () => {
			const report = reporter.lint(code`
				// @ts-expect-error
				// eslint-disable-next-line
				// const foo = 1;
			`);

			expect(report.result).toEqual(LintResult.Valid);
		});

		test('commented typescript in js is valid', () => {
			const report = reporter.lint(code`
				// type Foo<T> = T;
			`);

			expect(report.result).toEqual(LintResult.Valid);
		});
	});

	describe('invalid code', () => {
		test('single line comment', () => {
			const report = reporter.lint(code`
				// console.log(0);
			`);

			expect(report.result).toEqual(LintResult.Invalid);
			expect(report.errors).toHaveLength(1);
		});

		test('single block comment on one line', () => {
			const report = reporter.lint(code`
				/* console.log(0); */
			`);

			expect(report.result).toEqual(LintResult.Invalid);
			expect(report.errors).toHaveLength(1);
		});

		test('single block comment over multiple lines', () => {
			const report = reporter.lint(code`
				/*
				const foo = 0;
				console.log(foo);
				*/
			`);

			expect(report.result).toEqual(LintResult.Invalid);
			expect(report.errors).toHaveLength(1);
		});

		test('multiple block comments on one line', () => {
			const report = reporter.lint(code`
				console.log(0, /* 1, */ 2, /* 3 */);
			`);

			expect(report.result).toEqual(LintResult.Invalid);
			expect(report.errors).toHaveLength(2);
		});

		test('commented entry in multiline list', () => {
			const report = reporter.lint(code`
				const foo = [
					0,
					// 1,
					2,
				];
			`);

			expect(report.result).toEqual(LintResult.Invalid);
			expect(report.errors).toHaveLength(1);
		});

		test('typescript parser', () => {
			const report = reporter.lint(
				code`
					// type Foo<T> = T;
				`,
				[],
				tsParser,
			);

			expect(report.result).toEqual(LintResult.Invalid);
			expect(report.errors).toHaveLength(1);
		});

		test('urls can be detected as labeled statement', () => {
			const report = reporter.lint(code`
				// https://www.example.com/
				{}
			`);

			expect(report.result).toEqual(LintResult.Invalid);
			expect(report.errors).toHaveLength(1);
		});

		test('ignore patterns', () => {
			const report = reporter.lint(
				code`
					// foo.toString();
					// bar.toString();
				`,
				[
					{
						ignorePatterns: ['^foo'],
					},
				],
			);

			expect(report.result).toEqual(LintResult.Invalid);
			expect(report.errors).toHaveLength(1);
		});

		test('typescript ranges parser option', () => {
			const report = reporter.lint(
				code`
					// function foo(a) { return a; }
				`,
				[],
				tsParser,
			);

			expect(report.result).toEqual(LintResult.Invalid);
			expect(report.errors).toHaveLength(1);
		});

		test('consecutive line comments', () => {
			const report = reporter.lint(code`
				// if (foo) {
				//    bar();
				// }
			`);

			expect(report.result).toEqual(LintResult.Invalid);
			expect(report.errors).toHaveLength(3);
		});

		test('split comments matching block', () => {
			const report = reporter.lint(code`
				// if (foo) {
					bar();
				// }
			`);

			expect(report.result).toEqual(LintResult.Invalid);
			expect(report.errors).toHaveLength(2);
		});
	});
});
