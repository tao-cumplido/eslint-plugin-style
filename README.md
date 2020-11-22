# eslint-plugin-style

> ESLint plugin for for stylistic issues in modern JavaScrip

[![NPM Version][npm-image]][npm-url]

Configurable ESLint rules for stylistic issues not -- or not sufficiently -- covered by ESLint core rules.

## Install

```sh
npm install --save-dev eslint-plugin-style
```

## Usage

In your `.eslintrc`:

```json
{
	"plugins": ["style"],
	"rules": {
		"style/group-imports": "error"
	}
}
```

## Rules

### `style/group-imports`

Requires imports to be grouped and groups to be separated by a new line. This rule is partially auto-fixable.
It is currently not capable to move an import that is preceded by non-import statements including comments.

The following configuration options can be set:

```ts
type ModuleConfiguration = string | { class: 'node' | 'external' | 'relative' | 'absolute' };

interface Configuration {
	groups?: Array<ModuleConfiguration | ModuleConfiguration[]>;
}
```

where `ModuleConfiguration` can be a package name, a scope name or an object with the property `class` taking one of the following:

-  `node`: All node builtin packages like `fs` and `path`.
-  `external`: All other declared dependencies, e.g. `lodash`, `react`, etc.
-  `relative`: All relative imports.
-  `absolute`: All absolute imports, never seen a project use these, but it's possible.

The default configuration is:

```json
{
	"groups": [{ "class": "node" }, { "class": "external" }, { "class": "absolute" }, { "class": "relative" }]
}
```

Nested arrays allow packages to be treated as a single group, e.g.

```json
{
	"groups": [[{ "class": "node" }, { "class": "external" }], ["@my-scope", "my-package"], { "class": "relative" }]
}
```

Explicitly declared packages and scopes have precedence over the predefined tokens. Unused tokens are in an implicit additional group.

### `style/sort-imports`

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

-  `specifier`: Determines specifier priority, e.g. in `import { foo as bar } from 'baz'` `foo` is `'source'` and `bar` is `'rename'`.
-  `caseGroups`: When `true`, import names need to be grouped by case before sorting.
-  `sortExports`: Whether to sort deferred export groups, i.e. all statements that export from another module.

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

## Experimental rules

:warning: These rules are experimental and may produce unexpected behavior. :warning:

-  These rules are not auto-fixable!
-  Consider setting the level to `"warn"` instead of `"error"`.

### `style/experimental/no-commented-code`

This rule is meant to detect commented code. It does so by uncommenting comment nodes and run the whole file with the uncommented part through the parser. If the parser produces a valid AST the comment is marked as commented code. Generally it should work with any parser but has only been tested with the default parser `espree` and `@typescript-eslint/parser`. For example, `// type A = 0;` is not commented code with `espree` but it is with `@typescript-eslint/parser`.

False positives will probably happen, single words for example, are valid identifiers in many positions and `eslint-disable-next-line` is parsed as a `BinaryExpression`. Common patterns can be ignored and `^eslint-` is ignored by default.

The following configuration options can be set:

```ts
interface Configuration {
	ignorePatterns?: string[];
	extendDefaultIgnorePatterns?: boolean;
}
```

-  `ignorePatterns`: When a comment matches one of the specified patterns it will be ignored. The expressions are tested against the trimmed text content of the comment. Invalid regular expressions will be ignored.
-  `extendDefaultIgnorePatterns`: Whether to keep the default ignore patterns without explicitly redefining them.

The default configuration is:

```json
{
	"ignorePatterns": ["^eslint-", "^@ts-"],
	"extendDefaultIgnorePatterns": false
}
```

[npm-image]: https://img.shields.io/npm/v/eslint-plugin-style.svg
[npm-url]: https://npmjs.org/package/eslint-plugin-style
