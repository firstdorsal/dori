import { App } from "../App";
import update from "immutability-helper";
import { UpdateFsItemOption, SelectionAction, FsItem } from "../../lib/types";

export const updateFsItems = (t: App, index: number, option: UpdateFsItemOption) => {
  t.setState(({ fileListMap, lastSelected, currentDir, lastSelectionAction }) => {
    if (option === UpdateFsItemOption.Selected) {
      if (t.selectMultiplePressed === true) {
        fileListMap = update(fileListMap, {
          [currentDir.path]: {
            [index]: { ui: { selected: { $apply: (s) => !s } } },
          },
        });
        lastSelectionAction = SelectionAction.Multiple;
      } else if (t.selectFromToPressed === true) {
        fileListMap = update(fileListMap, {
          [currentDir.path]: {
            $apply: (v: FsItem[]) =>
              v.map((fsi, i) => {
                if (i <= Math.max(lastSelected, index) && i >= Math.min(lastSelected, index)) {
                  fsi.ui.selected = true;
                }
                return fsi;
              }),
          },
        });
        lastSelectionAction = SelectionAction.Multiple;
      } else {
        // handle a single select click
        // deselect all if the last action selected multiple items
        if (lastSelectionAction === SelectionAction.Multiple) {
          fileListMap = update(fileListMap, {
            [currentDir.path]: {
              $apply: (v: FsItem[]) =>
                v.map((fsi) => {
                  fsi.ui.selected = false;
                  return fsi;
                }),
            },
          });
        }
        fileListMap = update(fileListMap, {
          [currentDir.path]: {
            [index]: { ui: { selected: { $set: true } } },
            ...(lastSelected !== -1 &&
              lastSelected !== index && {
                [lastSelected]: { ui: { selected: { $set: false } } },
              }),
          },
        });

        lastSelectionAction = SelectionAction.Single;
      }
    } else if (option === UpdateFsItemOption.SelectAll) {
      fileListMap = update(fileListMap, {
        [currentDir.path]: {
          $apply: (v: FsItem[]) =>
            v.map((fsi) => {
              fsi.ui.selected = true;
              return fsi;
            }),
        },
      });
      lastSelectionAction = SelectionAction.Multiple;
    }

    return { fileListMap, lastSelected: index, lastSelectionAction };
  });
};
