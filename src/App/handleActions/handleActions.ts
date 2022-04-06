import { App } from "../App";
import { Action, ActionType, ContextMenuType } from "../../lib/types";
import { getSelectedFiles } from "../../lib/utils";
import { copy } from "../../lib/system/copy";

export const handleAction = async (t: App, action: Action, undo = false) => {
  switch (action.type) {
    case ActionType.LOG: {
      let selected;
      if (t.state.contextMenu?.type === ContextMenuType.FileListRowItem) {
        selected = getSelectedFiles(t.state.fileListMap[t.state.currentDir.path]);
      } else if (t.state.contextMenu?.type === ContextMenuType.FileList) {
        selected = t.state.currentDir;
      }
      console.log(selected);
      break;
    }
    case ActionType.COPY: {
      t.setState(({ fileListMap, currentDir }) => {
        const selected = getSelectedFiles(fileListMap[currentDir.path]);

        return {
          clipboard: selected,
        };
      });
      break;
    }
    case ActionType.PASTE: {
      t.state.clipboard.forEach(async (fsi) => {
        await copy(fsi.path, t.state.currentDir.path);
      });
      await t.reloadDirectory();
      break;
    }

    case ActionType.CUT: {
      break;
    }
    case ActionType.DELETE: {
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
    case ActionType.RENAME: {
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
