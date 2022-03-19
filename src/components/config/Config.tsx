import { Component } from "react";
import { JSONSchema7 } from "json-schema";
import Form from "@rjsf/core";
import { configSchema } from "../../utils/Schema";
import { Config, Page } from "../../types";
import { defaultConfig } from "../../utils/utils";

interface ConfigComponentProps {
    readonly updateConfig: Function;
    readonly config: Config;
    readonly updatePage: Function;
}
interface ConfigComponentState {}
export default class ConfigComponent extends Component<ConfigComponentProps, ConfigComponentState> {
    render = () => {
        return (
            <div className="ConfigComponent">
                <button onClick={() => this.props.updateConfig(defaultConfig)}>Reset Config</button>
                <button onClick={() => this.props.updatePage(Page.main)}>Back</button>
                <Form
                    schema={configSchema as unknown as JSONSchema7}
                    formData={this.props.config}
                    onChange={e => this.props.updateConfig(e.formData)}
                    liveValidate={true}
                >
                    <div></div>
                </Form>
            </div>
        );
    };
}
