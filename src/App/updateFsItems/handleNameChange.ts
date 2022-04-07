import { App } from "../App";
import update from "immutability-helper";

export const handleNameChange = (t: App, e: React.ChangeEvent<HTMLInputElement>, index: number) => {
  t.setState(({ fileListMap, currentDir }) => {
    fileListMap = update(fileListMap, {
      [currentDir.path]: {
        [index]: {
          ui: {
            renamedFileName: {
              $set: e.target.value,
            },
          },
        },
      },
    });
    return { fileListMap };
  });
};
