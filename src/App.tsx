import { Component } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { arrayToPath, arrayUntil } from "./utils/utils";
import Breadcrumb from "rsuite/Breadcrumb";
import "rsuite/dist/rsuite.min.css";
import { FsItem } from "./types";
import { FiChevronRight } from "react-icons/fi";

import Settings from "./components/settings/Settings";
import FileList from "./components/main/FileList";
import Menu from "./components/menu/Menu";
import Preview from "./components/preview/Preview";

interface AppProps {}
interface AppState {
    fileList: FsItem[];
    currentDir: string[];
    hostname: string;
    history: string[][];
    historyIndex: number;
    preview: null | FsItem;
}

export class App extends Component<AppProps, AppState> {
    state = {
        fileList: [] as FsItem[],
        currentDir: ["/", "home", "paul", "Downloads", "import-images"],
        hostname: "",
        history: [],
        historyIndex: -1,
        preview: null
    };
    updateDir = async (fullDir: string[], pushHistory = true, newIndex?: number) => {
        const newDirPath = arrayToPath(fullDir);

        const a: FsItem[] = await invoke("read_dir", {
            dir: newDirPath
        });

        this.setState(({ history, historyIndex }) => {
            if (pushHistory === true) {
                historyIndex++;

                history = [...arrayUntil(history, historyIndex - 1), fullDir];
            }
            if (newIndex !== undefined) {
                historyIndex = newIndex;
            }

            return { fileList: a, currentDir: fullDir, history, historyIndex };
        });
    };

    componentDidMount = async () => {
        const hostname: string = await invoke("get_hostname");
        this.setState({ hostname });
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

    render = () => {
        return (
            <div className="App">
                <Menu
                    reload={this.reload}
                    goUp={this.goUp}
                    goThroughHistory={this.goThroughHistory}
                ></Menu>
                <Settings></Settings>
                <div className="UrlBar">
                    <Breadcrumb
                        maxItems={10}
                        separator={<FiChevronRight style={{ transform: "translate(0px,2px)" }} />}
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
            </div>
        );
    };
}
