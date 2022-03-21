import { CSSProperties, PureComponent } from "react";
import { FsItem } from "../../types";
import FileListRow from "./FileListRow";
import { App } from "../../App";
import { FixedSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";

interface FileListProps {
  readonly fileList: FsItem[];
  readonly updateDir: InstanceType<typeof App>["updateDir"];
  readonly showPreview: InstanceType<typeof App>["showPreview"];
  readonly updateFsItem: InstanceType<typeof App>["updateFsItems"];
}
interface FileListState {}
export default class FileList extends PureComponent<FileListProps, FileListState> {
  render = () => {
    if (this.props.fileList === undefined) return <div></div>;

    return (
      <div className="FileList">
        <AutoSizer>
          {({ height, width }) => (
            <List
              itemSize={20}
              height={height}
              itemCount={this.props.fileList.length}
              width={width}
            >
              {({ index, style }: { index: number; style: CSSProperties }) => {
                const fsi = this.props.fileList[index];
                return (
                  <FileListRow
                    style={style}
                    listIndex={index}
                    updateFsItem={this.props.updateFsItem}
                    key={fsi.path}
                    showPreview={this.props.showPreview}
                    updateDir={this.props.updateDir}
                    fsItem={fsi}
                  />
                );
              }}
            </List>
          )}
        </AutoSizer>
      </div>
    );
  };
}
