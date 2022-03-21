import { Component, Fragment, PureComponent } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import {
  arrayToPath,
  arrayUntil,
  countSelected,
  defaultConfig,
  defaultFsItem,
  getCurrentFileList,
  getHotkeys,
  getParentPath,
  isHiddenPath,
  mergeFileLists as getMergedFileList,
  pathToArray,
  readDir,
} from "./lib/utils";
import "rsuite/dist/rsuite.min.css";
import { Config, FileListMap, FsItem, FsType, G, Page, UpdateFsItemOption } from "./lib/types";

import { WebviewWindow } from "@tauri-apps/api/window";
import { sortItems, SortMethod } from "./lib/sort";
import { HotKeys } from "react-hotkeys";
import { readTextFile, writeFile } from "@tauri-apps/api/fs";
import { path } from "@tauri-apps/api";

import ConfigComponent from "./components/config/Config";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Main } from "./components/main/Main";
import Aside from "./components/aside/Aside";
import Split from "react-split";
import { cloneDeep } from "lodash";

interface AppProps {}
interface AppState {
  readonly fileListMap: FileListMap;
  readonly currentDir: string;
  readonly hostname: string;
  readonly history: FsItem[];
  readonly historyIndex: number;
  readonly preview: null | FsItem;
  readonly config: Config | null;
  readonly currentPage: Page;
  readonly displayHiddenFiles: boolean;
  readonly asideWidth: number;
  readonly selectMultiplePressed: boolean;
  readonly selectFromToPressed: boolean;
  readonly lastSelected: number;
}

export class App extends PureComponent<AppProps, AppState> {
  state = {
    fileListMap: {},
    currentDir: "/home/paul/Downloads/rpi-alarm",
    hostname: "",
    history: [],
    historyIndex: -1,
    preview: null,
    config: null,
    currentPage: Page.main,
    displayHiddenFiles: true,
    asideWidth: 100,
    selectMultiplePressed: false,
    selectFromToPressed: false,
    lastSelected: -1,
  };

  updateDir = async (fsi: FsItem, pushHistory = true, newIndex?: number) => {
    const newDirPath = fsi.path;

    const newFileList = await readDir(fsi);
    console.log(newFileList);

    if (newFileList === false) return;

    this.setState(({ history, historyIndex, fileListMap }) => {
      if (pushHistory === true) {
        historyIndex++;
        history = [...arrayUntil(history, historyIndex - 1), fsi];
      }

      if (newIndex !== undefined) {
        historyIndex = newIndex;
      }

      // merge the updated list with the saved list
      // updates the items that have changed in the fs but keeps
      // the state
      const currentFileList = fileListMap[newDirPath];
      let mergedFileList = currentFileList;
      if (mergedFileList === undefined) {
        mergedFileList = newFileList;
      } else {
        mergedFileList = getMergedFileList(currentFileList, newFileList);
      }

      fileListMap[newDirPath] = sortItems(mergedFileList, SortMethod.Alphabetic);
      const [length, firstItemIndex] = countSelected(fileListMap[newDirPath]);
      if (length === 0) {
        fileListMap[newDirPath][0].ui.selected = true;
      }
      return {
        fileListMap,
        currentDir: fsi.path,
        history,
        historyIndex,
      };
    });
  };

  componentDidMount = async () => {
    const hostname: string = await invoke("get_hostname");
    const config = await this.loadConfig();
    this.setState({ hostname, config });
    await this.updateDir({
      ...defaultFsItem,
      path: this.state.currentDir,
      fs_type: FsType.Directory,
    });
  };

  goUpDirectory = () => {
    this.updateDir({
      ...defaultFsItem,
      path: getParentPath(this.state.currentDir),
      fs_type: FsType.Directory,
    });
  };

  reloadDirectory = async () => {
    await this.updateDir(
      {
        ...defaultFsItem,
        path: this.state.currentDir,
        fs_type: FsType.Directory,
      },
      false
    );
  };

