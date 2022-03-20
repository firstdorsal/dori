import { Component, PureComponent } from "react";
import { App } from "../../App";
import { FsItem } from "../../types";
import FsItemComponent from "../common/FsItemComponent";

interface FileListRowProps {
    readonly fsItem: FsItem;
    readonly updateDir: InstanceType<typeof App>["updateDir"];
    readonly showPreview: InstanceType<typeof App>["showPreview"];
    readonly listIndex: number;
    readonly updateFsItem: InstanceType<typeof App>["updateFsItems"];
}
interface FileListRowState {}
export default class FileListRow extends PureComponent<FileListRowProps, FileListRowState> {
    render = () => {
        return (
            <div className="FileListRow">
                <FsItemComponent
                    updateFsItem={this.props.updateFsItem}
                    listIndex={this.props.listIndex}
                    updateDir={this.props.updateDir}
                    showPreview={this.props.showPreview}
                    fsItem={this.props.fsItem}
                ></FsItemComponent>
            </div>
        );
    };
}
