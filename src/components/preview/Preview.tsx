import { convertFileSrc } from "@tauri-apps/api/tauri";
import { Component, PureComponent, useEffect, useRef } from "react";
import { FsItem } from "../../lib/types";
import {
  arrayToPath,
  getFileTypeFromFsItem,
  getFileTypeFromString,
  isTextType,
  sdmt,
} from "../../lib/utils";
/*@ts-ignore*/
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import { invoke } from "@tauri-apps/api";

interface PreviewProps {
  readonly fsi: FsItem | null;
}
interface PreviewState {
  readonly file: Data;
  readonly lastPath: string;
}

type Data = Uint8Array | 1 | string | null;

export default class Preview extends Component<PreviewProps, PreviewState> {
  state = { file: null, lastPath: "" };

  componentDidUpdate = async () => {
    await this.loadFile(this.props.fsi);
  };

  componentDidMount = async () => {
    await this.loadFile(this.props.fsi);
  };

  loadFile = async (fsi: FsItem | null) => {
    if (fsi?.path !== undefined) {
      const currentPath = fsi.path;

      if (currentPath === this.state.lastPath) return;
      const type = fsi.mimeType;

      if (sdmt.pdf.includes(type) || isTextType(type)) {
        this.setState({ file: 1, lastPath: currentPath });

        let file;
        if (sdmt.pdf.includes(type)) {
          file = Uint8Array.from(
            await invoke("read_binary_file", {
              path: currentPath,
            })
          );
        } else {
          file = (await invoke("read_text_file", {
            path: currentPath,
          })) as string;
        }

        this.setState({ file });
      }
    }
  };

  render = () => {
    return (
      <div className="Preview">
        <div>
          {this.props.fsi !== null && <GetPreview fsi={this.props.fsi} file={this.state.file} />}
        </div>
      </div>
    );
  };
}

const previewFailed = () => {
  return <div>Could not display preview</div>;
};

const missingPreview = (type: string) => {
  return <div>Missing preview method for file type: {type}</div>;
};

const GetPreview = (props: { fsi: FsItem; file: Data }) => {
  const type = getFileTypeFromFsItem(props.fsi);

  if (type === null) return previewFailed();
  if (sdmt.pdf.includes(type)) {
    if (props.file === null) return previewFailed();
    if (typeof props.file === "string" || props.file === 1) {
      return <div>Loading</div>;
    }
    return <Pdf file={props.file} fsi={props.fsi} />;
  } else if (sdmt.nativeImages.includes(type)) {
    return <Image fsi={props.fsi} />;
  } else if (sdmt.nativeVideos.includes(type)) {
    return <Video type={type} fsi={props.fsi} />;
  } else if (isTextType(type)) {
    if (props.file === null) return previewFailed();
    if (props.file === 1 || typeof props.file !== "string") {
      return <div>Loading</div>;
    }
    return <Text fsi={props.fsi} file={props.file} />;
  } else {
    return missingPreview(type);
  }
};

const Image = (props: { fsi: FsItem }) => {
  return <img src={convertFileSrc(props.fsi.path)} alt="" />;
};
//https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf
const Pdf = (props: { fsi: FsItem; file: Data }) => {
  const canvasRef = useRef(null);
  console.log(props.fsi.path, props.file);

  useEffect(() => {
    (async () => {
      pdfjsLib.GlobalWorkerOptions.workerSrc = window.location.origin + "/pdf.worker.min.js";
      const pdf = await pdfjsLib.getDocument(props.file).promise;

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

const Text = (props: { fsi: FsItem; file: Data }) => {
  return <div>{props.file}</div>;
};

const Video = (props: { fsi: FsItem; type: string }) => {
  const src = convertFileSrc(props.fsi.path);
  return (
    <div>
      <video autoPlay controls>
        <source type={props.type} src={src} />
      </video>
    </div>
  );
};
// TODO
// tiff avif textfiles video svg
// zoomable images
// click through pdf pages
