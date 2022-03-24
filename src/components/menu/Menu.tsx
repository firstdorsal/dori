import { Component } from "react";
import ChevronRightIcon from "mdi-react/ChevronRightIcon";
import ChevronLeftIcon from "mdi-react/ChevronLeftIcon";
import ChevronUpIcon from "mdi-react/ChevronUpIcon";
import RefreshIcon from "mdi-react/RefreshIcon";
import GearIcon from "mdi-react/GearIcon";
import BookmarkIcon from "mdi-react/BookmarkIcon";
import BookmarkOutlineIcon from "mdi-react/BookmarkOutlineIcon";

import { Config, FsItem, G, Page } from "../../lib/types";
import { isBookmarked } from "../../lib/utils";
import UrlBar from "./UrlBar";

interface MenuProps {
  readonly g: G;
  readonly currentDir: FsItem;
  readonly config: Config;
  readonly hostname: string;
}
interface MenuState {}
export default class Menu extends Component<MenuProps, MenuState> {
  render = () => {
    return (
      <div className="Menu">
        <button
          style={{ background: "none", outline: "none" }}
          onClick={() => this.props.g.goThroughHistory("back")}
        >
          <ChevronLeftIcon />
        </button>
        <button
          style={{ background: "none", outline: "none" }}
          onClick={() => this.props.g.goThroughHistory("forward")}
        >
          <ChevronRightIcon />
        </button>
        <button
          style={{ background: "none", outline: "none" }}
          onClick={() => this.props.g.goUpDirectory()}
        >
          <ChevronUpIcon />
        </button>
        <button
          style={{ background: "none", outline: "none" }}
          onClick={() => this.props.g.reloadDirectory()}
        >
          <RefreshIcon />
        </button>
        <button
          style={{ background: "none", outline: "none" }}
          onClick={() => this.props.g.bookmarkFolder()}
        >
          {isBookmarked(this.props.currentDir, this.props.config) ? (
            <BookmarkIcon />
          ) : (
            <BookmarkOutlineIcon />
          )}
        </button>
        <UrlBar
          currentDir={this.props.currentDir}
          hostname={this.props.hostname}
          g={this.props.g}
        />
        <button
          style={{ background: "none", outline: "none", float: "right" }}
          onClick={() => this.props.g.updatePage(Page.config)}
        >
          <GearIcon />
        </button>
      </div>
    );
  };
}
