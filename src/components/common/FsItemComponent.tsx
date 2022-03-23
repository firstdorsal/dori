import { CSSProperties, PureComponent } from "react";
import { useDrag, useDrop } from "react-dnd";
import { Breadcrumb } from "rsuite";
import { FsItem, FsType, G } from "../../lib/types";
import {
  arrayToPath,
  arrayUntil,
  defaultFsItem,
  getLastPartOfPath,
  isHiddenPath,
  pathToArray,
} from "../../lib/utils";

export enum FsItemComponentStyle {
  Breadcrumb = 0,
  ListItem = 1,
}

export interface BreadcrumbInfo {
  readonly hostname: string;
  readonly i: number;
  readonly pathItem: string;
  readonly currentDir: string;
}

interface FsItemComponentProps {
  readonly fsItem?: FsItem;
  readonly itemStyle?: FsItemComponentStyle;
  readonly breadcrumbInfo?: BreadcrumbInfo;
  readonly listIndex?: number;
  readonly g: G;
}
interface FsItemComponentState {}

export default class FsItemComponent extends PureComponent<
  FsItemComponentProps,
  FsItemComponentState
> {
  renderBreadcrumbItem = () => {
    if (this.props.breadcrumbInfo === undefined) throw Error("Missing breadcruminfo");
    const bc = this.props.breadcrumbInfo;
    return (
      <Breadcrumb.Item
        key={bc.pathItem}
        onClick={() =>
          this.props.g.updateDir({
            ...defaultFsItem,
            path: arrayToPath(arrayUntil(pathToArray(bc.currentDir), bc.i)),
            fs_type: FsType.Directory,
          })
        }
      >
        {bc.i === 0 ? bc.hostname : bc.pathItem}
      </Breadcrumb.Item>
    );
  };

  renderCurrentStyle = (currentStyle: FsItemComponentStyle) => {
    switch (currentStyle) {
      case FsItemComponentStyle.ListItem: {
        if (this.props.g.updateFsItems === undefined || this.props.listIndex === undefined) {
          throw Error("Missing listIndex or updateFsItem");
        }
        return (
          <ListItem listIndex={this.props.listIndex} fsItem={this.props.fsItem} g={this.props.g} />
        );
      }
      case FsItemComponentStyle.Breadcrumb: {
        return this.renderBreadcrumbItem();
      }
      default: {
        return <div>Error</div>;
      }
    }
  };

  render = () => {
    return (
      <span className="FsItemComponent">
        {this.renderCurrentStyle(this.props.itemStyle ?? FsItemComponentStyle.ListItem)}
      </span>
    );
  };
}

/*
Files can be dragged
Files can NOT be a drop target

Folders can be dragged
Folders can be a drop target

FileLists cannot be dragged
FileLists can be a drop target

Folders cannot be dragged onto themselves


*/

const ListItem = (props: { fsItem?: FsItem; g: G; listIndex: number }) => {
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
        onClick={(e) => props.g.fsItemClick(e, { index: props.listIndex, fsi })}
        style={innerStyle}
      >
        {getLastPartOfPath(fsi.path)}
      </div>
    </div>
  );
};
