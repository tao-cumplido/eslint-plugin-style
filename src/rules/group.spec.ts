import { RuleTester } from 'eslint';

import * as group from './group';

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

tester.run('group', group, {
    valid: [
        {
            code: '',
        },
        {
            code: trim`
                import 'fs';
                import 'path';

                import 'foo';
                import 'bar';

                import '/';

                import '../foo';
                import './bar';
            `,
        },
        {
            code: trim`
                import 'fs';

                import 'foo';
            `,
        },
        {
            code: trim`
                import 'foo';

                import 'fs';
            `,
            options: [
                {
                    groups: ['#EXTERNAL', '#NODE'],
                },
            ],
        },
        {
            code: trim`
                import 'fs';

                import 'path';
            `,
            options: [
                {
                    groups: ['fs', '#NODE'],
                },
            ],
        },
    ],
    invalid: [
        {
            code: trim`
                import 'fs';
                import 'foo';
            `,
            output: trim`
                import 'fs';

                import 'foo';
            `,
            errors: 1,
        },
        {
            code: trim`
                import 'foo';
                import 'fs';
            `,
            output: trim`
                import 'fs';

                import 'foo';
            `,
            errors: 1,
        },
        {
            code: trim`
                import 'fs';


                import 'foo';
            `,
            output: trim`
                import 'fs';

                import 'foo';
            `,
            errors: 1,
        },
        {
            code: trim`
                import 'fs';

                import 'path';
            `,
            output: trim`
                import 'fs';
                import 'path';
            `,
            errors: 1,
        },
        {
            code: trim`
                import './foo';
                import 'foo';
                import 'fs';
            `,
            output: trim`
                import 'fs';

                import 'foo';

                import './foo';
            `,
            errors: 1,
        },
        {
            code: trim`
                import 'foo';

                import 'fs';

                import 'path';

                import 'bar';
            `,
            output: trim`
                import 'fs';
                import 'path';

                import 'foo';
                import 'bar';
            `,
            errors: 1,
        },
        {
            code: trim`
                import 'fs';

                import 'path';

                import 'foo';

                import 'bar';
            `,
            output: trim`
                import 'fs';
                import 'path';

                import 'foo';
                import 'bar';
            `,
            errors: 2,
        },
        {
            code: trim`
                import 'fs';

                import 'path';
                import 'foo';

                import 'bar';
            `,
            output: trim`
                import 'fs';
                import 'path';

                import 'foo';
                import 'bar';
            `,
            errors: 3,
        },
        {
            code: trim`
                import 'foo/a';
                import 'fs';
                import 'foo/b';
                import '/';
                import 'foo/c';
                import 'bar';
                import 'foo/d';
            `,
            output: trim`
                import 'fs';
                import '/';

                import 'foo/a';
                import 'foo/b';
                import 'foo/c';
                import 'foo/d';

                import 'bar';
            `,
            options: [
                {
                    groups: [['#NODE', '#ABSOLUTE'], 'foo'],
                },
            ],
            errors: 1,
        },
    ],
});
