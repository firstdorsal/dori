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
  getLastPartOfPath,
  isBookmarked,
  getFsItemByDirname,
  getSelectedFiles,
} from "./lib/utils";
import "rsuite/dist/rsuite.min.css";
import {
  Action,
  ActionType,
  Config,
  ContextMenuData,
  FileListMap,
  FsItem,
  FsType,
  G,
  Page,
  SelectionAction,
  UpdateFsItemOption,
} from "./lib/types";
import update from "immutability-helper";

import { WebviewWindow } from "@tauri-apps/api/window";
import { sortItems, SortMethod } from "./lib/sort";
import { GlobalHotKeys, configure as configureHotkeys } from "react-hotkeys";
import { readTextFile, writeFile } from "@tauri-apps/api/fs";
import { path } from "@tauri-apps/api";

import ConfigComponent from "./components/config/Config";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Main } from "./components/main/Main";
import Aside from "./components/aside/Aside";
import Split from "react-split";
import { cloneDeep } from "lodash";
import ContextMenu from "./components/menu/ContextMenu";
import Menu from "./components/menu/Menu";
import Preview from "./components/preview/Preview";

configureHotkeys({ ignoreTags: [] });

interface AppState {
  readonly fileListMap: FileListMap;
  readonly currentDir: FsItem;
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
  readonly contextMenu: ContextMenuData | null;
  readonly clipboard: FsItem[];
}

export class App extends PureComponent<{}, AppState> {
  listRef: any;
  selectMultiplePressed: boolean;
  selectFromToPressed: boolean;
  visibleItems: number;
  dev: boolean;

  constructor(props: any) {
    super(props);
    this.state = {
      fileListMap: {},
      currentDir: {
        ...defaultFsItem,
        path: "/home/paul/Downloads/rpi-alarm",
        fs_type: FsType.Directory,
      },
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
      contextMenu: null,
      clipboard: [],
    };
    this.listRef = createRef();
    this.selectMultiplePressed = false;
    this.selectFromToPressed = false;
    this.visibleItems = 0;
    this.dev = true;
  }

