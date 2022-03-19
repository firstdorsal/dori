import { Component } from "react";
import ChevronRightIcon from "mdi-react/ChevronRightIcon";
import ChevronLeftIcon from "mdi-react/ChevronLeftIcon";
import ChevronUpIcon from "mdi-react/ChevronUpIcon";
import RefreshIcon from "mdi-react/RefreshIcon";
import GearIcon from "mdi-react/GearIcon";

import { Page } from "../../types";

interface MenuProps {
    readonly goUp: Function;
    readonly reload: Function;
    readonly goThroughHistory: Function;
    readonly updatePage: Function;
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
                    onClick={() => this.props.goUp()}
                >
                    <ChevronUpIcon />
                </button>
                <button
                    style={{ background: "none", outline: "none" }}
                    onClick={() => this.props.reload()}
                >
                    <RefreshIcon />
                </button>
                <button
                    style={{ background: "none", outline: "none" }}
                    onClick={() => this.props.updatePage(Page.config)}
                >
                    <GearIcon />
                </button>
            </div>
        );
    };
}
