import { App } from "../../App/App";
import { ContextMenuType, FsItem, SelectionAction } from "../../lib/types";

import { getFsItemByDirname } from "../../lib/utils";

import update from "immutability-helper";

export const handleContextMenuFileListRowItem = (
  t: App,
  id: string,
  pageX: number,
  pageY: number
) => {
  const [fsi, index] = getFsItemByDirname(t.state.fileListMap[t.state.currentDir.path], id);

  t.setState(({ lastSelectionAction, fileListMap, lastSelected, currentDir, contextMenu }) => {
    if (fsi.ui.selected === false) {
      fileListMap = update(fileListMap, {
        [currentDir.path]: {
          $apply: (v: FsItem[]) =>
            v.map((fsi) => {
              fsi.ui.selected = false;
              return fsi;
            }),
        },
      });

      fileListMap = update(fileListMap, {
        [currentDir.path]: {
          [index]: { ui: { selected: { $set: true } } },
          ...(lastSelected !== -1 &&
            lastSelected !== index && {
              [lastSelected]: { ui: { selected: { $set: false } } },
            }),
        },
      });
    }

    contextMenu = {
      x: pageX,
      y: pageY,
      type: ContextMenuType.FileListRowItem,
      id,
      fsi,
      multiple: lastSelectionAction === SelectionAction.Multiple,
      dev: t.dev,
    };

    return {
      lastSelected: index,
      fileListMap,
      contextMenu,
    };
  });
};
