
export class Pair<S, T> {
    first: S;
    second: T;
}

/**
 * Map which value is a list of given type T
 */
export interface Multimap<T> {
    [key: string]: T[]
}

export class CommonUtils {

    /**
     * Returns a datetime in locale format
     */
    public static datetimeToLocale(datetime: Date): string {
        // return datetime.toLocaleDateString([], { year: "numeric", month: "2-digit", day: "2-digit" }) + " " + datetime.toLocaleTimeString();
        return datetime.toLocaleDateString() + " " + datetime.toLocaleTimeString();
    }
}
