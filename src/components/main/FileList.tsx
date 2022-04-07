import { CSSProperties, PureComponent } from "react";
import { ContextMenuType, FsItem, G } from "../../lib/types";
import FileListRow from "./FileListRow";
import { FixedSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";

interface FileListProps {
  readonly fileList: FsItem[];
  readonly g: G;
  readonly listRef: any;
}
interface FileListState {}
export default class FileList extends PureComponent<FileListProps, FileListState> {
  render = () => {
    if (this.props.fileList === undefined) return <div></div>;
    const list: FsItem[] = [];
    const indexes: number[] = [];
    this.props.fileList.forEach((fsi, i) => {
      if (fsi.ui.display) {
        list.push(fsi);
        indexes.push(i);
      }
    });

    return (
      <div
        className="FileList"
        /*@ts-ignore*/
        ctxmtype={ContextMenuType.FileList}
      >
        <AutoSizer>
          {({ height, width }) => (
            <List
              ref={this.props.listRef}
              itemSize={20}
              height={height}
              itemCount={list.length}
              width={width}
            >
              {({ index, style }: { index: number; style: CSSProperties }) => {
                const fsi = list[index];

                return (
                  <FileListRow
                    style={style}
                    listIndex={indexes[index]}
                    key={fsi.path}
                    g={this.props.g}
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
