import { convertFileSrc } from "@tauri-apps/api/tauri";
import { Component, useEffect, useRef } from "react";
import { FsItem } from "../../types";
import { arrayToPath, getFileType, sdmt } from "../../utils/utils";
import { readBinaryFile } from "@tauri-apps/api/fs";
/*@ts-ignore*/
import * as pdfjsLib from "pdfjs-dist/build/pdf";

interface PreviewProps {
    fsi: FsItem | null;
}
interface PreviewState {
    data: Uint8Array | null;
    lastPath: string;
}
export default class Preview extends Component<PreviewProps, PreviewState> {
    state = { data: null, lastPath: "" };

    componentDidUpdate = async () => {
        await this.loadBinary(this.props.fsi);
    };

    componentDidMount = async () => {
        await this.loadBinary(this.props.fsi);
    };

    loadBinary = async (fsi: FsItem | null) => {
        if (fsi?.path) {
            const currentPath = arrayToPath(fsi.path);
            if (currentPath === this.state.lastPath) return;
            this.setState({ lastPath: currentPath });

            const type = getFileType(fsi);
            if (!type) return;
            if (sdmt.pdf.includes(type)) {
                const data = await readBinaryFile(currentPath);
                console.log(data);
                this.setState({ data });
            }
        }
    };

    previewFailed = () => {
        return <div>Could not display preview</div>;
    };

    missingPreview = (type: string) => {
        return <div>Missing preview method for file type: {type}</div>;
    };

    getPreview = (fsi: FsItem) => {
        const type = getFileType(fsi);
        console.log(type);

        if (!type) return this.previewFailed();
        if (sdmt.pdf.includes(type)) {
            if (!this.state.data) return this.previewFailed();
            return <Pdf data={this.state.data} fsi={fsi} />;
        } else if (sdmt.nativeImages.includes(type)) {
            return <Image fsi={fsi} />;
        } else if (sdmt.nativeVideos.includes(type)) {
            return <Video type={type} fsi={fsi} />;
        } else if (type.startsWith("text/")) {
            return <Text fsi={fsi} />;
        } else {
            return this.missingPreview(type);
        }
    };

    render = () => {
        if (this.props.fsi === null) return <div></div>;

        return (
            <div
                style={{
                    width: "200px",
                    height: "300px",
                    position: "fixed",
                    right: "0px",
                    top: "0px",
                    border: "1px solid black"
                }}
                className="Preview"
            >
                <div style={{ height: "100%", width: "100%" }}>
                    {this.getPreview(this.props.fsi)}
                </div>
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

    return <canvas ref={canvasRef} style={{ width: "100%" }} />;
};

const Text = (props: { fsi: FsItem }) => {
    return <div></div>;
};

const Video = (props: { fsi: FsItem; type: string }) => {
    const src = convertFileSrc(arrayToPath(props.fsi.path));
    return (
        <div>
            <video autoPlay controls>
                <source type={props.type} src={src} />
            </video>
        </div>
    );
};
// TODO
// tiff avif textfiles
