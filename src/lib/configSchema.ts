import { actions } from "./utils";

export const configSchema = {
  title: "Config",
  type: "object",
  required: ["hotkeys", "bookmarks"],
  additionalProperties: false,
  properties: {
    hotkeys: {
      type: "object",
      title: "Hotkeys",
      required: ["useHotkeys", "keyMap"],
      additionalProperties: false,
      properties: {
        useHotkeys: {
          type: "boolean",
          title: "Enable Hotkeys",
        },
        keyMap: {
          type: "object",
          additionalProperties: false,
          title: " ",
          required: actions,
          properties: {
            NEW_WINDOW: {
              type: "string",
            },
            LIST_UP: {
              type: "string",
            },
            LIST_DOWN: {
              type: "string",
            },
            FOLDER_UP: {
              type: "string",
            },
            FOLDER_INTO: {
              type: "string",
            },
            SELECT_FROM_TO: {
              readOnly: true,
              type: "string",
            },
            SELECT_MULTIPLE: {
              readOnly: true,
              type: "string",
            },
            TOGGLE_HIDDEN_FILES: {
              type: "string",
            },
            SELECT_ALL: {
              type: "string",
            },
            SELECT_LAST: {
              type: "string",
            },
            SELECT_FIRST: {
              type: "string",
            },
            DELETE: {
              type: "string",
            },
            RENAME: {
              type: "string",
            },
            INSERT: {
              type: "string",
            },
            RELOAD: {
              type: "string",
            },
            HISTORY_BACK: {
              type: "string",
            },
            HISTORY_FORWARD: {
              type: "string",
            },
            TOGGLE_BOOKMARK: {
              type: "string",
            },
            COPY: {
              type: "string",
            },
            PASTE: {
              type: "string",
            },
            CUT: {
              type: "string",
            },
          },
        },
      },
    },
    bookmarks: {
      type: "object",
      title: "Bookmarks",
      additionalProperties: false,
      required: ["list"],
      properties: {
        list: {
          type: "array",
          title: "List",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["location", "name", "icon"],
            properties: {
              location: {
                type: "string",
              },
              name: {
                type: "string",
              },
              icon: {
                type: "string",
              },
            },
          },
        },
      },
    },
  },
} as const;
