import { invoke } from "@tauri-apps/api";
import { cloneDeep } from "lodash";
import mime from "mime";
import { Config, FileListMap, FsItem, FsType } from "./types";

export const isBookmarked = (fsi: FsItem, config: Config) => {
  for (let i = 0; i < config.bookmarks.list.length; i++) {
    const bm = config.bookmarks.list[i];
    if (bm.location === fsi.path) return true;
  }
  return false;
};

export const getFsItemByDirname = (fsItems: FsItem[], dirname: string) => {
  for (let i = 0; i < fsItems.length; i++) {
    const fsi = fsItems[i];
    if (fsi.path === dirname) {
      return fsi;
    }
  }
};

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
  if (type === null) {
    const mimes = Object.keys(noEndingMimeMappings);
    const endings = Object.values(noEndingMimeMappings);
    for (let i = 0; i < mimes.length; i++) {
      const mime = mimes[i];
      const ending = endings[i];
      if (path.endsWith(ending)) {
        return mime;
      }
    }
  }
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
  textLike: [
    "application/json",
    "application/xml",
    "application/javascript",
    "application/x-sh",
    "application/desktop",
    "application/lock",
    "application/toml",
    "application/node",
    "application/gitignore",
  ],
  nativeVideos: ["video/mp4", "video/mpeg", "video/webm", "video/quicktime"],
};

export const typeMap: mime.TypeMap = {
  "text/typescript": ["ts"],
  "text/typescript+xml": ["tsx"],
  "application/desktop": ["desktop"],
  "application/lock": ["lock"],
  "application/x-blender": ["blend", "blender"],
};

export const noEndingMimeMappings = {
  "application/gitignore": ".gitignore",
  "application/json": ".prettierrc",
};

// TODO render markdown and html;

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

export const contextMenuActions = [
  "COPY",
  "PASTE",
  "CUT",
  "DELETE",
  "DUPLICATE",
  "COPY_PATH",
  "COPY_NAME",
  "EXECUTE",
  "OPEN_WITH",
  "RENAME",
  "EDIT_PERMS",
  "UNMOUNT_VOLUME",
  "DECRYPT",
  "ENCRYPT",
  "EXTRACT",
  "ARCHIVE",
  "PROPERTIES",
  "OPEN_TERMINAL",
  "RUN_IN_TERMINAL",
  "SQUOOSH_IMAGE",
  "SEND_VIA_MAIL",
  "QUICK_LOCAL_SHARE",
  "SQUOOSH_IMAGE_SEND_VIA_MAIL",
  "SYNC_WITH",
  "VALIDATE_CHECKSUM",
  "GIT_CLONE",
  "GIT_CLONE_INTO_HERE",
  "OPEN_REMOTE", // get if folder has a .git subfolder and check if it has a remote origin
  "DOCKER_COMPOSE_UP",
  "DS",
] as const;

export const actions = [
  "NEW_WINDOW",
  "LIST_UP",
  "LIST_DOWN",
  "FOLDER_UP",
  "FOLDER_INTO",
  "SELECT_FROM_TO",
  "SELECT_MULTIPLE",
  "TOGGLE_HIDDEN_FILES",
  "SELECT_ALL",
  "SELECT_LAST",
  "SELECT_FIRST",
  "DELETE",
  "RENAME",
  "INSERT",
  "RELOAD",
  "HISTORY_BACK",
  "HISTORY_FORWARD",
] as const;

export const defaultConfig: Config = {
  hotkeys: {
    useHotkeys: true,
    keyMap: {
      NEW_WINDOW: "ctrl+n",
      LIST_UP: "up",
      LIST_DOWN: "down",
      FOLDER_UP: "left",
      FOLDER_INTO: "right",
      SELECT_FROM_TO: "shift",
      SELECT_MULTIPLE: "ctrl",
      TOGGLE_HIDDEN_FILES: "ctrl+h",
      SELECT_ALL: "ctrl+a",
      // TODO
      SELECT_LAST: "End",
      SELECT_FIRST: "Home",
      DELETE: "Delete",
      RENAME: "F2",
      INSERT: "Insert",
      RELOAD: "ctrl+r",
      HISTORY_BACK: "alt+left",
      HISTORY_FORWARD: "alt+right",
    },
  },
  bookmarks: {
    list: [{ icon: "", location: "/home", name: "Home" }],
  },
};

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
    bookmarked: false,
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

export const getMergedFileList = (currentFileList: FsItem[], newFileList: FsItem[]): FsItem[] => {
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
