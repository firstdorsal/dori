import { PureComponent } from "react";
import { Breadcrumb } from "rsuite";
import { FiChevronRight } from "react-icons/fi";
import FsItemComponent, { FsItemComponentStyle } from "../common/FsItemComponent";
import { defaultFsItem, pathToArray } from "../../lib/utils";
import { FsItem, FsType, G } from "../../lib/types";
import Input from "rsuite/Input";

interface UrlBarProps {
  readonly currentDir: FsItem;
  readonly g: G;
  readonly hostname: string;
}
interface UrlBarState {
  readonly mode: UrlBarMode;
  readonly textPath: string;
}

export enum UrlBarMode {
  Breadcrumbs = 0,
  Text = 1,
}

export default class UrlBar extends PureComponent<UrlBarProps, UrlBarState> {
  constructor(props: UrlBarProps) {
    super(props);
    this.state = {
      mode: UrlBarMode.Breadcrumbs,
      textPath: this.props.currentDir.path,
    };
  }
  componentDidUpdate = () => {
    if (
      this.props.currentDir.path !== this.state.textPath &&
      this.state.mode === UrlBarMode.Breadcrumbs
    ) {
      this.setState({ textPath: this.props.currentDir.path });
    }
  };

  render = () => {
    return (
      <div className="UrlBar">
        <Input
          size="sm"
          value={this.state.textPath}
          onFocus={() => this.setState({ mode: UrlBarMode.Text })}
          onBlur={() =>
            this.setState({ mode: UrlBarMode.Breadcrumbs, textPath: this.props.currentDir.path })
          }
          onPressEnter={() =>
            this.props.g.updateDir({
              ...defaultFsItem,
              path: this.state.textPath,
              fs_type: FsType.Directory,
            })
          }
          onChange={(newText) => this.setState({ textPath: newText })}
          style={{ color: this.state.mode === UrlBarMode.Text ? "#000" : "#0000" }}
        />
        <Breadcrumb
          style={{ visibility: this.state.mode === UrlBarMode.Text ? "hidden" : "visible" }}
          className="breadcrumbs"
          maxItems={10}
          separator={<FiChevronRight style={{ transform: "translate(0px,2px)" }} />}
        >
          {pathToArray(this.props.currentDir.path).map((pathItem, i) => {
            return (
              <FsItemComponent
                key={pathItem}
                itemStyle={FsItemComponentStyle.Breadcrumb}
                g={this.props.g}
                breadcrumbInfo={{
                  hostname: this.props.hostname,
                  pathItem,
                  i,
                  currentDir: this.props.currentDir.path,
                }}
              />
            );
          })}
        </Breadcrumb>
      </div>
    );
  };
}
