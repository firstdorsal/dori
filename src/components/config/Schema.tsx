export const configSchema = {
    title: "Config",
    type: "object",
    required: ["hotkeys"],
    properties: {
        hotkeys: {
            type: "object",
            title: "Hotkeys",
            required: ["useHotkeys", "list"],
            properties: {
                useHotkeys: {
                    type: "boolean",
                    title: "Enable Hotkeys"
                },
                list: {
                    type: "array",
                    title: " ",
                    items: {
                        type: "object",
                        required: ["keys", "action"],
                        properties: {
                            keys: { type: "string", title: " " },
                            action: {
                                type: "string",
                                enum: ["NEW_WINDOW"],
                                title: " "
                            }
                        }
                    }
                }
            }
        }
    }
} as const;
