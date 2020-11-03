import type { Rule } from 'eslint';

import { rule as noCommentedCode } from './rules/experimental/no-commented-code';
import { rule as groupImports } from './rules/group-imports';
import { rule as sortImports } from './rules/sort-imports';

export const rules: Record<string, Rule.RuleModule> = {
	'group-imports': groupImports,
	'sort-imports': sortImports,
	'experimental/no-commented-code': noCommentedCode,
};
