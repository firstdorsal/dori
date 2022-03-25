import { PureComponent } from "react";
import { Bookmark, G } from "../../lib/types";

interface BookmarksProps {
  readonly bookmarks: Bookmark[];
  readonly g: G;
}
interface BookmarksState {}
export default class Bookmarks extends PureComponent<BookmarksProps, BookmarksState> {
  constructor(props: BookmarksProps) {
    super(props);
    this.state = {};
  }

  render = () => {
    return (
      <div className="Bookmarks">
        <ol>
          {this.props.bookmarks.map((bookmark) => {
            return (
              <li
                key={`bookmark-${bookmark.location}`}
                onClick={() => this.props.g.updateDirByPath(bookmark.location)}
              >
                {bookmark.name}
              </li>
            );
          })}
        </ol>
      </div>
    );
  };
}
