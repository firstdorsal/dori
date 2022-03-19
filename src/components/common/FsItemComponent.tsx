import { Component, CSSProperties } from "react";
import { Breadcrumb } from "rsuite";
import { FsItem } from "../../types";
import { arrayToPath, arrayUntil, getLast, isHidden } from "../../utils/utils";

export enum FsItemComponentStyle {
    breadcrumb = "breadcrumb",
    listItem = "listItem"
}

interface FsItemComponentProps {
    readonly fsItem?: FsItem;
    readonly updateDir: Function;
    readonly showPreview: Function;
    readonly itemStyle?: FsItemComponentStyle;
    readonly breadcrumbInfo?: {
        hostname: string;
        i: number;
        pathItem: string;
        currentDir: string[];
    };
}
interface FsItemComponentState {}

export default class FsItemComponent extends Component<FsItemComponentProps, FsItemComponentState> {
    renderListItem = () => {
        if (!this.props.fsItem) throw Error("Missing fsItem");

        const fsi = this.props.fsItem;
        const style: CSSProperties = {};
        style.color = isHidden(fsi.path) ? "lightgrey" : "black";
        style.background = fsi.fs_type === "d" ? "orange" : undefined;
        const p = arrayToPath(fsi.path);
        return (
            <button
                id={p}
                onClick={() => {
                    if (fsi.fs_type !== "-") return this.props.updateDir(fsi.path);
                    this.props.showPreview(fsi);
                }}
                style={style}
            >
                {getLast(fsi.path)}
            </button>
        );
    };

    renderBreadcrumbItem = () => {
        if (!this.props.breadcrumbInfo) throw Error("Missing breadcruminfo");
        const bc = this.props.breadcrumbInfo;
        return (
            <Breadcrumb.Item
                key={bc.pathItem}
                onClick={() => this.props.updateDir(arrayUntil(bc.currentDir, bc.i))}
            >
                {bc.i === 0 ? bc.hostname : bc.pathItem}
            </Breadcrumb.Item>
        );
    };

    renderCurrentStyle = (currentStyle: FsItemComponentStyle) => {
        switch (currentStyle) {
            case FsItemComponentStyle.listItem: {
                return this.renderListItem();
            }
            case FsItemComponentStyle.breadcrumb: {
                return this.renderBreadcrumbItem();
            }
            default: {
                return <div>Error</div>;
            }
        }
    };

    render = () => {
        return (
            <span className="FsObject">
                {this.renderCurrentStyle(this.props.itemStyle ?? FsItemComponentStyle.listItem)}
            </span>
        );
    };
}

/*
Files can be dragged
Files can NOT be a drop target

Folders can be dragged
Folders can be a drop target

FileLists cannot be dragged
FileLists can be a drop target


*/
