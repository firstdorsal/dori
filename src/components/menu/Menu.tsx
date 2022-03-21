import { Component } from "react";
import ChevronRightIcon from "mdi-react/ChevronRightIcon";
import ChevronLeftIcon from "mdi-react/ChevronLeftIcon";
import ChevronUpIcon from "mdi-react/ChevronUpIcon";
import RefreshIcon from "mdi-react/RefreshIcon";
import GearIcon from "mdi-react/GearIcon";

import { G, Page } from "../../lib/types";

interface MenuProps {
  readonly g: G;
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
          style={{ background: "none", outline: "none", float: "right" }}
          onClick={() => this.props.g.updatePage(Page.config)}
        >
          <GearIcon />
        </button>
      </div>
    );
  };
}
