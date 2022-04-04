import { App } from "../App";
import update from "immutability-helper";
import { cloneDeep } from "lodash";
import { FsItem } from "../../lib/types";
import { isHiddenPath } from "../../lib/utils";

export const toggleHiddenFiles = (t: App) => {
  t.setState(
    ({ fileListMap, currentDir, displayHiddenFiles, lastSelected }) => {
      displayHiddenFiles = !displayHiddenFiles;

      let selectCount = 0;
      fileListMap = update(fileListMap, {
        [currentDir.path]: {
          $apply: (v: FsItem[]) =>
            v.map((fsi) => {
              if (isHiddenPath(fsi.path) === true) {
                fsi = cloneDeep(fsi);
                fsi.ui.display = displayHiddenFiles;
                if (displayHiddenFiles === false) {
                  fsi.ui.selected = false;
                }
                return fsi;
              } else {
                if (fsi.ui.selected) selectCount += 1;
              }
              return fsi;
            }),
        },
      });

      let firstVisibleItemIndex = -1;
      if (displayHiddenFiles === false && selectCount === 0) {
        for (let i = 0; i < fileListMap[currentDir.path].length; i++) {
          let fsi = fileListMap[currentDir.path][i];
          if (fsi.ui.display === true) {
            firstVisibleItemIndex = i;
            break;
          }
        }
      }

      if (firstVisibleItemIndex !== -1) {
        lastSelected = firstVisibleItemIndex;
        fileListMap = update(fileListMap, {
          [currentDir.path]: {
            [firstVisibleItemIndex]: { ui: { selected: { $set: true } } },
          },
        });
      }

      return { fileListMap, displayHiddenFiles, lastSelected };
    },
    () => {
      t.scrollElementIntoView(t.state.lastSelected, "center");
    }
  );
};
