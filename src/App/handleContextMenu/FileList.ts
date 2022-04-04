import { App } from "../../App/App";
import { ContextMenuType, SelectionAction } from "../../lib/types";

export const handleContextMenuFileList = (t: App, id: string, pageX: number, pageY: number) => {
  t.setState(({ lastSelectionAction, fileListMap, currentDir, contextMenu }) => {
    contextMenu = {
      x: pageX,
      y: pageY,
      type: ContextMenuType.FileList,
      id,
      fsi: currentDir,
      multiple: lastSelectionAction === SelectionAction.Multiple,
      dev: t.dev,
    };

    return {
      fileListMap,
      contextMenu,
    };
  });
};
