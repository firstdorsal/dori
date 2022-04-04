import { PureComponent } from "react";
import { appWindow } from "@tauri-apps/api/window";

interface TitlebarProps {}
interface TitlebarState {}
export default class Titlebar extends PureComponent<TitlebarProps, TitlebarState> {
  constructor(props: TitlebarProps) {
    super(props);
    this.state = {};
  }

  render = () => {
    return (
      <div className="Titlebar">
        <div data-tauri-drag-region className="titlebar">
          <div
            className="titlebar-button"
            id="titlebar-minimize"
            onClick={() => appWindow.minimize()}
          >
            <img src="https://api.iconify.design/mdi:window-minimize.svg" alt="minimize" />
          </div>
          <div
            className="titlebar-button"
            id="titlebar-maximize"
            onClick={() => appWindow.toggleMaximize()}
          >
            <img src="https://api.iconify.design/mdi:window-maximize.svg" alt="maximize" />
          </div>
          <div className="titlebar-button" id="titlebar-close" onClick={() => appWindow.close()}>
            <img src="https://api.iconify.design/mdi:close.svg" alt="close" />
          </div>
        </div>
      </div>
    );
  };
}
