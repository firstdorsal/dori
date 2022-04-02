import { Config, ContextMenuType, FsItem, G } from "../../lib/types";
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
      <FileList listRef={props.listRef} fileList={props.fileList} g={props.g} />
    </main>
  );
};
