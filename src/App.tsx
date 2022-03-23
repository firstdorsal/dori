import { createRef, Fragment, PureComponent } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import {
  arrayUntil,
  countSelected,
  defaultConfig,
  defaultFsItem,
  Direction,
  getCurrentFileList,
  getHotkeys,
  getNearestVisible,
  getParentPath,
  isHiddenPath,
  getMergedFileList,
  readDir,
} from "./lib/utils";
import "rsuite/dist/rsuite.min.css";
import { Config, FileListMap, FsItem, FsType, G, Page, UpdateFsItemOption } from "./lib/types";
import update from "immutability-helper";

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
  readonly lastSelected: number;
  readonly lastSelectionAction: SelectionAction;
}

export enum SelectionAction {
  Single = 0,
  Multiple = 1,
}

export class App extends PureComponent<AppProps, AppState> {
  listRef: any;
  selectMultiplePressed: boolean;
  selectFromToPressed: boolean;
  constructor(props: any) {
    super(props);
    this.state = {
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
      lastSelected: -1,
      lastSelectionAction: SelectionAction.Single,
    };
    this.listRef = createRef();
    this.selectMultiplePressed = false;
    this.selectFromToPressed = false;
  }

  updateDir = async (fsi: FsItem, pushHistory = true, newIndex?: number) => {
    const newDirPath = fsi.path;

    const newFileList = await readDir(fsi);

    if (newFileList === false) return;

    this.setState(
      ({ history, historyIndex, fileListMap, lastSelected, currentDir, lastSelectionAction }) => {
        if (pushHistory === true) {
          historyIndex++;
          history = [...arrayUntil(history, historyIndex - 1), fsi];
        }

        if (newIndex !== undefined) {
          historyIndex = newIndex;
        }
        // TODO
        // merge the updated list with the saved list
        // updates the items that have changed in the fs but keeps the ui related ones
        const currentFileList = fileListMap[newDirPath];
        let mergedFileList = currentFileList;
        if (mergedFileList === undefined) {
          mergedFileList = newFileList;
        } else {
          mergedFileList = getMergedFileList(currentFileList, newFileList);
        }

        fileListMap[newDirPath] = sortItems(mergedFileList, SortMethod.Alphabetic);

        const [length, firstVisibleItemIndex] = countSelected(fileListMap[newDirPath]);

        if (fileListMap[newDirPath].length !== 0) {
          if (length === 0) {
            fileListMap[newDirPath][0].ui.selected = true;
            lastSelected = 0;
          } else {
            if (length > 1) {
              lastSelectionAction = SelectionAction.Multiple;
            }
            if (newDirPath !== currentDir) {
              lastSelected = firstVisibleItemIndex;
            }
          }
        }
        return {
          fileListMap,
          currentDir: newDirPath,
          lastSelected,
          lastSelectionAction,
          history,
          historyIndex,
        };
      }
    );
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
    // TODO select the directory we were last in
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

    this.updateDir(this.state.history[index], false, index);
  };

  showPreview = (fsi: FsItem) => {
    this.setState({ preview: fsi });
  };

  newWindow = () => {
    const n = "dori" + Math.random().toString().replace(".", "");
    new WebviewWindow(n, {
      url: "/",
    });
  };

  hotkeyHandlers = {
    NEW_WINDOW: () => {
      this.selectMultiplePressed = true;
      this.newWindow();
    },
    LIST_UP: (e: any) => {
      e.preventDefault();

      const currentFileList = getCurrentFileList(this.state.fileListMap, this.state.currentDir);

      const [length, firstSelectedIndex] = countSelected(currentFileList);

      if (length === 0) {
        return this.updateFsItems(currentFileList.length - 1, UpdateFsItemOption.Selected);
      }

      if (length === 1) {
        const nearest = getNearestVisible(currentFileList, firstSelectedIndex, Direction.Previous);
        if (nearest === undefined) return;
        this.listRef.current.scrollToItem(nearest);
        return this.updateFsItems(nearest, UpdateFsItemOption.Selected);
      }
    },
    LIST_DOWN: (e: any) => {
      e.preventDefault();

      const currentFileList = getCurrentFileList(this.state.fileListMap, this.state.currentDir);

      const [length, firstSelectedIndex] = countSelected(currentFileList);

      if (length === 0) {
        return this.updateFsItems(0, UpdateFsItemOption.Selected);
      }

      if (length === 1) {
        const nearest = getNearestVisible(currentFileList, firstSelectedIndex, Direction.Next);

        if (nearest === undefined) return;
        this.listRef.current.scrollToItem(nearest);

        return this.updateFsItems(nearest, UpdateFsItemOption.Selected);
      }
    },
    FOLDER_UP: () => {
      this.goUpDirectory();
    },
    FOLDER_INTO: () => {
      const currentFileList = getCurrentFileList(this.state.fileListMap, this.state.currentDir);

      const [length, firstSelectedIndex] = countSelected(currentFileList);

      if (length === 1) {
        return this.updateDir(currentFileList[firstSelectedIndex]);
      }
    },
    SELECT_FROM_TO_KEYDOWN: () => {
      this.selectFromToPressed = true;
    },
    SELECT_FROM_TO_KEYUP: () => {
      this.selectFromToPressed = false;
    },
    SELECT_MULTIPLE_KEYDOWN: () => {
      this.selectMultiplePressed = true;
    },
    SELECT_MULTIPLE_KEYUP: () => {
      this.selectMultiplePressed = false;
    },
    TOGGLE_HIDDEN_FILES: () => {
      this.selectMultiplePressed = false;
      this.toggleHiddenFiles();
    },
    SELECT_ALL: () => {
      this.selectMultiplePressed = false;
      this.updateFsItems(0, UpdateFsItemOption.SelectAll);
    },
  };

