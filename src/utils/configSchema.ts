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
                        }
                    }
                }
            }
        }
    }
} as const;
