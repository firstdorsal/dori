import { Component } from "react";
import { Config, ContextMenuData, ContextMenuType } from "../../lib/types";
import { getContextMenuActions } from "../../lib/utils";

interface ContextMenuProps {
  readonly contextMenu: ContextMenuData;
  readonly config: Config;
}
interface ContextMenuState {}
export default class ContextMenu extends Component<ContextMenuProps, ContextMenuState> {
  render = () => {
    const cm = this.props.contextMenu;

    return (
      <div
        /* @ts-ignore*/
        ctxmtype={ContextMenuType.ContextMenu}
        style={{ left: cm.x, top: cm.y }}
        className="ContextMenu"
      >
        <ol>
          {getContextMenuActions(cm.type, cm.fsi, cm.multiple).map((action) => {
            return <li>{action.title}</li>;
          })}
        </ol>
      </div>
    );
  };
}
