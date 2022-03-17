import { Component } from "react";
import { FsItem } from "../../types";
import { getLast, isHidden } from "../../utils/utils";
import FileListRow from "./FileListRow";
import { arrayToPath } from "../../utils/utils";

interface FileListProps {
    fileList: FsItem[];
    updateDir: Function;
    showPreview: Function;
}
interface FileListState {}
export default class FileList extends Component<FileListProps, FileListState> {
    render = () => {
        return (
            <div className="FileList">
                {this.props.fileList.map((fsi, i) => {
                    return (
                        <FileListRow
                            key={arrayToPath(fsi.path)}
                            showPreview={this.props.showPreview}
                            updateDir={this.props.updateDir}
                            fsItem={fsi}
                        ></FileListRow>
                    );
                })}
            </div>
        );
    };
}
