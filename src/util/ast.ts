import type { TSESTree } from '@typescript-eslint/types';
import type { SourceCode } from 'eslint';
import type estree from 'estree';

export type ImportModuleDeclaration = estree.ImportDeclaration & Partial<Pick<TSESTree.ImportDeclaration, 'importKind'>>;

export type ExportModuleDeclaration = estree.ExportAllDeclaration & Partial<Pick<estree.ExportNamedDeclaration, 'specifiers'> & Pick<TSESTree.ExportAllDeclaration, 'exportKind'>>;

export type ModuleDeclaration = ImportModuleDeclaration | ExportModuleDeclaration;

export function importModules(source: SourceCode): ImportModuleDeclaration[] {
	return source.ast.body.filter((node): node is ImportModuleDeclaration => node.type === 'ImportDeclaration');
}

export function exportModules(source: SourceCode): ExportModuleDeclaration[] {
	return source.ast.body.filter((node): node is ExportModuleDeclaration => (node.type === 'ExportNamedDeclaration' || node.type === 'ExportAllDeclaration') && Boolean(node.source));
}

export function extrema<T extends estree.Node>(source: T[]): [T, T] {
	return [source[0], source[source.length - 1]];
}

export function linesBetween(a: estree.Node, b: estree.Node): number {
	if (!a.loc || !b.loc) {
		throw new Error(`error: AST was generated without node location information`);
	}

	return b.loc.start.line - a.loc.end.line - 1;
}
