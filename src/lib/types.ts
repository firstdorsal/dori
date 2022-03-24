import { FromSchema } from "json-schema-to-ts";
import { App } from "../App";
import { configSchema } from "./configSchema";

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
