import { Component, CSSProperties } from "react";
import { useDrag, useDrop } from "react-dnd";
import { Breadcrumb } from "rsuite";
import { FsItem } from "../../types";
import { arrayToPath, arrayUntil, getLast, isHidden } from "../../utils/utils";

export enum FsItemComponentStyle {
    breadcrumb = "breadcrumb",
    listItem = "listItem"
}

export interface BreadcrumbInfo {
    readonly hostname: string;
    readonly i: number;
    readonly pathItem: string;
    readonly currentDir: string[];
}

interface FsItemComponentProps {
    readonly fsItem?: FsItem;
    readonly updateDir: Function;
    readonly showPreview: Function;
    readonly itemStyle?: FsItemComponentStyle;
    readonly breadcrumbInfo?: BreadcrumbInfo;
    readonly updateFsItem?: Function;
    readonly listIndex?: number;
}
interface FsItemComponentState {}

export default class FsItemComponent extends Component<FsItemComponentProps, FsItemComponentState> {
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
                if (this.props.updateFsItem === undefined || this.props.listIndex === undefined) {
                    throw Error("Missing listIndex or updateFsItem");
                }
                return (
                    <ListItem
                        listIndex={this.props.listIndex}
                        fsItem={this.props.fsItem}
                        updateDir={this.props.updateDir}
                        showPreview={this.props.showPreview}
                        updateFsItem={this.props.updateFsItem}
                    />
                );
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
            <span className="FsItemComponent">
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

Folders cannot be dragged onto themselves


*/

const ListItem = (props: {
    fsItem?: FsItem;
    updateFsItem: Function;
    updateDir: Function;
    showPreview: Function;
    listIndex: number;
}) => {
    if (!props.fsItem) throw Error("Missing fsItem");

    const fsi = props.fsItem;
    const style: CSSProperties = {};
    style.color = isHidden(fsi.path) ? "lightgrey" : "black";
    style.background = fsi.fs_type === "d" ? "orange" : undefined;
    const p = arrayToPath(fsi.path);

    interface DropResult {
        path: string;
    }
    const [{ isDragging }, drag] = useDrag(() => ({
        type: "default",
        item: { path: p },
        end: (item, monitor) => {
            const dropResult = monitor.getDropResult<DropResult>();
            if (item && dropResult) {
                console.log(`${item.path}\n->\n${dropResult.path}`);
            }
        },
        collect: monitor => ({
            isDragging: monitor.isDragging(),
            handlerId: monitor.getHandlerId()
        })
    }));

    const [{ canDrop, isOver }, drop] = useDrop(() => ({
        accept: "default",
        drop: () => ({ path: p }),
        collect: monitor => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop()
        })
    }));

    return (
        <span
            className="FileListRowItem"
            style={{ background: props.fsItem.ui?.selected ? "background: #0162e0" : undefined }}
            ref={drop}
        >
            <span
                ref={drag}
                id={p}
                onDoubleClick={() => {
                    if (fsi.fs_type !== "-") return props.updateDir(fsi.path);
                    props.showPreview(fsi);
                }}
                onClick={() => props.updateFsItem(props.fsItem, props.listIndex)}
                style={style}
            >
                {getLast(fsi.path)}
            </span>
        </span>
    );
};