  goThroughHistory = (direction: "back" | "forward") => {
    let index = this.state.historyIndex;

    if (direction === "back") {
      index = Math.max(0, index - 1);
    } else if (direction === "forward") {
      index = Math.min(this.state.history.length - 1, index + 1);
    } else {
      throw Error(`Invalid history direction: ${direction}`);
    }

    console.log(this.state.history[index]);

    this.updateDir(this.state.history[index], false, index);
  };

  showPreview = (fsi: FsItem) => {
    this.setState({ preview: fsi });
  };

  newWindow = () => {
    const n = "dori" + Math.random().toString().replace(".", "");
    console.log(n);

    new WebviewWindow(n, {
      url: "/",
    });
  };

  hotkeyHandlers = {
    NEW_WINDOW: () => {
      this.setState({ selectMultiplePressed: false });
      this.newWindow();
    },
    LIST_UP: (e: any) => {
      e.preventDefault();

      const currentFileList = getCurrentFileList(this.state.fileListMap, this.state.currentDir);
      const [length, firstItemIndex] = countSelected(currentFileList);

      if (length === 0) {
        return this.updateFsItems(currentFileList.length - 1, UpdateFsItemOption.Selected);
      }

      if (length === 1) {
        return this.updateFsItems(
          firstItemIndex === 0 ? currentFileList.length - 1 : firstItemIndex - 1,
          UpdateFsItemOption.Selected
        );
      }
    },
    LIST_DOWN: (e: any) => {
      e.preventDefault();

      const currentFileList = getCurrentFileList(this.state.fileListMap, this.state.currentDir);

      const [length, firstItemIndex] = countSelected(currentFileList);
      if (length === 0) {
        return this.updateFsItems(0, UpdateFsItemOption.Selected);
      }
      if (length === 1) {
        return this.updateFsItems(
          firstItemIndex === currentFileList.length - 1 ? 0 : firstItemIndex + 1,
          UpdateFsItemOption.Selected
        );
      }
    },
    GO_UP: () => {
      this.goUpDirectory();
    },
    GO_INTO: () => {
      const currentFileList = getCurrentFileList(this.state.fileListMap, this.state.currentDir);
      const [length, firstItemIndex] = countSelected(currentFileList);
      if (length === 1) {
        return this.updateDir(currentFileList[firstItemIndex]);
      }
    },
    SELECT_FROM_TO_KEYDOWN: () => {
      this.setState({ selectFromToPressed: true });
    },
    SELECT_FROM_TO_KEYUP: () => {
      this.setState({ selectFromToPressed: false });
    },
    SELECT_MULTIPLE_KEYDOWN: () => {
      this.setState({ selectMultiplePressed: true });
    },
    SELECT_MULTIPLE_KEYUP: () => {
      this.setState({ selectMultiplePressed: false });
    },
    TOGGLE_HIDDEN_FILES: () => {
      this.setState({ selectMultiplePressed: false });
      this.toggleHiddenFiles();
    },
    SELECT_ALL: () => {
      this.setState({ selectMultiplePressed: false });
      this.updateFsItems(0, UpdateFsItemOption.SelectAll);
    },
  };

  toggleHiddenFiles = () => {
    this.setState(({ fileListMap, currentDir, displayHiddenFiles }) => {
      const currentFileList = getCurrentFileList(fileListMap, currentDir);
      fileListMap[currentDir] = currentFileList.map((fsi) => {
        const isHidden = isHiddenPath(fsi.path);
        if (isHidden === true) {
          return { ...fsi, ui: { ...fsi.ui, display: !displayHiddenFiles } };
        }
        return fsi;
      });

      return { fileListMap, displayHiddenFiles: !displayHiddenFiles };
    });
  };

  writeConfig = async (configToWrite: Config, configPath: string) => {
    const configString = JSON.stringify(configToWrite);
    await writeFile({ contents: configString, path: configPath });
    return configString;
  };

  getConfigPath = async () => {
    return await path.join(await path.configDir(), "/tauri-explorer.json");
  };

