import { invoke } from "@tauri-apps/api";
import { FsItem, FsType } from "../types";

export const deleteItem = async (fsi: FsItem) => {
  if (fsi.fs_type === FsType.Directory) {
    return deleteFolder(fsi.path);
  } else {
    return deleteFile(fsi.path);
  }
};

export const deleteFile = async (path: string) => {
  return await invoke("delete_file", {
    path,
  });
};

export const deleteFolder = async (path: string) => {
  return await invoke("delete_folder", {
    path,
  });
};
