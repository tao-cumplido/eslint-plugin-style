import type { SourceCode } from 'eslint';
import type { ImportDeclaration } from 'estree';

export function importDeclarations(source: SourceCode): ImportDeclaration[] {
	return source.ast.body.filter((node): node is ImportDeclaration => node.type === 'ImportDeclaration');
}
