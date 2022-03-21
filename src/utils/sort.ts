import { FsItem, FsType } from "../types";
import { getLastPartOfPath } from "./utils";

export enum SortMethod {
  Alphabetic = 0,
  NameLength = 1,
} // TODO alphabetic ignore casing

export const sortAlphabetic = (items: FsItem[]) => {
  return items.sort((item1, item2) => {
    if (getLastPartOfPath(item1.path) < getLastPartOfPath(item2.path)) {
      return -1;
    } else {
      return 1;
    }
  });
};

export const seperateDirectories = (items: FsItem[]) => {
  const folders: FsItem[] = [];
  const others: FsItem[] = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.fs_type === FsType.Directory) {
      folders.push(item);
    } else {
      others.push(item);
    }
  }
  return [folders, others];
};

export const sortNameLength = (items: FsItem[]) => {
  return items.sort((item1, item2) => {
    if (getLastPartOfPath(item1.path).length < getLastPartOfPath(item2.path).length) {
      return -1;
    } else {
      return 1;
    }
  });
};

export const sortItems = (
  items: FsItem[],
  method: SortMethod,
  seperateDirectoriesOption?: boolean
) => {
  switch (method) {
    case SortMethod.Alphabetic: {
      if (seperateDirectoriesOption === true) {
        const [folders, others] = seperateDirectories(items);
        return [...sortAlphabetic(folders), ...sortAlphabetic(others)];
      }
      return sortAlphabetic(items);
    }
    case SortMethod.NameLength: {
      if (seperateDirectoriesOption === true) {
        const [folders, others] = seperateDirectories(items);
        return [...sortNameLength(folders), ...sortNameLength(others)];
      }
      return sortNameLength(items);
    }
    default:
      throw Error("Method not supported");
  }
};
