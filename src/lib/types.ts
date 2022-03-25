import { FromSchema } from "json-schema-to-ts";
import { App } from "../App";
import { configSchema } from "./configSchema";

export interface ContextMenuActions {
  [x: number]: {
    actions: Action[];
    subTypes: {
      [x: string]: {
        actions: Action[];
        subTypes?: {
          [x: string]: {
            actions: Action[];
          };
        };
      };
    };
  };
}

export interface Action {
  type: ActionType;
  title: string;
  icon: string;
  multiple: boolean;
  hotkey?: string;
}
export enum ActionType {
  COPY = 0,
  PASTE = 1,
  CUT = 2,
  DELETE = 3,
  DUPLICATE = 4,
  COPY_PATH = 5,
  COPY_NAME = 6,
  EXECUTE = 7,
  OPEN_WITH = 8,
  RENAME = 9,
  EDIT_PERMS = 10,
  UNMOUNT_VOLUME = 11,
  DECRYPT = 12,
  ENCRYPT = 13,
  EXTRACT = 14,
  ARCHIVE = 15,
  PROPERTIES = 16,
  OPEN_TERMINAL = 17,
  RUN_IN_TERMINAL = 18,
  SQUOOSH_IMAGE = 19,
  SEND_VIA_MAIL = 20,
  QUICK_LOCAL_SHARE = 21,
  SQUOOSH_IMAGE_SEND_VIA_MAIL = 22,
  SYNC_WITH = 23,
  VALIDATE_CHECKSUM = 24,
  GIT_CLONE = 25,
  GIT_CLONE_INTO_HERE = 26,
  OPEN_REMOTE = 27, // get if folder has a .git subfolder and check if it has a remote origin
  DOCKER_COMPOSE_UP = 28,
  DS = 29,
}

export interface Bookmark {
  icon: string;
  name: string;
  location: string;
}

export interface ContextMenuData {
  type: ContextMenuType;
  x: number;
  y: number;
  id: string;
  multiple: boolean;
  fsi?: FsItem;
}

export enum ContextMenuType {
  ContextMenu = 0,
  FileListRowItem = 1,
}

export enum SelectionAction {
  Single = 0,
  Multiple = 1,
}

export type G = InstanceType<typeof App>["g"];

export enum Page {
  config = "config",
  main = "main",
}

export type Config = FromSchema<typeof configSchema>;

export type FileListMap = { [p: string]: FsItem[] };

/**
 *  A file system item like a folder file socket etc.
 */
export interface FsItem {
  ui: {
    selected: boolean;
    display: boolean;
  };
  path: string;
  fs_type: FsType;
  permission: Permission;
  owner: Owner;
  modificationDate: string;
  mimeType: string;
}

export interface Owner {
  gid: number;
  uid: number;
}
export interface Permission {
  user: number;
  group: number;
  other: number;
}
export enum FsType {
  File = "-",
  Directory = "d",
  Link = "l",
  Other = "o",
  /* 
    Socket = "s",
    NamedPipe = "p",
    CharacterDevice = "c",
    BlockDevice = "b"*/
}

export enum UpdateFsItemOption {
  Selected = 0,
  SelectAll = 1,
}
