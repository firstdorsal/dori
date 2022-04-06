import { Fragment, useState } from "react";
import Split from "react-split";
import Aside from "../components/aside/Aside";
import ConfigComponent from "../components/config/Config";
import { Main } from "../components/main/Main";
import Menu from "../components/menu/Menu";
import Preview from "../components/preview/Preview";
import { G, Config, FsItem, Page } from "../lib/types";
import { Modal } from "rsuite";

export const RenderPage = (props: {
  page: Page;
  g: G;
  config: Config;
  listRef: any;
  currentDir: FsItem;
  hostname: string;
  preview: FsItem | null;
  fileList: FsItem[];
}) => {
  const [open, setOpen] = useState(false);
  switch (props.page) {
    case Page.config: {
      return (
        <ConfigComponent
          updatePage={props.g.updatePage}
          config={props.config}
          updateConfig={props.g.updateConfig}
        />
      );
    }
    case Page.main: {
      return (
        <Fragment>
          <Modal open={open} onClose={() => setOpen(false)}></Modal>
          <Menu
            hostname={props.hostname}
            config={props.config}
            currentDir={props.currentDir}
            g={props.g}
          />
          <Split
            className="split"
            sizes={[10, 70, 20]}
            minSize={[100, 300, 100]}
            gutterSize={5}
            snapOffset={0}
          >
            <Aside g={props.g} config={props.config} />

            <Main
              g={props.g}
              listRef={props.listRef}
              currentDir={props.currentDir}
              hostname={props.hostname}
              preview={props.preview}
              fileList={props.fileList}
              config={props.config}
            />
            <Preview fsi={props.preview} />
          </Split>
        </Fragment>
      );
    }
    default: {
      return <div>Error</div>;
    }
  }
};
