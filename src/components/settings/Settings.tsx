import { Component } from "react";

interface SettingsProps {}
interface SettingsState {
    data: any;
}
export default class Settings extends Component<SettingsProps, SettingsState> {
    render = () => {
        return <div className="Settings"></div>;
    };
}
