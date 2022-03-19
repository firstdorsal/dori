import { FromSchema } from "json-schema-to-ts";
import { configSchema } from "./utils/Schema";

export enum Page {
    config = "config",
    main = "main"
}

export type Config = FromSchema<typeof configSchema>;

/**
 *  A file system item like a folder file socket etc.
 */
export interface FsItem {
    path: string[];
    fs_type?: FsType;
    permission?: Permission;
    owner?: Owner;
    modificationDate?: string;
    mimeType?: string;
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
    Other = "o"
    /* 
    Socket = "s",
    NamedPipe = "p",
    CharacterDevice = "c",
    BlockDevice = "b"*/
}
