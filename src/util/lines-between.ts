import type { Node } from 'estree';

export function linesBetween(a: Node, b: Node): number {
	return (b.loc?.start.line ?? 0) - (a.loc?.end.line ?? 0) - 1;
}
