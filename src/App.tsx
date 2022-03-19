import { Component, Fragment } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { arrayToPath, arrayUntil, defaultConfig, getHotkeys } from "./utils/utils";
import Breadcrumb from "rsuite/Breadcrumb";
import "rsuite/dist/rsuite.min.css";
import { Config, FsItem, Page } from "./types";
import { FiChevronRight } from "react-icons/fi";

import FileList from "./components/main/FileList";
import Menu from "./components/menu/Menu";
import Preview from "./components/preview/Preview";
import { WebviewWindow } from "@tauri-apps/api/window";
import { sortItems } from "./utils/sort";
import { HotKeys } from "react-hotkeys";
import { readTextFile, writeFile } from "@tauri-apps/api/fs";
import { path } from "@tauri-apps/api";

import { configSchema } from "./utils/configSchema";
import ConfigComponent from "./components/config/Config";
import FsItemComponent, { FsItemComponentStyle } from "./components/common/FsItemComponent";

interface AppProps {}
interface AppState {
    readonly fileList: FsItem[];
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
        fileList: [] as FsItem[],
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

        const a: FsItem[] = await invoke("read_dir", {
            path: newDirPath
        });

        this.setState(({ history, historyIndex }) => {
            if (pushHistory === true) {
                historyIndex++;

                history = [...arrayUntil(history, historyIndex - 1), fullDir];
            }
            if (newIndex !== undefined) {
                historyIndex = newIndex;
            }

            return {
                fileList: sortItems(a, "alphabetic"),
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

    hotkeyHandlers = () => {
        return {
            NEW_WINDOW: () => {
                this.newWindow();
            }
        };
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
                return this.renderMain();
            }
            default: {
                return <div>Error</div>;
            }
        }
    };

    renderMain = () => {
        return (
            <Fragment>
                <button onClick={() => this.newWindow()}>New Window</button>
                <Menu
                    reload={this.reloadDirectory}
                    goUp={this.goUpDirectory}
                    goThroughHistory={this.goThroughHistory}
                    updatePage={this.updatePage}
                ></Menu>

                <div className="UrlBar">
                    <Breadcrumb
                        maxItems={10}
                        separator={<FiChevronRight style={{ transform: "translate(0px,2px)" }} />}
                    >
                        {this.state.currentDir.map((pathItem, i) => {
                            return (
                                <FsItemComponent
                                    itemStyle={FsItemComponentStyle.breadcrumb}
                                    updateDir={this.updateDir}
                                    showPreview={this.showPreview}
                                    breadcrumbInfo={{
                                        hostname: this.state.hostname,
                                        pathItem,
                                        i,
                                        currentDir: this.state.currentDir
                                    }}
                                />
                            );
                        })}
                    </Breadcrumb>
                </div>
                {this.state.preview ? <Preview fsi={this.state.preview}></Preview> : ""}
                <FileList
                    showPreview={this.showPreview}
                    fileList={this.state.fileList}
                    updateDir={this.updateDir}
                ></FileList>
            </Fragment>
        );
    };

    render = () => {
        if (this.state.config === null) return <div></div>;
        return (
            <div className="App">
                <HotKeys keyMap={getHotkeys(this.state.config)} handlers={this.hotkeyHandlers()}>
                    {this.renderPage(this.state.currentPage)}
                </HotKeys>
            </div>
        );
    };
}
