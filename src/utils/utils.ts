import { invoke } from "@tauri-apps/api";
import mime from "mime";
import { Config, FileListMap, FsItem, FsType } from "../types";

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

export const actions = [
    "NEW_WINDOW",
    "LIST_UP",
    "LIST_DOWN",
    "GO_UP",
    "GO_INTO",
    "SELECT_FROM_TO",
    "SELECT_MULTIPLE"
] as const;

export const defaultConfig: Config = {
    hotkeys: {
        useHotkeys: true,
        keyMap: {
            NEW_WINDOW: "control+n",
            LIST_UP: "up",
            LIST_DOWN: "down",
            GO_UP: "left",
            GO_INTO: "right",
            SELECT_FROM_TO: "shift",
            SELECT_MULTIPLE: "control"
        }
    }
} as const;

export const countSelected = (items: FsItem[]) => {
    let firstItemIndex = -1;
    const l = items.filter((item, i) => {
        if (firstItemIndex === -1 && item.ui.selected === true) {
            firstItemIndex = i;
        }
        return item.ui.selected;
    });

    return [l.length, firstItemIndex];
};

export const readDir = async (newPath: string): Promise<FsItem[]> => {
    const fileList: { path: string[]; fs_type: FsType }[] = await invoke("read_dir", {
        path: newPath
    });

    return fileList.map(file => {
        return {
            ui: {
                selected: false
            },
            path: file.path,
            fs_type: file.fs_type,
            permission: { user: -1, group: -1, other: -1 },
            owner: { gid: -1, uid: -1 },
            modificationDate: "",
            mimeType: ""
        };
    });
};

export const getCurrentFileList = (fileListMap: FileListMap, currentPath: string[]) => {
    return fileListMap[arrayToPath(currentPath)];
};
