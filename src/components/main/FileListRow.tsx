import { Component, CSSProperties } from "react";
import { FsItem } from "../../types";
import { getLast, isHidden } from "../../utils/utils";

interface FileListRowProps {
    fsItem: FsItem;
    updateDir: Function;
    showPreview: Function;
}
interface FileListRowState {}
export default class FileListRow extends Component<FileListRowProps, FileListRowState> {
    render = () => {
        const fsi = this.props.fsItem;
        const style: CSSProperties = {};
        style.color = isHidden(fsi.path) ? "lightgrey" : undefined;
        style.background = fsi.fs_type === "d" ? "orange" : undefined;
        return (
            <div className="FileListRow">
                <button
                    onClick={() => {
                        if (fsi.fs_type !== "-") return this.props.updateDir(fsi.path);
                        this.props.showPreview(fsi);
                    }}
                    style={style}
                >
                    {getLast(fsi.path)}
                </button>
            </div>
        );
    };
}
