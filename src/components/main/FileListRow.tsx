import { CSSProperties, PureComponent } from "react";
import { App } from "../../App";
import { FsItem, G } from "../../lib/types";
import FsItemComponent from "../common/FsItemComponent";

interface FileListRowProps {
  readonly fsItem: FsItem;
  readonly listIndex: number;
  readonly style: CSSProperties;
  readonly g: G;
}
interface FileListRowState {}
export default class FileListRow extends PureComponent<FileListRowProps, FileListRowState> {
  render = () => {
    return (
      <div style={this.props.style} className="FileListRow">
        <FsItemComponent
          listIndex={this.props.listIndex}
          g={this.props.g}
          fsItem={this.props.fsItem}
        ></FsItemComponent>
      </div>
    );
  };
}
