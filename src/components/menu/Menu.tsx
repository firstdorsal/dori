import { Component } from "react";
import ChevronRightIcon from "mdi-react/ChevronRightIcon";
import ChevronLeftIcon from "mdi-react/ChevronLeftIcon";
import ChevronUpIcon from "mdi-react/ChevronUpIcon";
import RefreshIcon from "mdi-react/RefreshIcon";
import GearIcon from "mdi-react/GearIcon";

import { Page } from "../../types";
import { App } from "../../App";

interface MenuProps {
  readonly goUpDirectory: InstanceType<typeof App>["goUpDirectory"];
  readonly reloadDirectory: InstanceType<typeof App>["reloadDirectory"];
  readonly goThroughHistory: InstanceType<typeof App>["goThroughHistory"];
  readonly updatePage: InstanceType<typeof App>["updatePage"];
}
interface MenuState {}
export default class Menu extends Component<MenuProps, MenuState> {
  render = () => {
    return (
      <div className="Menu">
        <button
          style={{ background: "none", outline: "none" }}
          onClick={() => this.props.goThroughHistory("back")}
        >
          <ChevronLeftIcon />
        </button>
        <button
          style={{ background: "none", outline: "none" }}
          onClick={() => this.props.goThroughHistory("forward")}
        >
          <ChevronRightIcon />
        </button>
        <button
          style={{ background: "none", outline: "none" }}
          onClick={() => this.props.goUpDirectory()}
        >
          <ChevronUpIcon />
        </button>
        <button
          style={{ background: "none", outline: "none" }}
          onClick={() => this.props.reloadDirectory()}
        >
          <RefreshIcon />
        </button>
        <button
          style={{ background: "none", outline: "none", float: "right" }}
          onClick={() => this.props.updatePage(Page.config)}
        >
          <GearIcon />
        </button>
      </div>
    );
  };
}
