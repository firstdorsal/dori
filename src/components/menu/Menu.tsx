import { Component } from "react";
import ChevronRight from "mdi-react/ChevronRightIcon";
import ChevronLeft from "mdi-react/ChevronLeftIcon";
import ChevronUp from "mdi-react/ChevronUpIcon";
import Refresh from "mdi-react/RefreshIcon";

interface MenuProps {
    goUp: Function;
    reload: Function;
    goThroughHistory: Function;
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
                    <ChevronLeft></ChevronLeft>
                </button>
                <button
                    style={{ background: "none", outline: "none" }}
                    onClick={() => this.props.goThroughHistory("forward")}
                >
                    <ChevronRight></ChevronRight>
                </button>
                <button
                    style={{ background: "none", outline: "none" }}
                    onClick={() => this.props.goUp()}
                >
                    <ChevronUp></ChevronUp>
                </button>
                <button
                    style={{ background: "none", outline: "none" }}
                    onClick={() => this.props.reload()}
                >
                    <Refresh></Refresh>
                </button>
            </div>
        );
    };
}
