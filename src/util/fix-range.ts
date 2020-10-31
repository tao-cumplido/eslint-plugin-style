import type { Rule } from 'eslint';
import type { Node } from 'estree';

export function fixRange(
	context: Rule.RuleContext,
	data: {
		range: [Node, Node];
		message: string;
		code: string;
	},
): void {
	const [first, last] = data.range;

	context.report({
		node: last,
		message: data.message,
		fix(fixer) {
			if (!first.range || !last.range) {
				return null;
			}

			return fixer.replaceTextRange([first.range[0], last.range[1]], data.code);
		},
	});
}
