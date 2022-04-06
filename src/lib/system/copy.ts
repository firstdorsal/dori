import { invoke } from "@tauri-apps/api";
import { getLastPartOfPath } from "../utils";

export const copy = async (src: string, dst: string) => {
  return await invoke("copy", {
    src,
    dst: `${dst}/${getLastPartOfPath(src)}`,
  });
};
