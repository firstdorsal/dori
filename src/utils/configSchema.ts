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
                    title: "Enable Hotkeys"
                },
                keyMap: {
                    type: "object",
                    additionalProperties: false,
                    title: " ",
                    required: actions,
                    properties: {
                        NEW_WINDOW: {
                            type: "string"
                        },
                        LIST_UP: {
                            type: "string"
                        },
                        LIST_DOWN: {
                            type: "string"
                        },
                        GO_UP: {
                            type: "string"
                        },
                        GO_INTO: {
                            type: "string"
                        },
                        SELECT_FROM_TO: {
                            type: "string"
                        },
                        SELECT_MULTIPLE: {
                            type: "string"
                        }
                    }
                }
            }
        }
    }
} as const;
