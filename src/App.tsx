import { Component } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { arrayToPath, arrayUntil, getHotkeys } from "./utils/utils";
import Breadcrumb from "rsuite/Breadcrumb";
import "rsuite/dist/rsuite.min.css";
import { FsItem } from "./types";
import { FiChevronRight } from "react-icons/fi";

import Settings from "./components/config/Config";
import FileList from "./components/main/FileList";
import Menu from "./components/menu/Menu";
import Preview from "./components/preview/Preview";
import { WebviewWindow } from "@tauri-apps/api/window";
import { sortItems } from "./utils/Sort";
import { HotKeys } from "react-hotkeys";
import { readTextFile, writeFile } from "@tauri-apps/api/fs";
import { path } from "@tauri-apps/api";
import { defaultConfig } from "./utils/defaultConfig";
import { FromSchema } from "json-schema-to-ts";
import { configSchema } from "./components/config/Schema";

interface AppProps {}
interface AppState {
    fileList: FsItem[];
    currentDir: string[];
    hostname: string;
    history: string[][];
    historyIndex: number;
    preview: null | FsItem;
    config: FromSchema<typeof configSchema> | null;
}

export class App extends Component<AppProps, AppState> {
    state = {
        fileList: [] as FsItem[],
        currentDir: ["/", "home", "paul", "Documents", "tauri-explorer"],
        hostname: "",
        history: [],
        historyIndex: -1,
        preview: null,
        config: null
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

    goUp = () => {
        this.updateDir(arrayUntil(this.state.currentDir, this.state.currentDir.length - 2));
    };

    reload = () => {
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
        const n = "test" + Math.random().toString().replace(".", "");
        console.log(n);

        const webview = new WebviewWindow(n, {
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

    loadConfig = async () => {
        const newConfig = async () => {
            const configString = JSON.stringify(defaultConfig);
            await writeFile({ contents: JSON.stringify(defaultConfig), path: configPath });
            return configString;
        };
        // try to load config
        const configPath = await path.join(await path.configDir(), "/tauri-explorer.json");
        let configString = await readTextFile(configPath).catch(async () => {
            return await newConfig();
        });
        if (configString.length === 0) configString = await newConfig();
        const config = JSON.parse(configString);
        return config;
    };

    updateConfig = () => {};

    render = () => {
        if (this.state.config === null) return <div></div>;
        return (
            <div className="App">
                <HotKeys keyMap={getHotkeys(this.state.config)} handlers={this.hotkeyHandlers()}>
                    <button onClick={() => this.newWindow()}>New Window</button>
                    <Menu
                        reload={this.reload}
                        goUp={this.goUp}
                        goThroughHistory={this.goThroughHistory}
                    ></Menu>
                    <Settings></Settings>
                    <div className="UrlBar">
                        <Breadcrumb
                            maxItems={10}
                            separator={
                                <FiChevronRight style={{ transform: "translate(0px,2px)" }} />
                            }
                            /*
                        {
                            <Icon
                                path={mdiChevronRight}
                                size={0.25}
                                style={{
                                    margin: "0px 3px",
                                    transform: "translate(0,0px) scale(2.0) "
                                }}
                            />
                        }
                        */
                        >
                            {this.state.currentDir.map((pathItem, i) => {
                                return (
                                    <Breadcrumb.Item
                                        key={pathItem}
                                        onClick={() =>
                                            this.updateDir(arrayUntil(this.state.currentDir, i))
                                        }
                                    >
                                        {i === 0 ? this.state.hostname : pathItem}
                                    </Breadcrumb.Item>
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
                </HotKeys>
            </div>
        );
    };
}
