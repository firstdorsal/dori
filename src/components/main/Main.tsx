import { Config, FsItem, G } from "../../lib/types";
import Menu from "../menu/Menu";
import UrlBar from "../menu/UrlBar";
import Preview from "../preview/Preview";
import FileList from "./FileList";

export const Main = (props: {
  readonly g: G;
  readonly currentDir: FsItem;
  readonly hostname: string;
  readonly preview: null | FsItem;
  readonly fileList: FsItem[];
  readonly listRef: any;
  readonly config: Config;
}) => {
  return (
    <main className="Main">
      <div>
        <FileList listRef={props.listRef} fileList={props.fileList} g={props.g} />
      </div>
    </main>
  );
};
