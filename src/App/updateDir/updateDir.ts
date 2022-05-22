import { sortItems, SortMethod } from "../../lib/sort";
import { FileListMap, FsItem, SelectionAction } from "../../lib/types";
import {
  arrayUntil,
  countSelected,
  isHiddenPath,
  isParentDirectory,
  readDir,
} from "../../lib/utils";
import { App } from "../App";
import update from "immutability-helper";

export const updateDir = async (t: App, fsi: FsItem, pushHistory = true, newIndex?: number) => {
  const newDirPath = fsi.path;

  const newFileList = await readDir(fsi);

  if (newFileList === false) return;

  t.setState(
    ({
      history,
      historyIndex,
      fileListMap,
      lastSelected,
      currentDir,
      lastSelectionAction,
      displayHiddenFiles,
    }) => {
      if (pushHistory === true) {
        historyIndex++;
        history = [...arrayUntil(history, historyIndex - 1), fsi];
      }

      if (newIndex !== undefined) {
        historyIndex = newIndex;
      }
      // TODO update the visisble lines before the rest

      // if the new dir is not loaded yet, load it
      if (fileListMap[newDirPath] === undefined) {
        fileListMap = update(fileListMap, { $set: { ...fileListMap, [newDirPath]: newFileList } });
      } else {
        // if the new dir is already loaded, we merge the updated version
        // with the metadata that is already loaded
        fileListMap = mergeNewFileList(fileListMap, newDirPath, newFileList, displayHiddenFiles);
      }

      fileListMap[newDirPath] = sortItems(fileListMap[newDirPath], SortMethod.Alphabetic);

      const [length, firstVisibleItemIndex] = countSelected(fileListMap[newDirPath]);

      if (fileListMap[newDirPath].length !== 0) {
        // if no item is selected and the new dir has items, select the first item
        if (length === 0) {
          // select the child directory if navigating up to the parent directory
          if (isParentDirectory(currentDir.path, newDirPath)) {
            for (let i = 0; i < fileListMap[newDirPath].length; i++) {
              const parentFsi = fileListMap[newDirPath][i];

              if (parentFsi.path === currentDir.path) {
                fileListMap[newDirPath][i].ui.selected = true;
                lastSelected = i;
                break;
              }
            }
          } else {
            // select the first item
            fileListMap[newDirPath][0].ui.selected = true;
            lastSelected = 0;
          }
        } else {
          if (length > 1) {
            lastSelectionAction = SelectionAction.Multiple;
          }
          if (newDirPath !== currentDir.path) {
            lastSelected = firstVisibleItemIndex;
          }
        }
      }

      // update the current directory to the new directory
      currentDir = update(currentDir, { path: { $set: newDirPath } });

      return {
        fileListMap,
        currentDir,
        lastSelected,
        lastSelectionAction,
        history,
        historyIndex,
      };
    },
    () => {
      t.scrollElementIntoView(t.state.lastSelected, "center");
    }
  );
};

export const mergeNewFileList = (
  fileListMap: FileListMap,
  newDirPath: string,
  newFileList: FsItem[],
  displayHiddenFiles: boolean
) => {
  return update(fileListMap, {
    [newDirPath]: {
      $apply: (currentFileList: FsItem[]) =>
        newFileList.map((newFsi) => {
          const currentFsItem = currentFileList.find(
            (currentFsi) => currentFsi.path === newFsi.path
          );

          if (currentFsItem === undefined) {
            return newFsi;
          }

          return {
            ...newFsi,
            ui: {
              ...currentFsItem.ui,
              display: isHiddenPath(newFsi.path) === true ? displayHiddenFiles : true,
            },
          };
        }),
    },
  });
};
