import mime from "mime";
import { Config, FsItem } from "../types";

export const getLast = <T>(a: Array<T>) => {
    return a[a.length - 1];
};

export const arrayUntil = <T>(a: Array<T>, until: number) => {
    return arrayRange(a, 0, until);
};

export const arrayFrom = <T>(a: Array<T>, from: number) => {
    return arrayRange(a, from, a.length);
};

export const arrayRange = <T>(a: Array<T>, from: number, until: number) => {
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

export const getFileTypeFromFsItem = (fsi: FsItem) => {
    return getFileTypeFromString(arrayToPath(fsi.path));
};

export const getFileTypeFromString = (path: string) => {
    mime.define(typeMap, true);
    let type = mime.getType(path);
    return type;
};

/**
 * Check if a file can be rendered as normal text
 */
export const isTextType = (type: string) => {
    if (type.startsWith("text/")) return true;
    if (sdmt.textLike.includes(type)) return true;
    return false;
};

/**
 * Supported Display Mime Types
 */
export const sdmt = {
    nativeImages: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"],
    polyfilledImages: ["image/avif"],
    pdf: ["application/pdf"],
    textLike: ["application/json", "application/xml", "application/javascript"],
    nativeVideos: ["video/mp4", "video/mpeg", "video/webm", "video/quicktime"]
};

export const typeMap: mime.TypeMap = { "text/typescript": ["ts"], "text/typescript+xml": ["tsx"] };

export const getHotkeys = (config: Config) => {
    const keyMap = {};

    if (config === null || config.hotkeys?.useHotkeys === false) return keyMap;

    return config.hotkeys.keyMap;
};

export const actions = ["NEW_WINDOW"] as const;

export const defaultConfig: Config = {
    hotkeys: {
        useHotkeys: true,
        keyMap: {
            NEW_WINDOW: "ctrl+n"
        }
    }
} as const;