import { Component, PureComponent } from "react";
import { JSONSchema7 } from "json-schema";
import Form from "@rjsf/core";
import { configSchema } from "../../utils/configSchema";
import { Config, Page } from "../../types";
import { defaultConfig } from "../../utils/utils";
import { App } from "../../App";

interface ConfigComponentProps {
    readonly updateConfig: InstanceType<typeof App>["updateConfig"];
    readonly config: Config;
    readonly updatePage: InstanceType<typeof App>["updatePage"];
}
interface ConfigComponentState {}
export default class ConfigComponent extends PureComponent<
    ConfigComponentProps,
    ConfigComponentState
> {
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
