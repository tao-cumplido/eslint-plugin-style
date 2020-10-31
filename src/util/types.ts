import type { Rule } from 'eslint';

// https://github.com/typescript-eslint/typescript-eslint/issues/1868

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
export interface RuleContext<Configuration extends unknown[]> extends Rule.RuleContext {
	options: Partial<Configuration>;
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
export interface RuleModule<Configuration extends unknown[]> extends Rule.RuleModule {
	create: (context: RuleContext<Configuration>) => Rule.RuleListener;
}
