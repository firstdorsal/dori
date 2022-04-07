import { App } from "../App";
import {
  ActionType,
  ClipboardType,
  ContextMenuType,
  FsItem,
  PendingAction,
  SelectionAction,
} from "../../lib/types";
import { getEditableItems, getLastPartOfPath, getSelectedItems } from "../../lib/utils";
import { copy } from "../../lib/system/copy";
import { deleteItem } from "../../lib/system/delete";
import update from "immutability-helper";
import { rename } from "../../lib/system/rename";

export const handleAction = async (t: App, actionType: ActionType, undo = false) => {
  switch (actionType) {
    case ActionType.LOG: {
      let selected;
      if (t.state.contextMenu?.type === ContextMenuType.FileListRowItem) {
        selected = getSelectedItems(t.state.fileListMap[t.state.currentDir.path]);
      } else if (t.state.contextMenu?.type === ContextMenuType.FileList) {
        selected = t.state.currentDir;
      }
      console.log(selected);
      break;
    }
    case ActionType.COPY: {
      t.setState(({ fileListMap, currentDir }) => {
        const selected = getSelectedItems(fileListMap[currentDir.path]);

        return {
          clipboard: selected,
          clipBoardType: ClipboardType.Copy,
        };
      });
      break;
    }
    case ActionType.PASTE: {
      const copyHandles: Promise<any>[] = [];
      t.state.clipboard.forEach((fsi) => {
        copyHandles.push(copy(fsi.path, t.state.currentDir.path));
      });

      try {
        await Promise.all(copyHandles);
        if (t.state.clipBoardType === ClipboardType.Cut) {
          // TODO handle delete
        }
      } catch (error) {
        // TODO add to some output channel
      }

      await t.reloadDirectory();
      break;
    }

    case ActionType.CUT: {
      t.setState(({ fileListMap, currentDir }) => {
        const selected = getSelectedItems(fileListMap[currentDir.path]);

        return {
          clipboard: selected,
          clipBoardType: ClipboardType.Cut,
        };
      });

      break;
    }
    case ActionType.RENAME_INIT: {
      /*
      enter comitted
      esc aborted
      aus dem feld klicken comitted
      
      */
      t.setState(({ fileListMap, currentDir, lastSelectionAction }) => {
        if (lastSelectionAction === SelectionAction.Single) {
          fileListMap = update(fileListMap, {
            [currentDir.path]: {
              $apply: (v: FsItem[]) =>
                v.map((fsi, i) => {
                  if (fsi.ui.selected) {
                    fsi.ui.editable = true;
                    fsi.ui.renamedFileName = getLastPartOfPath(fsi.path);
                  }
                  return fsi;
                }),
            },
          });
        }
        return {
          fileListMap,
          pendingAction: PendingAction.Rename,
        };
      });
      break;
    }
    case ActionType.RENAME_ABORT: {
      t.setState(({ fileListMap, currentDir }) => {
        fileListMap = update(fileListMap, {
          [currentDir.path]: {
            $apply: (v: FsItem[]) =>
              v.map((fsi, i) => {
                if (fsi.ui.selected) {
                  fsi.ui.editable = false;
                }
                return fsi;
              }),
          },
        });
        return {
          fileListMap,
          pendingAction: PendingAction.None,
        };
      });
      break;
    }
    case ActionType.RENAME_COMMIT: {
      t.setState(({ fileListMap, currentDir }) => {
        fileListMap = update(fileListMap, {
          [currentDir.path]: {
            $apply: (v: FsItem[]) =>
              v.map((fsi, i) => {
                if (fsi.ui.selected) {
                  fsi.ui.editable = false;
                }
                return fsi;
              }),
          },
        });
        return {
          fileListMap,
          pendingAction: PendingAction.None,
        };
      });
      const editableItems = getEditableItems(t.state.fileListMap[t.state.currentDir.path]);
      if (editableItems.length !== 1) {
        throw Error("rename commit with more than one editable item is not possible");
      }
      const editableItem = editableItems[0];

      await rename(
        editableItem.path,
        editableItem.path.replace(
          getLastPartOfPath(editableItem.path),
          editableItem.ui.renamedFileName
        )
      );
      await t.reloadDirectory();

      break;
    }
    case ActionType.NEW_FOLDER: {
      break;
    }
    case ActionType.NEW_FILE: {
      break;
    }
    case ActionType.DELETE: {
      const selected = getSelectedItems(t.state.fileListMap[t.state.currentDir.path]);
      const deleteHandles: Promise<any>[] = [];

      selected.forEach((fsi) => {
        deleteHandles.push(deleteItem(fsi));
      });

      await Promise.all(deleteHandles);

      await t.reloadDirectory();

      break;
    }

    case ActionType.DUPLICATE: {
      break;
    }
    case ActionType.COPY_PATH: {
      break;
    }
    case ActionType.COPY_NAME: {
      break;
    }
    case ActionType.EXECUTE: {
      break;
    }
    case ActionType.OPEN_WITH: {
      break;
    }

    case ActionType.EDIT_PERMS: {
      break;
    }
    case ActionType.UNMOUNT_VOLUME: {
      break;
    }
    case ActionType.DECRYPT: {
      break;
    }
    case ActionType.ENCRYPT: {
      break;
    }
    case ActionType.EXTRACT: {
      break;
    }
    case ActionType.ARCHIVE: {
      break;
    }
    case ActionType.PROPERTIES: {
      break;
    }
    case ActionType.OPEN_TERMINAL: {
      break;
    }
    case ActionType.RUN_IN_TERMINAL: {
      break;
    }
    case ActionType.SQUOOSH_IMAGE: {
      break;
    }
    case ActionType.SEND_VIA_MAIL: {
      break;
    }
    case ActionType.QUICK_LOCAL_SHARE: {
      break;
    }
    case ActionType.SQUOOSH_IMAGE_SEND_VIA_MAIL: {
      break;
    }
    case ActionType.SYNC_WITH: {
      break;
    }
    case ActionType.VALIDATE_CHECKSUM: {
      break;
    }
    case ActionType.GIT_CLONE: {
      break;
    }
    case ActionType.GIT_CLONE_INTO_HERE: {
      break;
    }
    case ActionType.OPEN_REMOTE: {
      break;
    }
    case ActionType.DOCKER_COMPOSE_UP: {
      break;
    }
    case ActionType.DS: {
      break;
    }

    default:
      throw Error("Invalid action");
  }
};
