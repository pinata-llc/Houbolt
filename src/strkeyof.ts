/** Returns string-only keys of T */
export type StrKeyOf<T> = Extract<keyof T, string>;
