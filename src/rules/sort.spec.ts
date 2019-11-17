import { RuleTester } from 'eslint';

import * as sort from './sort';

const tester = new RuleTester({
    parserOptions: {
        ecmaVersion: 2019,
        sourceType: 'module',
    },
});

function trim([code]: TemplateStringsArray) {
    return code
        .split('\n')
        .map((line) => line.trim())
        .join('\n');
}

tester.run('sort', sort, {
    valid: [
        {
            code: trim`
                import 'bar';
                import 'foo';
            `,
        },
        {
            code: trim`
                import 'foo';

                import 'bar';
            `,
        },
        {
            code: trim`
                import { a, b } from 'foo';
            `,
        },
        {
            code: trim`
                import { a2, a10 } from 'foo';
            `,
        },
        {
            code: trim`
                import { a as b, b as a } from 'foo';
            `,
        },
    ],
    invalid: [
        {
            code: trim`
                import 'foo';
                import 'bar';
            `,
            output: trim`
                import 'bar';
                import 'foo';
            `,
            errors: 1,
        },
        {
            code: trim`
                import { b, a } from 'foo';
            `,
            output: trim`
                import { a, b } from 'foo';
            `,
            errors: 1,
        },
        {
            code: trim`
                import { A, b, B, a } from 'foo';
            `,
            output: trim`
                import { a, A, b, B } from 'foo';
            `,
            errors: 1,
        },
        {
            code: trim`
                import { A, b, B, a } from 'foo';
            `,
            output: trim`
                import { a, b, A, B } from 'foo';
            `,
            options: [
                {
                    caseGroups: true,
                },
            ],
            errors: 1,
        },
        {
            code: trim`
                import { A, b, B, a } from 'foo';
            `,
            output: trim`
                import { A, B, a, b } from 'foo';
            `,
            options: [
                {
                    caseGroups: true,
                    caseFirst: 'upper',
                },
            ],
            errors: 1,
        },
        {
            code: trim`
                import { a2, a10 } from 'foo';
            `,
            output: trim`
                import { a10, a2 } from 'foo';
            `,
            options: [
                {
                    numeric: false,
                },
            ],
            errors: 1,
        },
        {
            code: trim`
                import { a as b, b as a } from 'foo';
            `,
            output: trim`
                import { b as a, a as b } from 'foo';
            `,
            options: [
                {
                    specifier: 'local',
                },
            ],
            errors: 1,
        },
    ],
});
