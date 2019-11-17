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

Requires imports to be grouped and groups to be separated by a new line. Auto-fixable! The rule can be configured with an object that looks like this:

```ts
interface Configuration {
    groups: Array<string | string[]>;
}
```

where `string` can be a package name, a scope name or one of the following tokens:

-   `#NODE`: all node builtin packages like `fs` and `path`
-   `#EXTERNAL`: all other declared dependencies, e.g. `lodash`, `react`, etc.
-   `#RELATIVE`: all relative imports
-   `#ABSOLUTE`: all absolute imports, never seen a project use these, but it's possible

The default configuration is: `['#NODE', '#EXTERNAL', '#ABSOLUTE', '#RELATIVE']`.

Nested arrays allow packages to be treated as a single group, e.g. `[ ['#NODE', '#EXTERNAL'], ['@my-scope', 'my-package'], '#RELATIVE']`.

Explicitly declared packages and scopes have precedence over the predefined tokens. Unused tokens are in an implicit additional group.

[npm-image]: https://img.shields.io/npm/v/jime.svg
[npm-url]: https://npmjs.org/package/jime
