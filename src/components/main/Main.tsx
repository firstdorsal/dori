import { Fragment } from "react";
import { App } from "../../App";
import { FsItem } from "../../types";
import Menu from "../menu/Menu";
import UrlBar from "../menu/UrlBar";
import Preview from "../preview/Preview";
import FileList from "./FileList";

export const Main = (props: {
    readonly newWindow: InstanceType<typeof App>["newWindow"];
    readonly reloadDirectory: InstanceType<typeof App>["reloadDirectory"];
    readonly goUpDirectory: InstanceType<typeof App>["goUpDirectory"];
    readonly goThroughHistory: InstanceType<typeof App>["goThroughHistory"];
    readonly updatePage: InstanceType<typeof App>["updatePage"];
    readonly updateDir: InstanceType<typeof App>["updateDir"];
    readonly updateFsItem: InstanceType<typeof App>["updateFsItems"];

    readonly currentDir: string;
    readonly hostname: string;
    readonly preview: null | FsItem;
    readonly fileList: FsItem[];

    readonly showPreview: InstanceType<typeof App>["showPreview"];
}) => {
    return (
        <main className="Main">
            <div>
                <Menu
                    reloadDirectory={props.reloadDirectory}
                    goUpDirectory={props.goUpDirectory}
                    goThroughHistory={props.goThroughHistory}
                    updatePage={props.updatePage}
                ></Menu>
                <UrlBar
                    currentDir={props.currentDir}
                    hostname={props.hostname}
                    showPreview={props.showPreview}
                    updateDir={props.updateDir}
                />

                {props.preview ? <Preview fsi={props.preview}></Preview> : ""}
                <FileList
                    showPreview={props.showPreview}
                    fileList={props.fileList}
                    updateDir={props.updateDir}
                    updateFsItem={props.updateFsItem}
                ></FileList>
            </div>
        </main>
    );
};
