import { fs, invoke } from "@tauri-apps/api";
import { cloneDeep } from "lodash";
import mime from "mime";
import { Config, FileListMap, FsItem, FsType } from "./types";

export const getLastPartOfPath = (a: string) => {
  return a.substring(a.lastIndexOf("/") + 1);
};

export const getParentPath = (a: string) => {
  const b = a.substring(0, a.lastIndexOf("/"));
  return b.length ? b : "/";
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

export const isHiddenPath = (path: string) => {
  return getLastPartOfPath(path).startsWith(".");
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
  return getFileTypeFromString(fsi.path);
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
  nativeVideos: ["video/mp4", "video/mpeg", "video/webm", "video/quicktime"],
};

export const typeMap: mime.TypeMap = { "text/typescript": ["ts"], "text/typescript+xml": ["tsx"] };

export const getHotkeys = (config: Config) => {
  const keyMap = {};

  if (config === null || config.hotkeys?.useHotkeys === false) return keyMap;

  return {
    ...config.hotkeys.keyMap,
    SELECT_MULTIPLE_KEYDOWN: {
      sequence: config.hotkeys.keyMap.SELECT_MULTIPLE,
      action: "keydown",
    },
    SELECT_MULTIPLE_KEYUP: {
      sequence: config.hotkeys.keyMap.SELECT_MULTIPLE,
      action: "keyup",
    },
    SELECT_FROM_TO_KEYDOWN: {
      sequence: config.hotkeys.keyMap.SELECT_FROM_TO,
      action: "keydown",
    },
    SELECT_FROM_TO_KEYUP: {
      sequence: config.hotkeys.keyMap.SELECT_FROM_TO,
      action: "keyup",
    },
  };
};

export const actions = [
  "NEW_WINDOW",
  "LIST_UP",
  "LIST_DOWN",
  "GO_UP",
  "GO_INTO",
  "SELECT_FROM_TO",
  "SELECT_MULTIPLE",
  "TOGGLE_HIDDEN_FILES",
  "SELECT_ALL",
] as const;

export const defaultConfig: Config = {
  hotkeys: {
    useHotkeys: true,
    keyMap: {
      NEW_WINDOW: "ctrl+n",
      LIST_UP: "up",
      LIST_DOWN: "down",
      GO_UP: "left",
      GO_INTO: "right",
      SELECT_FROM_TO: "shift",
      SELECT_MULTIPLE: "ctrl",
      TOGGLE_HIDDEN_FILES: "ctrl+h",
      SELECT_ALL: "ctrl+a",
    },
  },
} as const;

export const countSelected = (items: FsItem[]) => {
  let firstVisibleItemIndex = -1;
  let selectCount = 0;
  for (let i = 0; i < items.length; i++) {
    const fsi = items[i];
    if (fsi.ui.selected === true) {
      selectCount += 1;
      if (firstVisibleItemIndex === -1) {
        firstVisibleItemIndex = i;
      }
    }
  }
  return [selectCount, firstVisibleItemIndex];
};

export const readDir = async (fsi: FsItem): Promise<FsItem[] | false> => {
  if (fsi.fs_type == FsType.File) return false;
  const fileList: { path: string; fs_type: FsType }[] = await invoke("read_dir", {
    path: fsi.path,
  });

  return fileList.map((file) => {
    return {
      ...cloneDeep(defaultFsItem),
      path: file.path,
      fs_type: file.fs_type,
    };
  });
};

export const defaultFsItem = {
  ui: {
    selected: false,
    display: true,
  },
  path: "",
  fs_type: "",
  permission: { user: -1, group: -1, other: -1 },
  owner: { gid: -1, uid: -1 },
  modificationDate: "",
  mimeType: "",
};

export const getCurrentFileList = (fileListMap: FileListMap, currentPath: string) => {
  return fileListMap[currentPath];
};

export const mergeFileLists = (currentFileList: FsItem[], newFileList: FsItem[]): FsItem[] => {
  return currentFileList;
};

export enum Direction {
  Next = 0,
  Previous = 1,
}

export const getNearestVisible = (items: FsItem[], currentIndex: number, direction: Direction) => {
  switch (direction) {
    case Direction.Next:
      for (let i = currentIndex + 1; i < items.length; i++) {
        const fsi = items[i];
        if (fsi.ui.display === true) {
          return i;
        }
      }
      for (let i = 0; i < currentIndex; i++) {
        const fsi = items[i];
        if (fsi.ui.display === true) {
          return i;
        }
      }
      break;
    case Direction.Previous:
      for (let i = currentIndex - 1; i >= 0; i--) {
        const fsi = items[i];
        if (fsi.ui.display === true) {
          return i;
        }
      }
      for (let i = items.length - 1; i > currentIndex; i--) {
        const fsi = items[i];
        if (fsi.ui.display === true) {
          return i;
        }
      }

      break;
    default:
      throw Error("Invalid Direction for getNearestVisible");
  }
};
