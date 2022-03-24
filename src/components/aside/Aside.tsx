import { Component, CSSProperties } from "react";
import { Config, G } from "../../lib/types";
import Bookmarks from "./Bookmarks";

interface AsideProps {
  readonly style?: CSSProperties;
  readonly config: Config;
  readonly g: G;
}
interface AsideState {}
export default class Aside extends Component<AsideProps, AsideState> {
  render = () => {
    return (
      <aside className="Aside">
        <Bookmarks g={this.props.g} bookmarks={this.props.config.bookmarks.list} />
      </aside>
    );
  };
}
