import { Fragment } from "react";
import { App } from "../../App";
import { FsItem, G } from "../../lib/types";
import Menu from "../menu/Menu";
import UrlBar from "../menu/UrlBar";
import Preview from "../preview/Preview";
import FileList from "./FileList";

export const Main = (props: {
  readonly g: G;
  readonly currentDir: string;
  readonly hostname: string;
  readonly preview: null | FsItem;
  readonly fileList: FsItem[];
  readonly listRef: any;
}) => {
  return (
    <main className="Main">
      <div>
        <Menu g={props.g}></Menu>
        <UrlBar currentDir={props.currentDir} hostname={props.hostname} g={props.g} />

        {props.preview ? <Preview fsi={props.preview}></Preview> : ""}
        <FileList listRef={props.listRef} fileList={props.fileList} g={props.g}></FileList>
      </div>
    </main>
  );
};
