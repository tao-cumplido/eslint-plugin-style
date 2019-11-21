import { javascript, LintReporter, LintResult } from '../util/test';
import { Configuration, rule } from './sort';

describe('rule: sort', () => {
    const reporter = new LintReporter<Configuration>(rule);

    describe('valid code', () => {
        test('no imports', () => {
            const report = reporter.lint('');
            expect(report.result).toEqual(LintResult.Valid);
        });

        test('sorted modules', () => {
            const report = reporter.lint(javascript`
                import 'bar';
                import 'foo';
            `);

            expect(report.result).toEqual(LintResult.Valid);
        });

        test('separate groups', () => {
            const report = reporter.lint(javascript`
                import 'foo';

                import 'bar';
            `);

            expect(report.result).toEqual(LintResult.Valid);
        });

        test('sorted specifiers', () => {
            const report = reporter.lint(javascript`
                import { a, b } from 'foo';
            `);

            expect(report.result).toEqual(LintResult.Valid);
        });

        test('2 < 10', () => {
            const report = reporter.lint(javascript`
                import { a2, a10 } from 'foo';
            `);

            expect(report.result).toEqual(LintResult.Valid);
        });

        test('renamed specifiers', () => {
            const report = reporter.lint(javascript`
                import { a as b, b as a} from 'foo';
            `);

            expect(report.result).toEqual(LintResult.Valid);
        });
    });

    describe('invalid code', () => {
        test('unsorted modules', () => {
            const report = reporter.lint(javascript`
                import 'foo';
                import 'bar';
            `);

            expect(report.result).toEqual(LintResult.Fixed);
            expect(report.errors).toHaveLength(1);
            expect(report.code).toEqual(javascript`
                import 'bar';
                import 'foo';
            `);
        });

        test('unsorted specifiers', () => {
            const report = reporter.lint(javascript`
                import { b, a } from 'foo';
            `);

            expect(report.result).toEqual(LintResult.Fixed);
            expect(report.errors).toHaveLength(1);
            expect(report.code).toEqual(javascript`
                import { a, b } from 'foo';
            `);
        });

        test('mixed case specifiers', () => {
            const report = reporter.lint(javascript`
                import { Ab, ba, Ba, ab } from 'foo';
            `);

            expect(report.result).toEqual(LintResult.Fixed);
            expect(report.errors).toHaveLength(1);
            expect(report.code).toEqual(javascript`
                import { ab, Ab, ba, Ba } from 'foo';
            `);
        });

        test('case groups', () => {
            const report = reporter.lint(
                javascript`
                    import { Ab, ba, Ba, ab } from 'foo';
                `,
                {
                    caseGroups: true,
                },
            );

            expect(report.result).toEqual(LintResult.Fixed);
            expect(report.errors).toHaveLength(1);
            expect(report.code).toEqual(javascript`
                import { ab, ba, Ab, Ba } from 'foo';
            `);
        });

        test('case groups, upper first', () => {
            const report = reporter.lint(
                javascript`
                    import { Ab, ba, Ba, ab } from 'foo';
                `,
                {
                    caseGroups: true,
                    caseFirst: 'upper',
                },
            );

            expect(report.result).toEqual(LintResult.Fixed);
            expect(report.errors).toHaveLength(1);
            expect(report.code).toEqual(javascript`
                import { Ab, Ba, ab, ba } from 'foo';
            `);
        });

        test('2 > 10', () => {
            const report = reporter.lint(
                javascript`
                    import { a2, a10 } from 'foo';
                `,
                {
                    numeric: false,
                },
            );

            expect(report.result).toEqual(LintResult.Fixed);
            expect(report.errors).toHaveLength(1);
            expect(report.code).toEqual(javascript`
                import { a10, a2 } from 'foo';
            `);
        });

        test('unsorted local specifiers', () => {
            const report = reporter.lint(
                javascript`
                    import { a as b, b as a } from 'foo';
                `,
                {
                    specifier: 'local',
                },
            );

            expect(report.result).toEqual(LintResult.Fixed);
            expect(report.errors).toHaveLength(1);
            expect(report.code).toEqual(javascript`
                import { b as a, a as b } from 'foo';
            `);
        });
    });
});
