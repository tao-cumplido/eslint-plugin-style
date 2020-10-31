import type { SourceCode } from 'eslint';
import type { ExportAllDeclaration, ExportSpecifier } from 'estree';

export interface ExportFromDeclaration extends ExportAllDeclaration {
	specifiers?: ExportSpecifier[];
}

export function exportFromDeclarations(source: SourceCode): ExportFromDeclaration[] {
	return source.ast.body.filter((node): node is ExportFromDeclaration => (node.type === 'ExportNamedDeclaration' || node.type === 'ExportAllDeclaration') && node.source !== null);
}
