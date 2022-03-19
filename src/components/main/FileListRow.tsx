import { Component } from "react";
import { FsItem } from "../../types";
import FsItemComponent from "../common/FsItemComponent";

interface FileListRowProps {
    readonly fsItem: FsItem;
    readonly updateDir: Function;
    readonly showPreview: Function;
}
interface FileListRowState {}
export default class FileListRow extends Component<FileListRowProps, FileListRowState> {
    render = () => {
        return (
            <div className="FileListRow">
                <FsItemComponent
                    updateDir={this.props.updateDir}
                    showPreview={this.props.showPreview}
                    fsItem={this.props.fsItem}
                ></FsItemComponent>
            </div>
        );
    };
}
