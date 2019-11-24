import { SourceCode } from 'eslint';
import { ExportAllDeclaration, ExportSpecifier } from 'estree';

export interface ExportFromDeclaration extends ExportAllDeclaration {
    specifiers?: ExportSpecifier[];
}

export function exportFromDeclarations(source: SourceCode) {
    return source.ast.body.filter((node): node is ExportFromDeclaration => {
        return (node.type === 'ExportNamedDeclaration' || node.type === 'ExportAllDeclaration') && node.source !== null;
    });
}
