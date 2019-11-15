module.exports = {
    extends: ['eslint:recommended', 'prettier', 'plugin:prettier/recommended'],
    parserOptions: {
        ecmaVersion: 2018,
    },
    rules: {
        // possible errors
        'no-cond-assign': ['error', 'always'],
        // best practices
        'curly': 'error',
        'eqeqeq': ['error', 'always'],
        'max-classes-per-file': 'error',
        'no-else-return': 'error',
        'no-empty-function': 'error',
        'no-eval': 'error',
        'no-floating-decimal': 'error',
        'no-implicit-coercion': 'error',
        'no-labels': 'error',
        'no-multi-str': 'error',
        'no-new': 'error',
        'no-new-func': 'error',
        'no-octal-escape': 'error',
        'no-return-assign': 'error',
        'no-return-await': 'error',
        'no-self-compare': 'error',
        'no-sequences': 'error',
        'no-throw-literal': 'error',
        'no-unused-expressions': 'error',
        'no-useless-call': 'error',
        'no-useless-concat': 'error',
        'no-useless-return': 'error',
        'no-void': 'error',
        'no-warning-comments': ['error', { location: 'anywhere' }],
        'prefer-promise-reject-errors': 'error',
        'require-await': 'error',
        'wrap-iife': 'error',
        'yoda': 'error',
        // variables
        'no-shadow': 'error',
        'no-undef': 'off',
        'no-undef-init': 'error',
        // stylistic issues
        'camelcase': 'error',
        'no-lonely-if': 'error',
        'no-mixed-operators': 'error',
        'no-multi-assign': 'error',
        'no-negated-condition': 'error',
        'no-nested-ternary': 'error',
        'no-new-object': 'error',
        'no-underscore-dangle': ['error', { allow: ['_'], enforceInMethodNames: true }],
        'no-unneeded-ternary': 'error',
        'prefer-object-spread': 'error',
        // es6
        'no-useless-computed-key': 'error',
        'no-var': 'error',
        'object-shorthand': 'error',
        'prefer-arrow-callback': 'error',
        'prefer-const': 'error',
        'prefer-rest-params': 'error',
        'prefer-spread': 'error',
        'prefer-template': 'error',
        'require-yield': 'error',
        'sort-imports': 'off',
        'symbol-description': 'error',
    },
    overrides: [
        {
            files: '*.ts',
            parser: '@typescript-eslint/parser',
            extends: [
                'eslint:recommended',
                'plugin:@typescript-eslint/eslint-recommended',
                'plugin:@typescript-eslint/recommended',
                'plugin:@typescript-eslint/recommended-requiring-type-checking',
                'prettier',
                'prettier/@typescript-eslint',
                'plugin:prettier/recommended',
            ],
            parserOptions: {
                ecmaVersion: 2018,
                project: ['./tsconfig.json'],
            },
            rules: {
                '@typescript-eslint/array-type': ['error', { default: 'array-simple' }],
                '@typescript-eslint/explicit-function-return-type': 'off',
                '@typescript-eslint/explicit-member-accessibility': ['error', { accessibility: 'no-public' }],
                '@typescript-eslint/no-explicit-any': 'error',
                '@typescript-eslint/no-non-null-assertion': 'error',
                '@typescript-eslint/no-require-imports': 'error',
                '@typescript-eslint/no-unnecessary-type-arguments': 'error',
                '@typescript-eslint/no-unused-vars': 'error',
                '@typescript-eslint/no-useless-constructor': 'error',
            },
        },
    ],
};
