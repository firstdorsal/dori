import { Component, CSSProperties, PureComponent } from "react";
import { useDrag, useDrop } from "react-dnd";
import { Breadcrumb } from "rsuite";
import { App } from "../../App";
import { FsItem, FsType, UpdateFsItemOption } from "../../types";
import { arrayToPath, arrayUntil, defaultFsItem, getLast, isHiddenPath } from "../../utils/utils";

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
    readonly updateDir: InstanceType<typeof App>["updateDir"];
    readonly showPreview: InstanceType<typeof App>["showPreview"];
    readonly itemStyle?: FsItemComponentStyle;
    readonly breadcrumbInfo?: BreadcrumbInfo;
    readonly updateFsItem?: InstanceType<typeof App>["updateFsItems"];
    readonly listIndex?: number;
}
interface FsItemComponentState {}

export default class FsItemComponent extends PureComponent<
    FsItemComponentProps,
    FsItemComponentState
> {
    renderBreadcrumbItem = () => {
        if (this.props.breadcrumbInfo === undefined) throw Error("Missing breadcruminfo");
        const bc = this.props.breadcrumbInfo;
        return (
            <Breadcrumb.Item
                key={bc.pathItem}
                onClick={() =>
                    this.props.updateDir({
                        ...defaultFsItem,
                        path: arrayUntil(bc.currentDir, bc.i),
                        fs_type: FsType.Directory
                    })
                }
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
    updateFsItem: InstanceType<typeof App>["updateFsItems"];
    updateDir: InstanceType<typeof App>["updateDir"];
    showPreview: InstanceType<typeof App>["showPreview"];
    listIndex: number;
}) => {
    if (props.fsItem === undefined) throw Error("Missing fsItem");

    const fsi = props.fsItem;
    const p = arrayToPath(fsi.path);

    const innerStyle: CSSProperties = {};
    innerStyle.color = isHiddenPath(fsi.path) ? "lightgrey" : "black";
    const upperStyle: CSSProperties = {};
    if (props.fsItem.ui?.selected === true) {
        upperStyle.background = "#0c6eed";
        innerStyle.color = "white";
    }

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
        <div className="FileListRowItem" style={upperStyle} ref={drop}>
            <div
                ref={drag}
                id={p}
                onDoubleClick={() => {
                    if (fsi.fs_type !== "-") return props.updateDir(fsi);
                    props.showPreview(fsi);
                }}
                onClick={() => props.updateFsItem(props.listIndex, UpdateFsItemOption.Selected)}
                style={innerStyle}
            >
                {getLast(fsi.path)}
            </div>
        </div>
    );
};
