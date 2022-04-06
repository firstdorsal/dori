import { ActionType, ContextMenuActions, ContextMenuType, FsType } from "../types";

export const contextMenuActions: ContextMenuActions = {
  [ContextMenuType.FileListRowItem]: {
    actions: [
      { title: "Copy", icon: "", type: ActionType.COPY, multiple: true, dev: false },
      { title: "Paste", icon: "", type: ActionType.PASTE, multiple: true, dev: false },
      { title: "Delete", icon: "", type: ActionType.DELETE, multiple: true, dev: false },
      { title: "Rename", icon: "", type: ActionType.RENAME_INIT, multiple: false, dev: false },
      { title: "Log", icon: "", type: ActionType.LOG, multiple: true, dev: true },
    ],
    subTypes: {
      [FsType.Directory]: {
        actions: [],
      },
      [FsType.File]: {
        actions: [],
        subTypes: {
          "application/javascript": {
            actions: [],
          },
        },
      },
    },
  },
  [ContextMenuType.FileList]: {
    actions: [
      { title: "Copy", icon: "", type: ActionType.COPY, multiple: true, dev: false },
      { title: "Paste", icon: "", type: ActionType.PASTE, multiple: true, dev: false },
      { title: "Log", icon: "", type: ActionType.LOG, multiple: true, dev: true },
      { title: "New File", icon: "", type: ActionType.NEW_FILE, multiple: false, dev: false },
      { title: "New Folder", icon: "", type: ActionType.NEW_FOLDER, multiple: false, dev: false },
    ],
    subTypes: {
      [FsType.Directory]: {
        actions: [],
      },
      [FsType.File]: {
        actions: [],
        subTypes: {
          "application/javascript": {
            actions: [],
          },
        },
      },
    },
  },
};
