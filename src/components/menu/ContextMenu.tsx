import { Component } from "react";
import { Config, ContextMenuData, ContextMenuType, G } from "../../lib/types";
import { getContextMenuActions } from "../../lib/utils";

interface ContextMenuProps {
  readonly contextMenu: ContextMenuData;
  readonly config: Config;
  readonly g: G;
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
          {getContextMenuActions(cm).map((action) => {
            return (
              <li key={`action-${action.type}`} onClick={() => this.props.g.handleAction(action)}>
                {action.title}
              </li>
            );
          })}
        </ol>
      </div>
    );
  };
}
