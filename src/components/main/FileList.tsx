import { PureComponent } from "react";
import { FsItem } from "../../types";
import FileListRow from "./FileListRow";
import { arrayToPath } from "../../utils/utils";
import { App } from "../../App";

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
                {this.props.fileList.flatMap((fsi, i) => {
                    if (fsi.ui.display === false) return [];
                    return [
                        <FileListRow
                            listIndex={i}
                            updateFsItem={this.props.updateFsItem}
                            key={arrayToPath(fsi.path)}
                            showPreview={this.props.showPreview}
                            updateDir={this.props.updateDir}
                            fsItem={fsi}
                        />
                    ];
                })}
            </div>
        );
    };
}
