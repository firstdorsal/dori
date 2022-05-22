import { createRef, PureComponent } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import {
  countSelected,
  defaultConfig,
  defaultFsItem,
  Direction,
  getCurrentFileList,
  getHotkeys,
  getNearestVisible,
  getParentPath,
} from "../lib/utils";
import "rsuite/dist/rsuite.min.css";
import {
  ActionType,
  ClipboardType,
  Config,
  ContextMenuData,
  ContextMenuType,
  FileListMap,
  FsItem,
  FsType,
  Modal,
  Page,
  PendingAction,
  SelectionAction,
  UpdateFsItemOption,
} from "../lib/types";

import { WebviewWindow } from "@tauri-apps/api/window";
import { GlobalHotKeys, configure as configureHotkeys } from "react-hotkeys";
import { readTextFile, writeFile } from "@tauri-apps/api/fs";
import { path } from "@tauri-apps/api";

import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import ContextMenu from "../components/menu/ContextMenu";
import { handleContextMenuFileListRowItem } from "./handleContextMenu/FileListRowItem";
import { handleContextMenuFileList } from "./handleContextMenu/FileList";
import { handleAction } from "./handleActions/handleActions";
import { bookmarkFolder } from "./bookmark/bookmarkFolder";
import { updateFsItems } from "./updateFsItems/updateFsItems";
import { toggleHiddenFiles } from "./toggleHiddenFiles/toggleHiddenFiles";
import Titlebar from "../components/titlebar/Titlebar";
import { RenderPage } from "./RenderPage";
import { handleNameChange } from "./updateFsItems/handleNameChange";
import { updateDir } from "./updateDir/updateDir";

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
  readonly focus: boolean;
  readonly clipBoardType: ClipboardType;
  readonly modal: Modal;
  readonly pendingAction: PendingAction;
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
      focus: false,
      clipBoardType: ClipboardType.Copy,
      modal: Modal.None,
      pendingAction: PendingAction.None,
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
    await updateDir(this, fsi, pushHistory, newIndex);
  };

  handleBlur = () => {
    this.setState({
      focus: false,
    });
  };
  handleFocus = () => {
    this.setState({
      focus: true,
    });
  };

  componentDidMount = async () => {
    document.addEventListener("contextmenu", this.handleContextMenu);
    document.addEventListener("click", this.handleClick);
    window.addEventListener("blur", this.handleBlur);
    window.addEventListener("focus", this.handleFocus);

    const hostname: string = await invoke("get_hostname");
    const config = await this.loadConfig();
    this.setState({ hostname, config });
    await this.updateDir(this.state.currentDir);
  };

  componentWillUnmount = () => {
    document.removeEventListener("contextmenu", this.handleContextMenu);
    document.removeEventListener("click", this.handleClick);
    window.removeEventListener("blur", this.handleBlur);
    window.removeEventListener("focus", this.handleFocus);
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

    if (this.listRef?.current?.scrollToItem !== undefined) {
      this.listRef.current.scrollToItem(index, position);
    }
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
      if (this.state.pendingAction === PendingAction.Rename) return;
      this.goUpDirectory();
    },
    FOLDER_INTO: () => {
      if (this.state.pendingAction === PendingAction.Rename) return;
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
      if (this.state.pendingAction === PendingAction.Rename) return;
      this.selectMultiplePressed = false;
      this.updateFsItems(0, UpdateFsItemOption.SelectAll);
    },
  };

  toggleHiddenFiles = () => {
    toggleHiddenFiles(this);
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
    updateFsItems(this, index, option);
  };

  bookmarkFolder = (folder?: FsItem) => {
    bookmarkFolder(this, folder);
  };

  handleClick = (e: any) => {
    this.setState({
      contextMenu: null,
    });
  };

  handleContextMenu = (e: any) => {
    if (e.target === null || e.ctrlKey || e.shiftKey || e.altKey) return;

    e.preventDefault();

    const { pageX, pageY, target } = e;
    let ctxmtype =
      target?.attributes?.ctxmtype?.value ?? target?.offsetParent?.attributes?.ctxmtype?.value;
    const id: string = target?.id;
    if (ctxmtype === undefined || id === undefined) return;

    ctxmtype = parseInt(ctxmtype);
    switch (ctxmtype) {
      case ContextMenuType.FileListRowItem: {
        handleContextMenuFileListRowItem(this, id, pageX, pageY);
        break;
      }
      case ContextMenuType.FileList: {
        handleContextMenuFileList(this, id, pageX, pageY);
        break;
      }
      default: {
        throw Error("Unknown context menu type");
      }
    }
  };

  handleAction = (actionType: ActionType) => {
    handleAction(this, actionType);
  };
  handleNameChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    handleNameChange(this, e, index);
  };

  render = () => {
    if (this.state.config === null) return <div></div>;

    return (
      <div className={`App${this.state.focus ? " focus" : " blur"}`}>
        <Titlebar></Titlebar>
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
    handleNameChange: this.handleNameChange,
  };
}
