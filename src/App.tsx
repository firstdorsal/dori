import { Component, Fragment } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import {
    arrayToPath,
    arrayUntil,
    countSelected,
    defaultConfig,
    getCurrentFileList,
    getHotkeys,
    readDir
} from "./utils/utils";
import Breadcrumb from "rsuite/Breadcrumb";
import "rsuite/dist/rsuite.min.css";
import { Config, FileListMap, FsItem, Page, UpdateFsItemOption } from "./types";

import FileList from "./components/main/FileList";
import Menu from "./components/menu/Menu";
import Preview from "./components/preview/Preview";
import { getCurrent, WebviewWindow } from "@tauri-apps/api/window";
import { sortItems } from "./utils/sort";
import { HotKeys } from "react-hotkeys";
import { readTextFile, writeFile } from "@tauri-apps/api/fs";
import { path } from "@tauri-apps/api";

import ConfigComponent from "./components/config/Config";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import UrlBar from "./components/menu/UrlBar";
import { Main } from "./components/main/Main";

interface AppProps {}
interface AppState {
    readonly fileListMap: FileListMap;
    readonly currentDir: string[];
    readonly hostname: string;
    readonly history: string[][];
    readonly historyIndex: number;
    readonly preview: null | FsItem;
    readonly config: Config | null;
    readonly currentPage: Page;
}

export class App extends Component<AppProps, AppState> {
    state = {
        fileListMap: {},
        currentDir: ["/", "home", "paul", "Downloads"],
        hostname: "",
        history: [],
        historyIndex: -1,
        preview: null,
        config: null,
        currentPage: Page.main
    };

    updateDir = async (fullDir: string[], pushHistory = true, newIndex?: number) => {
        const newDirPath = arrayToPath(fullDir);

        const newFileList = await readDir(newDirPath);

        this.setState(({ history, historyIndex }) => {
            if (pushHistory === true) {
                historyIndex++;
                history = [...arrayUntil(history, historyIndex - 1), fullDir];
            }

            if (newIndex !== undefined) {
                historyIndex = newIndex;
            }

            return {
                fileListMap: { [newDirPath]: sortItems(newFileList, "alphabetic") },
                currentDir: fullDir,
                history,
                historyIndex
            };
        });
    };

    componentDidMount = async () => {
        const hostname: string = await invoke("get_hostname");
        const config = await this.loadConfig();
        this.setState({ hostname, config });
        await this.updateDir(this.state.currentDir);
    };

    goUpDirectory = () => {
        this.updateDir(arrayUntil(this.state.currentDir, this.state.currentDir.length - 2));
    };

    reloadDirectory = () => {
        this.updateDir(this.state.currentDir, false);
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
        console.log(n);

        new WebviewWindow(n, {
            url: "/"
        });
    };

    hotkeyHandlers = {
        NEW_WINDOW: () => {
            this.newWindow();
        },
        LIST_UP: (e: any) => {
            const currentFileList = getCurrentFileList(
                this.state.fileListMap,
                this.state.currentDir
            );
            e.preventDefault();
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
            const currentFileList = getCurrentFileList(
                this.state.fileListMap,
                this.state.currentDir
            );

            e.preventDefault();
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
            const currentFileList = getCurrentFileList(
                this.state.fileListMap,
                this.state.currentDir
            );
            const [length, firstItemIndex] = countSelected(currentFileList);
            if (length === 1) {
                return this.updateDir(currentFileList[firstItemIndex].path);
            }
        },
        SELECT_FROM_TO: () => {},
        SELECT_MULTIPLE: () => {}
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
        if (configString.length === 0)
            configString = await this.writeConfig(defaultConfig, configPath);
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
                    <Main
                        newWindow={this.newWindow}
                        reloadDirectory={this.reloadDirectory}
                        goUpDirectory={this.goUpDirectory}
                        goThroughHistory={this.goThroughHistory}
                        updatePage={this.updatePage}
                        updateDir={this.updateDir}
                        showPreview={this.showPreview}
                        updateFsItem={this.updateFsItems}
                        currentDir={this.state.currentDir}
                        hostname={this.state.hostname}
                        preview={this.state.preview}
                        fileList={getCurrentFileList(this.state.fileListMap, this.state.currentDir)}
                    />
                );
            }
            default: {
                return <div>Error</div>;
            }
        }
    };

    updateFsItems = (index: number, option: UpdateFsItemOption) => {
        this.setState(({ fileListMap }) => {
            let currentFileList = getCurrentFileList(this.state.fileListMap, this.state.currentDir);

            currentFileList = currentFileList.map((fsi, i) => {
                switch (option) {
                    case UpdateFsItemOption.Selected: {
                        if (i === index) return { ...fsi, ui: { ...fsi.ui, selected: true } };
                        return { ...fsi, ui: { ...fsi.ui, selected: false } };
                    }
                    default: {
                        throw Error("Invalid option for updateFsItem");
                    }
                }
            });
            fileListMap[arrayToPath(this.state.currentDir)] = currentFileList;

            return { fileListMap };
        });
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
