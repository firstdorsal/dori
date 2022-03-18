import { FromSchema } from "json-schema-to-ts";
import { configSchema } from "../components/config/Schema";

export const defaultConfig: FromSchema<typeof configSchema> = {
    hotkeys: { useHotkeys: true, list: [{ keys: "ctrl+n", action: "NEW_WINDOW" }] }
};
