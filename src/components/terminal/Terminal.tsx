import { PureComponent } from "react";
import { Terminal as Xterm } from "xterm";
import "xterm/css/xterm.css";

interface TerminalProps {}
interface TerminalState {
  readonly input: string;
}
export default class Terminal extends PureComponent<TerminalProps, TerminalState> {
  xterm: Xterm;
  constructor(props: TerminalProps) {
    super(props);
    this.xterm = new Xterm();
    this.state = {
      input: "",
    };
  }

  componentDidMount = () => {
    const elem = document.getElementById("terminal");
    if (elem === null) return;
    this.xterm.open(elem);
    this.xterm.write("Hello from \x1B[1;3;31mxterm.js\x1B[0m $ ");
    this.xterm.onData((input) => {
      console.log(input);
      this.xterm.write(input);
      this.setState({ input });
    });
  };

  render = () => {
    return (
      <div className="Terminal">
        <div id="terminal"></div>
      </div>
    );
  };
}
