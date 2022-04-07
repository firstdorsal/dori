import { invoke } from "@tauri-apps/api";

export const rename = async (from: string, to: string) => {
  return await invoke("rename", {
    from,
    to,
  });
};
