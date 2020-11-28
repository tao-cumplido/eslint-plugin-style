import type { Rule } from 'eslint';

import { rule as noCommentedCode } from './rules/experimental/no-commented-code';
import { rule as groupImports } from './rules/group-imports';
import { rule as sortImports } from './rules/sort-imports';

// augment Reflect.has to narrow types, see comments in https://github.com/microsoft/TypeScript/issues/21732
declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace Reflect {
		// eslint-disable-next-line @typescript-eslint/ban-types
		function has<T extends object, P extends PropertyKey>(target: T, propertyKey: P): target is T extends unknown ? (P extends keyof T ? T : never) : never;
	}
}

export const rules: Record<string, Rule.RuleModule> = {
	'group-imports': groupImports,
	'sort-imports': sortImports,
	'experimental/no-commented-code': noCommentedCode,
};
