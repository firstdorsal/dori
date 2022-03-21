import { PureComponent } from "react";
import { Breadcrumb } from "rsuite";
import { FiChevronRight } from "react-icons/fi";
import FsItemComponent, { FsItemComponentStyle } from "../common/FsItemComponent";
import { App } from "../../App";
import { pathToArray } from "../../utils/utils";

interface UrlBarProps {
  currentDir: string;
  updateDir: InstanceType<typeof App>["updateDir"];
  showPreview: InstanceType<typeof App>["showPreview"];
  hostname: string;
}
interface UrlBarState {}
export default class UrlBar extends PureComponent<UrlBarProps, UrlBarState> {
  render = () => {
    return (
      <div className="UrlBar">
        <Breadcrumb
          maxItems={10}
          separator={<FiChevronRight style={{ transform: "translate(0px,2px)" }} />}
        >
          {pathToArray(this.props.currentDir).map((pathItem, i) => {
            return (
              <FsItemComponent
                key={pathItem}
                itemStyle={FsItemComponentStyle.breadcrumb}
                updateDir={this.props.updateDir}
                showPreview={this.props.showPreview}
                breadcrumbInfo={{
                  hostname: this.props.hostname,
                  pathItem,
                  i,
                  currentDir: this.props.currentDir,
                }}
              />
            );
          })}
        </Breadcrumb>
      </div>
    );
  };
}