  toggleHiddenFiles = () => {
    this.setState(
      ({ fileListMap, currentDir, displayHiddenFiles, lastSelected }) => {
        displayHiddenFiles = !displayHiddenFiles;

        let selectCount = 0;
        fileListMap = update(fileListMap, {
          [currentDir]: {
            $apply: (v: FsItem[]) =>
              v.map((fsi) => {
                if (isHiddenPath(fsi.path) === true) {
                  fsi = cloneDeep(fsi);
                  fsi.ui.display = displayHiddenFiles;
                  if (displayHiddenFiles === false) {
                    fsi.ui.selected = false;
                  }
                  return fsi;
                } else {
                  if (fsi.ui.selected) selectCount += 1;
                }
                return fsi;
              }),
          },
        });

        let firstVisibleItemIndex = -1;
        if (displayHiddenFiles === false && selectCount === 0) {
          for (let i = 0; i < fileListMap[currentDir].length; i++) {
            let fsi = fileListMap[currentDir][i];
            if (fsi.ui.display === true) {
              firstVisibleItemIndex = i;
              break;
            }
          }
        }

        if (firstVisibleItemIndex !== -1) {
          lastSelected = firstVisibleItemIndex;
          fileListMap = update(fileListMap, {
            [currentDir]: {
              [firstVisibleItemIndex]: { ui: { selected: { $set: true } } },
            },
          });
        }

        return { fileListMap, displayHiddenFiles, lastSelected };
      },
      () => {
        this.listRef.current.scrollToItem(this.state.lastSelected, "center");
      }
    );
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
    const configPath = await this.getConfigPath();

    // try to load the config
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
    console.time();

    // TODO update the visisble lines before the rest

    this.setState(({ fileListMap, lastSelected, currentDir, lastSelectionAction }) => {
      if (option === UpdateFsItemOption.Selected) {
        if (this.selectMultiplePressed === true) {
          fileListMap = update(fileListMap, {
            [currentDir]: {
              [index]: { ui: { selected: { $apply: (s) => !s } } },
            },
          });
          lastSelectionAction = SelectionAction.Multiple;
        } else if (this.selectFromToPressed === true) {
          fileListMap = update(fileListMap, {
            [currentDir]: {
              $apply: (v: FsItem[]) =>
                v.map((fsi, i) => {
                  if (i <= Math.max(lastSelected, index) && i >= Math.min(lastSelected, index)) {
                    fsi.ui.selected = true;
                  }
                  return fsi;
                }),
            },
          });
          lastSelectionAction = SelectionAction.Multiple;
        } else {
          // handle a single select click
          // deselect all if the last action selected multiple items
          if (lastSelectionAction === SelectionAction.Multiple) {
            fileListMap = update(fileListMap, {
              [currentDir]: {
                $apply: (v: FsItem[]) =>
                  v.map((fsi) => {
                    fsi.ui.selected = false;
                    return fsi;
                  }),
              },
            });
          }
          fileListMap = update(fileListMap, {
            [currentDir]: {
              [index]: { ui: { selected: { $set: true } } },
              ...(lastSelected !== -1 &&
                lastSelected !== index && {
                  [lastSelected]: { ui: { selected: { $set: false } } },
                }),
            },
          });

          lastSelectionAction = SelectionAction.Single;
        }
      } else if (option === UpdateFsItemOption.SelectAll) {
        fileListMap = update(fileListMap, {
          [currentDir]: {
            $apply: (v: FsItem[]) =>
              v.map((fsi) => {
                fsi.ui.selected = true;
                return fsi;
              }),
          },
        });
        lastSelectionAction = SelectionAction.Multiple;
      }

      console.timeEnd();

      return { fileListMap, lastSelected: index, lastSelectionAction };
    });
  };

  g = {
    newWindow: this.newWindow,
    reloadDirectory: this.reloadDirectory,
    goUpDirectory: this.goUpDirectory,
    goThroughHistory: this.goThroughHistory,
    updatePage: this.updatePage,
    updateDir: this.updateDir,
    showPreview: this.showPreview,
    updateFsItems: this.updateFsItems,
    fsItemClick: this.fsItemClick,
    updateConfig: this.updateConfig,
  };

  render = () => {
    if (this.state.config === null) return <div></div>;

    return (
      <div className="App">
        <HotKeys keyMap={getHotkeys(this.state.config)} handlers={this.hotkeyHandlers}>
          <DndProvider backend={HTML5Backend}>
            {this.state.config === null ? (
              <div></div>
            ) : (
              <RenderPage
                fileList={getCurrentFileList(this.state.fileListMap, this.state.currentDir)}
                config={this.state.config}
                g={this.g}
                page={this.state.currentPage}
                listRef={this.listRef}
                currentDir={this.state.currentDir}
                hostname={this.state.hostname}
                preview={this.state.preview}
              />
            )}
          </DndProvider>
        </HotKeys>
      </div>
    );
  };
}

const RenderPage = (props: {
  page: Page;
  g: G;
  config: Config;
  listRef: any;
  currentDir: string;
  hostname: string;
  preview: FsItem | null;
  fileList: FsItem[];
}) => {
  switch (props.page) {
    case "config": {
      return (
        <ConfigComponent
          updatePage={props.g.updatePage}
          config={props.config}
          updateConfig={props.g.updateConfig}
        />
      );
    }
    case "main": {
      return (
        <Fragment>
          <Split className="split" sizes={[10, 90]} minSize={100} gutterSize={5} snapOffset={0}>
            <Aside />

            <Main
              g={props.g}
              listRef={props.listRef}
              currentDir={props.currentDir}
              hostname={props.hostname}
              preview={props.preview}
              fileList={props.fileList}
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
