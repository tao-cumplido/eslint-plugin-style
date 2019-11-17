import { SourceCode } from 'eslint';
import { ImportDeclaration } from 'estree';

export function importDeclarations(source: SourceCode) {
    return source.ast.body.filter((node): node is ImportDeclaration => node.type === 'ImportDeclaration');
}
