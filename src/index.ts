import { Rule } from 'eslint';

import { rule as group } from './rules/group';
import { rule as sort } from './rules/sort';

export const rules: Record<string, Rule.RuleModule> = {
    group,
    sort,
};
