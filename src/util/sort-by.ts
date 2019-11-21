export type SortOptions = Pick<Intl.CollatorOptions, 'sensitivity' | 'ignorePunctuation' | 'numeric' | 'caseFirst'> & {
    locales?: string[];
    caseGroups?: boolean;
};

function isIndexable(value: unknown): value is Record<string | number, unknown> {
    return typeof value === 'object' && value !== null;
}

function readPath(from: unknown, path: ReadonlyArray<string | number>): unknown {
    if (!isIndexable(from)) {
        return;
    }

    if (path.length === 1) {
        return from[path[0]];
    }

    const [head, ...rest] = path;

    return readPath(from[head], rest);
}

export function sortBy<T extends object, K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2]>(
    source: T[],
    path: readonly [K1, K2, K3],
    options?: SortOptions,
): T[];
export function sortBy<T extends object, K1 extends keyof T, K2 extends keyof T[K1]>(
    source: T[],
    path: readonly [K1, K2],
    options?: SortOptions,
): T[];
export function sortBy<T extends object, K extends keyof T>(
    source: T[],
    path: readonly [K],
    options?: SortOptions,
): T[];
export function sortBy<T extends object>(source: T[], path: ReadonlyArray<string | number>, options?: SortOptions) {
    return [...source].sort((a, b) => {
        const valueA = readPath(a, path);
        const valueB = readPath(b, path);

        if (typeof valueA === 'number' && typeof valueB === 'number') {
            return valueA - valueB;
        }

        if (typeof valueA === 'string' && typeof valueB === 'string') {
            const locales = options?.locales;

            const [firstA] = valueA;
            const [firstB] = valueB;
            const lowerA = firstA.toLocaleLowerCase(locales);
            const upperA = firstA.toLocaleUpperCase(locales);
            const lowerB = firstB.toLocaleLowerCase(locales);
            const upperB = firstB.toLocaleUpperCase(locales);
            const isUpperA = lowerA > firstA;
            const caseDifferent = (isUpperA && firstB > upperB) || (firstA > upperA && lowerB > firstB);

            if (options?.caseGroups && lowerA !== lowerB && caseDifferent) {
                const compareA = isUpperA ? upperA : lowerA;
                const compareB = isUpperA ? lowerA : upperA;
                return compareA.localeCompare(compareB, locales, options);
            }

            return valueA.localeCompare(valueB, locales, options);
        }

        return 0;
    });
}
