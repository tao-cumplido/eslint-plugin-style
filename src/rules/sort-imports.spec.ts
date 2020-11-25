import { code, LintReporter, LintResult } from '../util/test';
import { rule } from './sort-imports';

describe('rule: sort-imports', () => {
	const reporter = new LintReporter(rule);

	describe('valid code', () => {
		test('no imports/exports', () => {
			const report = reporter.lint(code``, []);
			expect(report.result).toEqual(LintResult.Valid);
		});

		test('sorted modules', () => {
			const report = reporter.lint(
				code`
					import 'bar';
					import 'foo';

					export * from 'bar';
					export * from 'foo';
				`,
				[],
			);

			expect(report.result).toEqual(LintResult.Valid);
		});

		test('scoped first', () => {
			const report = reporter.lint(
				code`
					import '@angular/core';
					import 'rxjs';
				`,
				[{ caseGroups: true }],
			);

			expect(report.result).toEqual(LintResult.Valid);
		});

		test('separate groups', () => {
			const report = reporter.lint(
				code`
					import 'foo';

					import 'bar';
				`,
				[],
			);

			expect(report.result).toEqual(LintResult.Valid);
		});

		test('sorted specifiers', () => {
			const report = reporter.lint(
				code`
					import { a, b } from 'foo';
				`,
				[],
			);

			expect(report.result).toEqual(LintResult.Valid);
		});

		test('2 < 10', () => {
			const report = reporter.lint(
				code`
					import { a2, a10 } from 'foo';
				`,
				[],
			);

			expect(report.result).toEqual(LintResult.Valid);
		});

		test('renamed specifiers', () => {
			const report = reporter.lint(
				code`
					import { a as b, b as a} from 'foo';
				`,
				[],
			);

			expect(report.result).toEqual(LintResult.Valid);
		});

		test('ignore local exports', () => {
			const report = reporter.lint(
				code`
					export const foo = 1;
					export const bar = 2;
				`,
				[],
			);

			expect(report.result).toEqual(LintResult.Valid);
		});
	});

	describe('invalid code', () => {
		test('unsorted modules', () => {
			const report = reporter.lint(
				code`
					import 'foo';
					import 'bar';

					export * from 'foo';
					export * from 'bar';
				`,
				[],
			);

			expect(report.result).toEqual(LintResult.Fixed);
			expect(report.errors).toHaveLength(2);
			expect(report.code).toEqual(code`
				import 'bar';
				import 'foo';

				export * from 'bar';
				export * from 'foo';
			`);
		});

		test('unsorted specifiers', () => {
			const report = reporter.lint(
				code`
					import { b, a } from 'foo';

					export { b, a } from 'foo';
				`,
				[],
			);

			expect(report.result).toEqual(LintResult.Fixed);
			expect(report.errors).toHaveLength(2);
			expect(report.code).toEqual(code`
				import { a, b } from 'foo';

				export { a, b } from 'foo';
			`);
		});

		test('mixed case specifiers', () => {
			const report = reporter.lint(
				code`
					import { Ab, ba, Ba, ab } from 'foo';
				`,
				[],
			);

			expect(report.result).toEqual(LintResult.Fixed);
			expect(report.errors).toHaveLength(1);
			expect(report.code).toEqual(code`
				import { ab, Ab, ba, Ba } from 'foo';
			`);
		});

		test('case groups', () => {
			const report = reporter.lint(
				code`
					import { Ab, ba, Ba, ab } from 'foo';
				`,
				[{ caseGroups: true }],
			);

			expect(report.result).toEqual(LintResult.Fixed);
			expect(report.errors).toHaveLength(1);
			expect(report.code).toEqual(code`
				import { ab, ba, Ab, Ba } from 'foo';
			`);
		});

		test('case groups, upper first', () => {
			const report = reporter.lint(
				code`
					import { Ab, ba, Ba, ab } from 'foo';
				`,
				[{ caseGroups: true, caseFirst: 'upper' }],
			);

			expect(report.result).toEqual(LintResult.Fixed);
			expect(report.errors).toHaveLength(1);
			expect(report.code).toEqual(code`
				import { Ab, Ba, ab, ba } from 'foo';
			`);
		});

		test('2 > 10', () => {
			const report = reporter.lint(
				code`
					import { a2, a10 } from 'foo';
				`,
				[{ numeric: false }],
			);

			expect(report.result).toEqual(LintResult.Fixed);
			expect(report.errors).toHaveLength(1);
			expect(report.code).toEqual(code`
				import { a10, a2 } from 'foo';
			`);
		});

		test('unsorted local specifiers', () => {
			const report = reporter.lint(
				code`
					import { a as b, b as a } from 'foo';
				`,
				[{ specifier: 'rename' }],
			);

			expect(report.result).toEqual(LintResult.Fixed);
			expect(report.errors).toHaveLength(1);
			expect(report.code).toEqual(code`
				import { b as a, a as b } from 'foo';
			`);
		});
	});
});
