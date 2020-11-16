import type { Rule } from 'eslint';

export type PartialMap<T extends unknown[]> = {
	[P in keyof T]?: Partial<T[P]>;
};

export interface RuleContext<Configuration extends unknown[]> extends Rule.RuleContext {
	options: PartialMap<Configuration>;
}

export interface RuleModule<Configuration extends unknown[]> extends Rule.RuleModule {
	create: (context: RuleContext<Configuration>) => Rule.RuleListener;
}
