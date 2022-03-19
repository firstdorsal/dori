import { Component } from "react";
import { FsItem } from "../../types";
import FileListRow from "./FileListRow";
import { arrayToPath } from "../../utils/utils";

interface FileListProps {
    readonly fileList: FsItem[];
    readonly updateDir: Function;
    readonly showPreview: Function;
    readonly updateFsItem: Function;
}
interface FileListState {}
export default class FileList extends Component<FileListProps, FileListState> {
    render = () => {
        return (
            <div className="FileList">
                {this.props.fileList.map((fsi, i) => {
                    return (
                        <FileListRow
                            listIndex={i}
                            updateFsItem={this.props.updateFsItem}
                            key={arrayToPath(fsi.path)}
                            showPreview={this.props.showPreview}
                            updateDir={this.props.updateDir}
                            fsItem={fsi}
                        />
                    );
                })}
            </div>
        );
    };
}
