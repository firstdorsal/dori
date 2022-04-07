import { CSSProperties } from "react";
import { ConnectDragSource, ConnectDropTarget, useDrag, useDrop } from "react-dnd";
import { ActionType, ContextMenuType, FsItem, G } from "../../lib/types";
import { isHiddenPath, getLastPartOfPath } from "../../lib/utils";

export const ListItem = (props: { fsItem?: FsItem; g: G; listIndex: number }) => {
  if (props.fsItem === undefined) throw Error("Missing fsItem");

  const fsi = props.fsItem;
  const p = fsi.path;

  const innerStyle: CSSProperties = {};
  innerStyle.color = isHiddenPath(fsi.path) ? "lightgrey" : "black";
  const upperStyle: CSSProperties = {};
  if (props.fsItem.ui?.selected === true) {
    upperStyle.background = "#0c6eed";
    innerStyle.color = "white";
  }

  interface DropResult {
    path: string;
  }

  let drag: ConnectDragSource | undefined,
    isDragging: boolean | undefined,
    canDrop: boolean | undefined,
    isOver: boolean | undefined,
    drop: ConnectDropTarget | undefined;

  if (fsi.ui.editable === false) {
    const useDragV = useDrag(() => ({
      type: "default",
      item: { path: p },
      end: (item, monitor) => {
        const dropResult = monitor.getDropResult<DropResult>();
        if (item && dropResult) {
          console.log(`${item.path}\n->\n${dropResult.path}`);
        }
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
        handlerId: monitor.getHandlerId(),
      }),
    }));
    drag = useDragV[1];
    isDragging = useDragV[0].isDragging;

    const useDropV = useDrop(() => ({
      accept: "default",
      drop: () => ({ path: p }),
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }));

    drop = useDropV[1];
    canDrop = useDropV[0].canDrop;
    isOver = useDropV[0].isOver;
  }
  return (
    <div className="FileListRowItem" style={upperStyle} ref={drop}>
      <div
        ref={drag}
        id={p}
        /*@ts-ignore*/
        ctxmtype={ContextMenuType.FileListRowItem}
        onClick={(e) => {
          if (fsi.ui.editable === false) {
            props.g.fsItemClick(e, { index: props.listIndex, fsi });
          }
        }}
        style={innerStyle}
      >
        {fsi.ui.editable === true ? (
          <input
            onChange={(e) => props.g.handleNameChange(e, props.listIndex)}
            type="text"
            autoFocus={true}
            value={fsi.ui.renamedFileName}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                props.g.handleAction(ActionType.RENAME_COMMIT);
              } else if (e.key === "Escape") {
                props.g.handleAction(ActionType.RENAME_ABORT);
              }
            }}
            onBlur={() => props.g.handleAction(ActionType.RENAME_COMMIT)}
          />
        ) : (
          getLastPartOfPath(fsi.path)
        )}
      </div>
    </div>
  );
};