  updateDirByPath = async (path: string, pushHistory?: boolean) => {
    await this.updateDir(
      {
        ...defaultFsItem,
        path: path,
        fs_type: FsType.Directory,
      },
      pushHistory
    );
  };

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
        // TODO update the visisble lines before the rest
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
            if (newDirPath !== currentDir.path) {
              lastSelected = firstVisibleItemIndex;
            }
          }
        }
        currentDir = update(currentDir, { path: { $set: newDirPath } });

        return {
          fileListMap,
          currentDir,
          lastSelected,
          lastSelectionAction,
          history,
          historyIndex,
        };
      }
    );
  };

  handleBlur = () => {};

  componentDidMount = async () => {
    document.addEventListener("contextmenu", this.handleContextMenu);
    document.addEventListener("click", this.handleClick);
    window.addEventListener("blur", this.handleBlur);

    const hostname: string = await invoke("get_hostname");
    const config = await this.loadConfig();
    this.setState({ hostname, config });
    await this.updateDir(this.state.currentDir);
  };

  goUpDirectory = () => {
    // TODO select the directory we were last in
    this.updateDirByPath(getParentPath(this.state.currentDir.path));
  };

  reloadDirectory = async () => {
    await this.updateDir(this.state.currentDir, false);
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

  scrollElementIntoView = (index: number, position?: string) => {
    this.visibleItems = index;
    this.listRef.current.scrollToItem(index, position);
  };

  hotkeyHandlers = {
    NEW_WINDOW: () => {
      this.selectMultiplePressed = true;
      this.newWindow();
    },
    LIST_UP: (e: any) => {
      e.preventDefault();

      const currentFileList = getCurrentFileList(
        this.state.fileListMap,
        this.state.currentDir.path
      );

      const [length, firstSelectedIndex] = countSelected(currentFileList);

      if (length === 0) {
        return this.updateFsItems(currentFileList.length - 1, UpdateFsItemOption.Selected);
      }

      if (length === 1) {
        const nearest = getNearestVisible(currentFileList, firstSelectedIndex, Direction.Previous);
        if (nearest === undefined) return;
        this.scrollElementIntoView(nearest);
        return this.updateFsItems(nearest, UpdateFsItemOption.Selected);
      }
    },
    LIST_DOWN: (e: any) => {
      e.preventDefault();

      const currentFileList = getCurrentFileList(
        this.state.fileListMap,
        this.state.currentDir.path
      );

      const [length, firstSelectedIndex] = countSelected(currentFileList);

      if (length === 0) {
        return this.updateFsItems(0, UpdateFsItemOption.Selected);
      }

      if (length === 1) {
        const nearest = getNearestVisible(currentFileList, firstSelectedIndex, Direction.Next);

        if (nearest === undefined) return;

        this.scrollElementIntoView(nearest);
        return this.updateFsItems(nearest, UpdateFsItemOption.Selected);
      }
    },
    FOLDER_UP: () => {
      this.goUpDirectory();
    },
    FOLDER_INTO: () => {
      const currentFileList = getCurrentFileList(
        this.state.fileListMap,
        this.state.currentDir.path
      );

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
          [currentDir.path]: {
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
          for (let i = 0; i < fileListMap[currentDir.path].length; i++) {
            let fsi = fileListMap[currentDir.path][i];
            if (fsi.ui.display === true) {
              firstVisibleItemIndex = i;
              break;
            }
          }
        }

        if (firstVisibleItemIndex !== -1) {
          lastSelected = firstVisibleItemIndex;
          fileListMap = update(fileListMap, {
            [currentDir.path]: {
              [firstVisibleItemIndex]: { ui: { selected: { $set: true } } },
            },
          });
        }

        return { fileListMap, displayHiddenFiles, lastSelected };
      },
      () => {
        this.scrollElementIntoView(this.state.lastSelected, "center");
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
      if (this.state.config?.hotkeys.keyMap.SELECT_MULTIPLE === "ctrl") {
        this.selectMultiplePressed = e.ctrlKey;
      }

      if (this.state.config?.hotkeys.keyMap.SELECT_FROM_TO === "shift") {
        this.selectFromToPressed = e.shiftKey;
      }

      return this.updateFsItems(data.index, UpdateFsItemOption.Selected);
    }
    if (e.detail === 2 && data.fsi !== undefined && data.fsi.fs_type !== "-") {
      return this.updateDir(data.fsi);
    }
    if (data.fsi !== undefined) return this.showPreview(data.fsi);
  };

  // TODO fix problems onblur hotkeys not selecting with ctrl on window loose focus and reenter

  updateFsItems = (index: number, option: UpdateFsItemOption) => {
    this.setState(({ fileListMap, lastSelected, currentDir, lastSelectionAction }) => {
      if (option === UpdateFsItemOption.Selected) {
        if (this.selectMultiplePressed === true) {
          fileListMap = update(fileListMap, {
            [currentDir.path]: {
              [index]: { ui: { selected: { $apply: (s) => !s } } },
            },
          });
          lastSelectionAction = SelectionAction.Multiple;
        } else if (this.selectFromToPressed === true) {
          fileListMap = update(fileListMap, {
            [currentDir.path]: {
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
              [currentDir.path]: {
                $apply: (v: FsItem[]) =>
                  v.map((fsi) => {
                    fsi.ui.selected = false;
                    return fsi;
                  }),
              },
            });
          }
          fileListMap = update(fileListMap, {
            [currentDir.path]: {
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
          [currentDir.path]: {
            $apply: (v: FsItem[]) =>
              v.map((fsi) => {
                fsi.ui.selected = true;
                return fsi;
              }),
          },
        });
        lastSelectionAction = SelectionAction.Multiple;
      }

      return { fileListMap, lastSelected: index, lastSelectionAction };
    });
  };

  bookmarkFolder = (folder?: FsItem) => {
    if (folder === undefined) folder = this.state.currentDir;
    let newConfig;
    if (!this.state.config) return;
    if (isBookmarked(folder, this.state.config) === false) {
      let name = getLastPartOfPath(folder.path);
      if (name.length === 0) {
        name = this.state.hostname;
      }
      newConfig = update(this.state.config, {
        bookmarks: {
          list: {
            $push: [{ icon: "", location: folder.path, name }],
          },
        },
      });
    } else {
      newConfig = update(this.state.config, {
        bookmarks: {
          list: {
            $apply: (
              v: {
                location: string;
                name: string;
                icon: string;
              }[]
            ) =>
              v.filter((bm) => {
                return bm.location !== folder?.path;
              }),
          },
        },
      });
    }
    if (newConfig === null) return;
    this.updateConfig(newConfig);
  };

  addToFavorites = () => {};

  handleClick = (e: any) => {
    this.setState({
      contextMenu: null,
    });
  };

  handleContextMenu = (e: any) => {
    console.log(e);

    if (e.target === null || e.ctrlKey || e.shiftKey || e.altKey) return;

    e.preventDefault();

    const { pageX, pageY, target } = e;
    let ctxmtype = target.attributes?.ctxmtype?.value;
    const id: string = target.id;

    if (ctxmtype === undefined || id === undefined) return;
    console.log(ctxmtype);

    ctxmtype = parseInt(ctxmtype);

    const [fsi, index] = getFsItemByDirname(this.state.fileListMap[this.state.currentDir.path], id);

    this.setState(({ lastSelectionAction, fileListMap, lastSelected, currentDir, contextMenu }) => {
      if (fsi.ui.selected === false) {
        fileListMap = update(fileListMap, {
          [currentDir.path]: {
            $apply: (v: FsItem[]) =>
              v.map((fsi) => {
                fsi.ui.selected = false;
                return fsi;
              }),
          },
        });

        fileListMap = update(fileListMap, {
          [currentDir.path]: {
            [index]: { ui: { selected: { $set: true } } },
            ...(lastSelected !== -1 &&
              lastSelected !== index && {
                [lastSelected]: { ui: { selected: { $set: false } } },
              }),
          },
        });
      }
      contextMenu = {
        x: pageX,
        y: pageY,
        type: ctxmtype,
        id,
        fsi,
        multiple: lastSelectionAction === SelectionAction.Multiple,
        dev: this.dev,
      };

      return {
        lastSelected: index,
        fileListMap,
        contextMenu,
      };
    });
  };

  componentWillUnmount = () => {
    document.removeEventListener("contextmenu", this.handleContextMenu);
    document.removeEventListener("click", this.handleClick);
    window.removeEventListener("blur", this.handleBlur);
  };

  handleAction = (action: Action) => {
    console.log(action);

    switch (action.type) {
      case ActionType.LOG: {
        const selected = getSelectedFiles(this.state.fileListMap[this.state.currentDir.path]);
        console.log(selected);
        break;
      }
      case ActionType.COPY: {
        this.setState(({ fileListMap, currentDir }) => {
          const selected = getSelectedFiles(fileListMap[currentDir.path]);

          return {
            clipboard: selected,
          };
        });
        break;
      }
      case ActionType.PASTE: {
        this.setState(({ clipboard, currentDir, fileListMap }) => {
          console.log(currentDir, clipboard);
        });
        break;
      }

      case ActionType.CUT: {
        break;
      }
      case ActionType.DELETE: {
        break;
      }
      case ActionType.DUPLICATE: {
        break;
      }
      case ActionType.COPY_PATH: {
        break;
      }
      case ActionType.COPY_NAME: {
        break;
      }
      case ActionType.EXECUTE: {
        break;
      }
      case ActionType.OPEN_WITH: {
        break;
      }
      case ActionType.RENAME: {
        break;
      }
      case ActionType.EDIT_PERMS: {
        break;
      }
      case ActionType.UNMOUNT_VOLUME: {
        break;
      }
      case ActionType.DECRYPT: {
        break;
      }
      case ActionType.ENCRYPT: {
        break;
      }
      case ActionType.EXTRACT: {
        break;
      }
      case ActionType.ARCHIVE: {
        break;
      }
      case ActionType.PROPERTIES: {
        break;
      }
      case ActionType.OPEN_TERMINAL: {
        break;
      }
      case ActionType.RUN_IN_TERMINAL: {
        break;
      }
      case ActionType.SQUOOSH_IMAGE: {
        break;
      }
      case ActionType.SEND_VIA_MAIL: {
        break;
      }
      case ActionType.QUICK_LOCAL_SHARE: {
        break;
      }
      case ActionType.SQUOOSH_IMAGE_SEND_VIA_MAIL: {
        break;
      }
      case ActionType.SYNC_WITH: {
        break;
      }
      case ActionType.VALIDATE_CHECKSUM: {
        break;
      }
      case ActionType.GIT_CLONE: {
        break;
      }
      case ActionType.GIT_CLONE_INTO_HERE: {
        break;
      }
      case ActionType.OPEN_REMOTE: {
        break;
      }
      case ActionType.DOCKER_COMPOSE_UP: {
        break;
      }
      case ActionType.DS: {
        break;
      }

      default:
        throw Error("Invalid action");
    }
  };

  render = () => {
    if (this.state.config === null) return <div></div>;

    return (
      <div className="App">
        <GlobalHotKeys keyMap={getHotkeys(this.state.config)} handlers={this.hotkeyHandlers} />
        <DndProvider backend={HTML5Backend}>
          {this.state.contextMenu !== null && (
            <ContextMenu
              g={this.g}
              config={this.state.config}
              contextMenu={this.state.contextMenu}
            />
          )}

          <RenderPage
            fileList={getCurrentFileList(this.state.fileListMap, this.state.currentDir.path)}
            config={this.state.config}
            g={this.g}
            page={this.state.currentPage}
            listRef={this.listRef}
            currentDir={this.state.currentDir}
            hostname={this.state.hostname}
            preview={this.state.preview}
          />
        </DndProvider>
      </div>
    );
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
    bookmarkFolder: this.bookmarkFolder,
    updateDirByPath: this.updateDirByPath,
    handleAction: this.handleAction,
  };
}

const RenderPage = (props: {
  page: Page;
  g: G;
  config: Config;
  listRef: any;
  currentDir: FsItem;
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
