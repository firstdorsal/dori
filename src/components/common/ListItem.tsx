import { CSSProperties } from "react";
import { useDrag, useDrop } from "react-dnd";
import { ContextMenuType, FsItem, G } from "../../lib/types";
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

  const [{ isDragging }, drag] = useDrag(() => ({
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

  const [{ canDrop, isOver }, drop] = useDrop(() => ({
    accept: "default",
    drop: () => ({ path: p }),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }));

  return (
    <div className="FileListRowItem" style={upperStyle} ref={drop}>
      <div
        ref={drag}
        id={p}
        /*@ts-ignore*/
        ctxmtype={ContextMenuType.FileListRowItem}
        onClick={(e) => props.g.fsItemClick(e, { index: props.listIndex, fsi })}
        style={innerStyle}
      >
        <input type="text" defaultValue={getLastPartOfPath(fsi.path)} />
      </div>
    </div>
  );
};
