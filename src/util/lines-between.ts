import { ImportDeclaration } from 'estree';

export function linesBetween(a: ImportDeclaration, b: ImportDeclaration) {
    return (b.loc?.start.line ?? 0) - (a.loc?.end.line ?? 0) - 1;
}
