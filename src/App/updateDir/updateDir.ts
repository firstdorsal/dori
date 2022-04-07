import { sortItems, SortMethod } from "../../lib/sort";
import { FileListMap, FsItem, SelectionAction } from "../../lib/types";
import { arrayUntil, countSelected, readDir } from "../../lib/utils";
import { App } from "../App";
import update from "immutability-helper";

export const updateDir = async (t: App, fsi: FsItem, pushHistory = true, newIndex?: number) => {
  const newDirPath = fsi.path;

  const newFileList = await readDir(fsi);

  if (newFileList === false) return;

  t.setState(
    ({ history, historyIndex, fileListMap, lastSelected, currentDir, lastSelectionAction }) => {
      if (pushHistory === true) {
        historyIndex++;
        history = [...arrayUntil(history, historyIndex - 1), fsi];
      }

      if (newIndex !== undefined) {
        historyIndex = newIndex;
      }
      // TODO update the visisble lines before the rest

      if (fileListMap[newDirPath] === undefined) {
        fileListMap = update(fileListMap, { $set: { [newDirPath]: newFileList } });
      } else {
        fileListMap = mergeNewFileList(fileListMap, currentDir, newFileList);
      }

      fileListMap[newDirPath] = sortItems(fileListMap[newDirPath], SortMethod.Alphabetic);

      const [length, firstVisibleItemIndex] = countSelected(fileListMap[newDirPath]);

      if (fileListMap[newDirPath].length !== 0) {
        if (length === 0) {
          fileListMap[newDirPath][0].ui.selected = true;
          lastSelected = 0;
        } else {
          if (length > 1) {
            lastSelectionAction = SelectionAction.Multiple;
          }
          if (newDirPath !== currentDir.path) {
            lastSelected = firstVisibleItemIndex;
          }
        }
      }
      currentDir = update(currentDir, { path: { $set: newDirPath } });

      return {
        fileListMap,
        currentDir,
        lastSelected,
        lastSelectionAction,
        history,
        historyIndex,
      };
    }
  );
};

export const mergeNewFileList = (
  fileListMap: FileListMap,
  currentDir: FsItem,
  newFileList: FsItem[]
) => {
  return update(fileListMap, {
    [currentDir.path]: {
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
            ui: { ...currentFsItem.ui },
          };
        }),
    },
  });
};
