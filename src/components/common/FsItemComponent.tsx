import { PureComponent } from "react";
import { Breadcrumb } from "rsuite";
import { FsItem, FsType, G } from "../../lib/types";
import { arrayToPath, arrayUntil, defaultFsItem, pathToArray } from "../../lib/utils";
import { ListItem } from "./ListItem";

export enum FsItemComponentStyle {
  Breadcrumb,
  ListItem,
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
