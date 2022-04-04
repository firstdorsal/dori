import { FsItem } from "../../lib/types";
import { getLastPartOfPath, isBookmarked } from "../../lib/utils";
import { App } from "../App";
import update from "immutability-helper";

export const bookmarkFolder = (t: App, folder?: FsItem) => {
  if (folder === undefined) folder = t.state.currentDir;
  let newConfig;
  if (!t.state.config) return;
  if (isBookmarked(folder, t.state.config) === false) {
    let name = getLastPartOfPath(folder.path);
    if (name.length === 0) {
      name = t.state.hostname;
    }
    newConfig = update(t.state.config, {
      bookmarks: {
        list: {
          $push: [{ icon: "", location: folder.path, name }],
        },
      },
    });
  } else {
    newConfig = update(t.state.config, {
      bookmarks: {
        list: {
          $apply: (
            v: {
              location: string;
              name: string;
              icon: string;
            }[]
          ) =>
            v.filter((bm) => {
              return bm.location !== folder?.path;
            }),
        },
      },
    });
  }
  if (newConfig === null) return;
  t.updateConfig(newConfig);
};
