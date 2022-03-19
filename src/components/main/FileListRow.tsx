import { Component, CSSProperties } from "react";
import { FsItem } from "../../types";
import { arrayToPath, getLast, isHidden } from "../../utils/utils";

interface FileListRowProps {
    readonly fsItem: FsItem;
    readonly updateDir: Function;
    readonly showPreview: Function;
}
interface FileListRowState {}
export default class FileListRow extends Component<FileListRowProps, FileListRowState> {
    render = () => {
        const fsi = this.props.fsItem;
        const style: CSSProperties = {};
        style.color = isHidden(fsi.path) ? "lightgrey" : "black";
        style.background = fsi.fs_type === "d" ? "orange" : undefined;
        const p = arrayToPath(fsi.path);
        return (
            <div className="FileListRow">
                <a
                    href={p}
                    onDragStart={e => {
                        /*@ts-ignore*/
                        if (e.target?.id) e.dataTransfer.setData("Text", e.target.id);
                    }}
                    id={p}
                    onClick={() => {
                        if (fsi.fs_type !== "-") return this.props.updateDir(fsi.path);
                        this.props.showPreview(fsi);
                    }}
                    style={style}
                >
                    {getLast(fsi.path)}
                </a>
            </div>
        );
    };
}
