import { FromSchema } from "json-schema-to-ts";
import { App } from "../App";
import { configSchema } from "./configSchema";

export interface G {
  readonly newWindow: InstanceType<typeof App>["newWindow"];
  readonly reloadDirectory: InstanceType<typeof App>["reloadDirectory"];
  readonly goUpDirectory: InstanceType<typeof App>["goUpDirectory"];
  readonly goThroughHistory: InstanceType<typeof App>["goThroughHistory"];
  readonly updatePage: InstanceType<typeof App>["updatePage"];
  readonly updateDir: InstanceType<typeof App>["updateDir"];
  readonly updateFsItems: InstanceType<typeof App>["updateFsItems"];
  readonly showPreview: InstanceType<typeof App>["showPreview"];
  readonly fsItemClick: InstanceType<typeof App>["fsItemClick"];
}

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
