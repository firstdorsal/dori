export const getLast = <T,>(a: Array<T>) => {
    return a[a.length - 1];
};

export const arrayUntil = <T,>(a: Array<T>, until: number) => {
    return arrayRange(a, 0, until);
};

export const arrayFrom = <T,>(a: Array<T>, from: number) => {
    return arrayRange(a, from, a.length);
};

export const arrayRange = <T,>(a: Array<T>, from: number, until: number) => {
    return a.filter((e, i) => i <= Math.max(until, 0) && i >= from);
};

export const isHidden = (path: string[]) => {
    return getLast(path).startsWith(".");
};

export const arrayToPath = (a: string[]) => {
    if (a.length === 1) return "/";
    return a.join("/").substring(1);
};
export const pathToArray = (path: string) => {
    let a: string[] = path.split("/");
    a[0] = "/";
    return a;
};
