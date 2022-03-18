import { Component } from "react";
import { JSONSchema7 } from "json-schema";
import { FromSchema } from "json-schema-to-ts";
import Form from "@rjsf/core";
import { configSchema } from "./Schema";
import { defaultConfig } from "../../utils/defaultConfig";

interface ConfigProps {}
interface ConfigState {
    config: FromSchema<typeof configSchema>;
}
export default class Config extends Component<ConfigProps, ConfigState> {
    state = {
        config: defaultConfig
    };
    render = () => {
        console.log(this.state.config);

        return (
            <div className="Config">
                <Form
                    schema={configSchema as unknown as JSONSchema7}
                    formData={this.state.config}
                    onChange={(e: any) => this.setState({ config: e.formData })}
                    liveValidate={true}
                >
                    <div></div>
                </Form>
            </div>
        );
    };
}
