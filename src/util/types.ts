import type { Rule } from 'eslint';

export type PartialMap<T extends unknown[]> = {
	[P in keyof T]?: Partial<T[P]>;
};

// https://github.com/typescript-eslint/typescript-eslint/issues/1868

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
export interface RuleContext<Configuration extends unknown[]> extends Rule.RuleContext {
	options: PartialMap<Configuration>;
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
export interface RuleModule<Configuration extends unknown[]> extends Rule.RuleModule {
	create: (context: RuleContext<Configuration>) => Rule.RuleListener;
}
