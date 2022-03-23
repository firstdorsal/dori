import { actions } from "./utils";

export const configSchema = {
  title: "Config",
  type: "object",
  required: ["hotkeys"],
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
              type: "string",
            },
            SELECT_MULTIPLE: {
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
          },
        },
      },
    },
  },
} as const;
