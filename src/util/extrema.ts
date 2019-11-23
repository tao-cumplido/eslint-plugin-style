export function extrema<T>(source: T[]): [T, T] {
    return [source[0], source[source.length - 1]];
}
