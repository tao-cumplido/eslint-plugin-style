# eslint-plugin-module-imports

> ESLint plugin for ES6 style module imports

[![NPM Version][npm-image]][npm-url]

Configurable ESLint rules to group and sort ES6 style module imports, `require` imports are not supported.

In contrast to eslint-plugin-import, this plugin doesn't attempt to actually resolve the imports.

## Install

```sh
npm install --save-dev eslint-plugin-module-imports
```

## Usage

In your `.eslintrc`:

```json
{
    "plugins": ["module-imports"],
    "rules": {
        "module-imports/group": "error"
    }
}
```

## Rules

### `module-imports/group`

Requires imports to be grouped and groups to be separated by a new line. Auto-fixable!

The following configuration options can be set:

```ts
interface Configuration {
    groups?: Array<string | string[]>;
}
```

where `string` can be a package name, a scope name or one of the following tokens:

-   `#NODE`: all node builtin packages like `fs` and `path`
-   `#EXTERNAL`: all other declared dependencies, e.g. `lodash`, `react`, etc.
-   `#RELATIVE`: all relative imports
-   `#ABSOLUTE`: all absolute imports, never seen a project use these, but it's possible

The default configuration is:

```json
{
    "groups": ["#NODE", "#EXTERNAL", "#ABSOLUTE", "#RELATIVE"]
}
```

Nested arrays allow packages to be treated as a single group, e.g.

```json
{
    "groups": [["#NODE", "#EXTERNAL"], ["@my-scope", "my-package"], "#RELATIVE"]
}
```

Explicitly declared packages and scopes have precedence over the predefined tokens. Unused tokens are in an implicit additional group.

### `module-imports/sort`

Requires import groups to be sorted by module first and then by specifier. Auto-fixable!

The following configuration options can be set:

```ts
interface Configuration {
    specifier?: 'source' | 'rename';
    locales?: string[];
    sensitivity?: 'base' | 'accent' | 'case' | 'variant';
    ignorePunctuation?: boolean;
    numeric?: boolean;
    caseFirst?: 'upper' | 'lower' | 'false';
    caseGroups?: boolean;
    sortExports?: boolean;
}
```

-   `specifier`: determines specifier priority, e.g. in `import { foo as bar } from 'baz'` `foo` is `'source'` and `bar` is `'rename'`
-   `caseGroups`: when `true`, import names need to be grouped by case before sorting
-   `sortExports`: whether to sort deferred export groups, i.e. all statements that export from another module

For all other possible settings, see [String#localeCompare](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/localeCompare).

The default configuration is:

```json
{
    "specifier": "source",
    "locales": ["en-US"],
    "sensitivity": "variant",
    "ignorePunctuation": false,
    "numeric": true,
    "caseFirst": "lower",
    "caseGroups": false,
    "sortExports": true
}
```

[npm-image]: https://img.shields.io/npm/v/eslint-plugin-module-imports.svg
[npm-url]: https://npmjs.org/package/eslint-plugin-module-imports