  loadConfig = async () => {
    // try to load config

    const configPath = await this.getConfigPath();
    let configString = await readTextFile(configPath).catch(async () => {
      return await this.writeConfig(defaultConfig, configPath);
    });
    if (configString.length === 0) configString = await this.writeConfig(defaultConfig, configPath);
    const config = JSON.parse(configString);
    return config;
  };

  updateConfig = async (newConfig: Config) => {
    const configPath = await this.getConfigPath();
    console.log(newConfig);

    this.setState({ config: newConfig });
    await this.writeConfig(newConfig, configPath);
  };

  updatePage = (newPage: Page) => {
    this.setState({ currentPage: newPage });
  };

  fsItemClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    data: { index?: number; fsi?: FsItem }
  ) => {
    if (e.detail === 1 && data.index !== undefined) {
      return this.updateFsItems(data.index, UpdateFsItemOption.Selected);
    }
    if (e.detail === 2 && data.fsi !== undefined && data.fsi.fs_type !== "-") {
      return this.updateDir(data.fsi);
    }
    if (data.fsi !== undefined) return this.showPreview(data.fsi);
  };

  updateFsItems = (index: number, option: UpdateFsItemOption) => {
    this.setState(({ fileListMap, selectMultiplePressed, selectFromToPressed, lastSelected }) => {
      fileListMap = cloneDeep(fileListMap);
      fileListMap[this.state.currentDir] = fileListMap[this.state.currentDir].map((fsi, i) => {
        switch (option) {
          case UpdateFsItemOption.Selected: {
            if (selectMultiplePressed === true) {
              if (i === index) {
                fsi.ui.selected = !fsi.ui.selected;
              }
              return fsi;
            }

            if (selectFromToPressed === true) {
              if (i <= Math.max(lastSelected, index) && i >= Math.min(lastSelected, index)) {
                fsi.ui.selected = true;
              }
              return fsi;
            }

            if (i === index) {
              fsi.ui.selected = true;
            } else {
              fsi.ui.selected = false;
            }

            return fsi;
          }
          case UpdateFsItemOption.SelectAll: {
            if (fsi.ui.display === true) {
              fsi.ui.selected = true;
            }
            return fsi;
          }

          default: {
            throw Error("Invalid option for updateFsItem");
          }
        }
      });

      return { fileListMap, lastSelected: index };
    });
  };

  g: G = {
    newWindow: this.newWindow,
    reloadDirectory: this.reloadDirectory,
    goUpDirectory: this.goUpDirectory,
    goThroughHistory: this.goThroughHistory,
    updatePage: this.updatePage,
    updateDir: this.updateDir,
    showPreview: this.showPreview,
    updateFsItems: this.updateFsItems,
    fsItemClick: this.fsItemClick,
  };

  renderPage = (page: Page) => {
    if (this.state.config === null) return <div></div>;

    switch (page) {
      case "config": {
        return (
          <ConfigComponent
            updatePage={this.updatePage}
            config={this.state.config}
            updateConfig={this.updateConfig}
          />
        );
      }
      case "main": {
        return (
          <Fragment>
            <Split className="split" sizes={[10, 90]} minSize={100} gutterSize={5} snapOffset={0}>
              <Aside />

              <Main
                g={this.g}
                currentDir={this.state.currentDir}
                hostname={this.state.hostname}
                preview={this.state.preview}
                fileList={getCurrentFileList(this.state.fileListMap, this.state.currentDir)}
              />
            </Split>
          </Fragment>
        );
      }
      default: {
        return <div>Error</div>;
      }
    }
  };

  render = () => {
    if (this.state.config === null) return <div></div>;

    return (
      <div className="App">
        <HotKeys keyMap={getHotkeys(this.state.config)} handlers={this.hotkeyHandlers}>
          <DndProvider backend={HTML5Backend}>
            {this.renderPage(this.state.currentPage)}
          </DndProvider>
        </HotKeys>
      </div>
    );
  };
}
