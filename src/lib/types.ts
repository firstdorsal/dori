import { FromSchema } from "json-schema-to-ts";
import { App } from "../App/App";
import { configSchema } from "./configSchema";

export enum Modal {
  None,
  Rename,
}

export enum ClipboardType {
  Copy,
  Cut,
}

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
  dev: boolean;
  hotkey?: string;
}
export enum ActionType {
  LOG,
  COPY,
  PASTE,
  CUT,
  NEW_FOLDER,
  NEW_FILE,
  RENAME_INIT,
  RENAME_COMMIT,
  RENAME_ABORT,
  DELETE,
  DUPLICATE,
  COPY_PATH,
  COPY_NAME,
  EXECUTE,
  OPEN_WITH,
  EDIT_PERMS,
  UNMOUNT_VOLUME,
  DECRYPT,
  ENCRYPT,
  EXTRACT,
  ARCHIVE,
  PROPERTIES,
  OPEN_TERMINAL,
  RUN_IN_TERMINAL,
  SQUOOSH_IMAGE,
  SEND_VIA_MAIL,
  QUICK_LOCAL_SHARE,
  SQUOOSH_IMAGE_SEND_VIA_MAIL,
  SYNC_WITH,
  VALIDATE_CHECKSUM,
  GIT_CLONE,
  GIT_CLONE_INTO_HERE,
  OPEN_REMOTE, // get if folder has a .git subfolder and check if it has a remote origin
  DOCKER_COMPOSE_UP,
  DS,
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
  ContextMenu,
  FileListRowItem,
  FileList,
  Bookmark,
  Breadcrumb,
}

export enum SelectionAction {
  Single,
  Multiple,
}

export type G = InstanceType<typeof App>["g"];

export enum Page {
  main,
  config,
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
    bookmarked: boolean;
    editable: boolean;
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
  Selected,
  SelectAll,
}
