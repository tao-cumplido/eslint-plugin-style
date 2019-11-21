export type SortOptions = Pick<Intl.CollatorOptions, 'sensitivity' | 'ignorePunctuation' | 'numeric' | 'caseFirst'> & {
    locales?: string[];
    caseGroups?: boolean;
};

interface Sortable<T> {
    source: T;
    sortValue: unknown;
}

interface CaseGroups<T> {
    upper: Array<Sortable<T>>;
    lower: Array<Sortable<T>>;
}

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

function sort<T>(options?: SortOptions) {
    return (a: Sortable<T>, b: Sortable<T>) => {
        if (typeof a.sortValue === 'number' && typeof b.sortValue === 'number') {
            return a.sortValue - b.sortValue;
        }

        if (typeof a.sortValue === 'string' && typeof b.sortValue === 'string') {
            return a.sortValue.localeCompare(b.sortValue, options?.locales, options);
        }

        return 0;
    };
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
export function sortBy<T extends object>(sources: T[], path: ReadonlyArray<string | number>, options?: SortOptions) {
    const caseGroups = sources.reduce<CaseGroups<T>>(
        (groups, source) => {
            const sortValue = readPath(source, path);

            const sortable: Sortable<T> = {
                source,
                sortValue,
            };

            if (
                options?.caseGroups &&
                typeof sortValue === 'string' &&
                sortValue[0].toLocaleUpperCase(options?.locales) === sortValue[0]
            ) {
                groups.upper.push(sortable);
            } else {
                groups.lower.push(sortable);
            }

            return groups;
        },
        {
            upper: [],
            lower: [],
        },
    );

    caseGroups.upper.sort(sort(options));
    caseGroups.lower.sort(sort(options));

    return [
        ...(options?.caseFirst === 'upper' ? caseGroups.upper : caseGroups.lower)
            .sort(sort(options))
            .map(({ source }) => source),
        ...(options?.caseFirst === 'upper' ? caseGroups.lower : caseGroups.upper)
            .sort(sort(options))
            .map(({ source }) => source),
    ];
}
