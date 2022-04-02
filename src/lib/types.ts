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
  dev?: boolean;
  hotkey?: string;
}
export enum ActionType {
  LOG = 0,
  COPY = 5,
  PASTE = 10,
  CUT = 20,
  DELETE = 30,
  DUPLICATE = 40,
  COPY_PATH = 50,
  COPY_NAME = 60,
  EXECUTE = 70,
  OPEN_WITH = 80,
  RENAME = 90,
  EDIT_PERMS = 100,
  UNMOUNT_VOLUME = 110,
  DECRYPT = 120,
  ENCRYPT = 130,
  EXTRACT = 140,
  ARCHIVE = 150,
  PROPERTIES = 160,
  OPEN_TERMINAL = 170,
  RUN_IN_TERMINAL = 180,
  SQUOOSH_IMAGE = 190,
  SEND_VIA_MAIL = 200,
  QUICK_LOCAL_SHARE = 210,
  SQUOOSH_IMAGE_SEND_VIA_MAIL = 220,
  SYNC_WITH = 230,
  VALIDATE_CHECKSUM = 240,
  GIT_CLONE = 250,
  GIT_CLONE_INTO_HERE = 260,
  OPEN_REMOTE = 270, // get if folder has a .git subfolder and check if it has a remote origin
  DOCKER_COMPOSE_UP = 280,
  DS = 290,
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
  dev?: boolean;
  fsi?: FsItem;
}

export enum ContextMenuType {
  ContextMenu = 0,
  FileListRowItem = 1,
  FileList = 2,
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
