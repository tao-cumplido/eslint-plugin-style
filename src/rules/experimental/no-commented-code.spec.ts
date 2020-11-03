import { javascript, LintReporter, LintResult } from '../../util/test';
import { rule } from './no-commented-code';

describe('rule: no-commented-code', () => {
	const reporter = new LintReporter(rule);

	describe('valid code', () => {
		test('no comments', () => {
			const report = reporter.lint('');
			expect(report.result).toEqual(LintResult.Valid);
		});

		test('docstyle comment can contain code', () => {
			const report = reporter.lint(javascript`
				/**
				 * const foo = 1;
				 */
			`);

			expect(report.result).toEqual(LintResult.Valid);
		});

		test('line comments', () => {
			const report = reporter.lint(javascript`
				// hello world
				console.log(0); // !
			`);

			expect(report.result).toEqual(LintResult.Valid);
		});

		test('directive comments', () => {
			const report = reporter.lint(javascript`
				// @ts-expect-error
				// eslint-disable-next-line
				// const foo = 1;
			`);

			expect(report.result).toEqual(LintResult.Valid);
		});

		test('commented typescript', () => {
			const report = reporter.lint(javascript`
				// type Foo<T> = T;
			`);

			expect(report.result).toEqual(LintResult.Valid);
		});
	});

	describe('invalid code', () => {
		test('single line comment', () => {
			const report = reporter.lint(javascript`
				// console.log(0);
			`);

			expect(report.result).toEqual(LintResult.Invalid);
			expect(report.errors).toHaveLength(1);
		});

		test('single block comment on one line', () => {
			const report = reporter.lint(javascript`
				/* console.log(0); */
			`);

			expect(report.result).toEqual(LintResult.Invalid);
			expect(report.errors).toHaveLength(1);
		});

		test('single block comment over multiple lines', () => {
			const report = reporter.lint(javascript`
				/*
				const foo = 0;
				console.log(foo);
				*/
			`);

			expect(report.result).toEqual(LintResult.Invalid);
			expect(report.errors).toHaveLength(1);
		});

		test('multiple block comments on one line', () => {
			const report = reporter.lint(javascript`
				console.log(0, /* 1, */ 2, /* 3 */);
			`);

			expect(report.result).toEqual(LintResult.Invalid);
			expect(report.errors).toHaveLength(2);
		});

		test('commented entry in multiline list', () => {
			const report = reporter.lint(javascript`
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
				javascript`
					// type Foo<T> = T;
				`,
				[],
				{ parser: '@typescript-eslint/parser' },
			);

			expect(report.result).toEqual(LintResult.Invalid);
			expect(report.errors).toHaveLength(1);
		});
	});
});
