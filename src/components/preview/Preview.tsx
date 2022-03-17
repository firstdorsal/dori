import { convertFileSrc } from "@tauri-apps/api/tauri";
import { Component, useEffect, useRef } from "react";
import { FsItem } from "../../types";
import { arrayToPath } from "../../utils/utils";
import { readBinaryFile } from "@tauri-apps/api/fs";
/*@ts-ignore*/
import * as pdfjsLib from "pdfjs-dist/build/pdf";

interface PreviewProps {
    fsi: FsItem | null;
}
interface PreviewState {
    data: Uint8Array | null;
}
export default class Preview extends Component<PreviewProps, PreviewState> {
    state = { data: null };
    componentDidMount = async () => {
        if (this.props.fsi?.path) {
            const data = await readBinaryFile(arrayToPath(this.props.fsi.path));

            this.setState({ data });
        }
    };
    render = () => {
        if (!this.state.data) return <div></div>;
        return (
            <div style={{ width: "200px" }} className="Preview">
                {this.props.fsi !== null ? (
                    <Pdf data={this.state.data} fsi={this.props.fsi}></Pdf>
                ) : (
                    ""
                )}
            </div>
        );
    };
}

const Image = (props: { fsi: FsItem }) => {
    return <img src={convertFileSrc(arrayToPath(props.fsi.path))} alt="" />;
};
//https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf
const Pdf = (props: { fsi: FsItem; data: Uint8Array | null }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        (async function () {
            pdfjsLib.GlobalWorkerOptions.workerSrc = window.location.origin + "/pdf.worker.min.js";
            pdfjsLib.isEvalSupported = false;
            const pdf = await pdfjsLib.getDocument(props.data).promise;

            const page = await pdf.getPage(1);
            const viewport = page.getViewport({ scale: 1.5 });

            const canvas = canvasRef.current as unknown as HTMLCanvasElement;
            const canvasContext = canvas.getContext("2d");
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            const renderContext = { canvasContext, viewport };
            page.render(renderContext);
        })();
    }, []);

    return <canvas ref={canvasRef} style={{ height: "400px" }} />;
};

const Text = (props: { fsi: FsItem }) => {};

const Video = (props: { fsi: FsItem }) => {};
