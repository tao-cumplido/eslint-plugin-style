import { code, LintReporter, LintResult } from '../util/test';
import { rule, GroupClass } from './group-imports';

describe('rule: group-imports', () => {
	const reporter = new LintReporter(rule);

	describe('valid code', () => {
		test('no imports', () => {
			const report = reporter.lint('');
			expect(report.result).toEqual(LintResult.Valid);
		});

		test('default groups', () => {
			const report = reporter.lint(code`
				import 'fs';
				import 'path';

				import 'foo';
				import 'bar';

				import '/';

				import '../foo';
				import './bar';
			`);

			expect(report.result).toEqual(LintResult.Valid);
		});

		test('custom group order', () => {
			const report = reporter.lint(
				code`
					import 'foo';

					import 'fs';
				`,
				[
					{
						groups: [GroupClass.External, GroupClass.Node],
					},
				],
			);

			expect(report.result).toEqual(LintResult.Valid);
		});

		test('explicit package precedence', () => {
			const report = reporter.lint(
				code`
					import 'fs';

					import 'foo';

					import 'path';
				`,
				[
					{
						groups: ['fs', GroupClass.External, GroupClass.Node],
					},
				],
			);

			expect(report.result).toEqual(LintResult.Valid);
		});

		test('mixed groups', () => {
			const report = reporter.lint(
				code`
					import 'fs';
					import 'foo';
					import 'path';
				`,
				[
					{
						groups: [[GroupClass.Node, GroupClass.External]],
					},
				],
			);

			expect(report.result).toEqual(LintResult.Valid);
		});
	});

	describe('invalid code', () => {
		test('missing new line between groups', () => {
			const report = reporter.lint(code`
				import 'fs';
				import 'foo';
			`);

			expect(report.result).toEqual(LintResult.Fixed);
			expect(report.errors).toHaveLength(1);
			expect(report.code).toEqual(code`
				import 'fs';

				import 'foo';
			`);
		});

		test('too many lines between groups', () => {
			const report = reporter.lint(code`
				import 'fs';


				import 'foo';
			`);

			expect(report.result).toEqual(LintResult.Fixed);
			expect(report.errors).toHaveLength(1);
			expect(report.code).toEqual(code`
				import 'fs';

				import 'foo';
			`);
		});

		test('invalid new line in group', () => {
			const report = reporter.lint(code`
				import 'fs';

				import 'path';
			`);

			expect(report.result).toEqual(LintResult.Fixed);
			expect(report.errors).toHaveLength(1);
			expect(report.code).toEqual(code`
				import 'fs';
				import 'path';
			`);
		});

		test('wrong group order', () => {
			const report = reporter.lint(code`
				import 'foo';

				import 'fs';
			`);

			expect(report.result).toEqual(LintResult.Fixed);
			expect(report.errors).toHaveLength(1);
			expect(report.code).toEqual(code`
				import 'fs';

				import 'foo';
			`);
		});

		test('ungrouped', () => {
			const report = reporter.lint(code`
				import './bar';
				import 'foo';
				import 'fs';
			`);

			expect(report.result).toEqual(LintResult.Fixed);
			expect(report.errors).toHaveLength(1);
			expect(report.code).toEqual(code`
				import 'fs';

				import 'foo';

				import './bar';
			`);
		});

		test('delimited group', () => {
			const report = reporter.lint(code`
				import 'foo';

				import 'fs';
				import 'path';

				import 'bar';
			`);

			expect(report.result).toEqual(LintResult.Fixed);
			expect(report.errors).toHaveLength(1);
			expect(report.code).toEqual(code`
				import 'fs';
				import 'path';

				import 'foo';
				import 'bar';
			`);
		});

		test('separated groups', () => {
			const report = reporter.lint(code`
				import 'fs';

				import 'path';

				import 'foo';

				import 'bar';
			`);

			expect(report.result).toEqual(LintResult.Fixed);
			expect(report.errors).toHaveLength(2);
			expect(report.code).toEqual(code`
				import 'fs';
				import 'path';

				import 'foo';
				import 'bar';
			`);
		});

		test('invalid new lines and missing new lines', () => {
			const report = reporter.lint(code`
				import 'fs';

				import 'path';
				import 'foo';

				import 'bar';
			`);

			expect(report.result).toEqual(LintResult.Fixed);
			expect(report.errors).toHaveLength(3);
			expect(report.code).toEqual(code`
				import 'fs';
				import 'path';

				import 'foo';
				import 'bar';
			`);
		});

		test('scope group and implicit catch-all-group', () => {
			const report = reporter.lint(
				code`
					import 'foo/a';
					import 'fs';
					import 'foo/b';
					import '/';
					import './bar';
					import 'foo/c';
					import 'baz';
					import 'foo/d';
				`,
				[
					{
						groups: [[GroupClass.Node, GroupClass.Absolute], 'foo'],
					},
				],
			);

			expect(report.result).toEqual(LintResult.Fixed);
			expect(report.errors).toHaveLength(1);
			expect(report.code).toEqual(code`
				import 'fs';
				import '/';

				import 'foo/a';
				import 'foo/b';
				import 'foo/c';
				import 'foo/d';

				import './bar';
				import 'baz';
			`);
		});

		test('other code between imports', () => {
			const report = reporter.lint(code`
				import 'foo';
				console.log(0);
				import 'bar';
			`);

			expect(report.result).toEqual(LintResult.Invalid);
			expect(report.errors).toHaveLength(1);
		});
	});
});
