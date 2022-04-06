import { PureComponent } from "react";
import { appWindow } from "@tauri-apps/api/window";
import CloseIcon from "mdi-react/CloseIcon";
import MinimizeIcon from "mdi-react/WindowMinimizeIcon";
import MaximizeIcon from "mdi-react/WindowMaximizeIcon";

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
            <MinimizeIcon />
          </div>
          <div
            className="titlebar-button"
            id="titlebar-maximize"
            onClick={() => appWindow.toggleMaximize()}
          >
            <MaximizeIcon />
          </div>
          <div className="titlebar-button" id="titlebar-close" onClick={() => appWindow.close()}>
            <CloseIcon />
          </div>
        </div>
      </div>
    );
  };
}
