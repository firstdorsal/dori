import { Component, PureComponent } from "react";
import { JSONSchema7 } from "json-schema";
import Form from "@rjsf/core";
import { configSchema } from "../../lib/configSchema";
import { Config, Page } from "../../lib/types";
import { defaultConfig } from "../../lib/utils";
import { App } from "../../App";
import CloseIcon from "mdi-react/CloseIcon";
import ReloadAlertIcon from "mdi-react/ReloadAlertIcon";

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
        <button
          style={{ background: "none", outline: "none" }}
          onClick={() => this.props.updateConfig(defaultConfig)}
          title="Reset to default"
        >
          <ReloadAlertIcon />
        </button>
        <button
          style={{ background: "none", outline: "none", float: "right" }}
          onClick={() => this.props.updatePage(Page.main)}
          title="Close"
        >
          <CloseIcon />
        </button>

        <Form
          schema={configSchema as unknown as JSONSchema7}
          formData={this.props.config}
          onChange={(e) => this.props.updateConfig(e.formData)}
          liveValidate={true}
        >
          <div></div>
        </Form>
      </div>
    );
  };
}
