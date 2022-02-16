import { useCallback, useState } from "react";
import { makeStyles } from "@material-ui/core";
import DropFIleArea from "./components/FileDropArea/FileDropArea";
import { UploadObjectHandler } from "./hooks/useFileDrop";
import { OFDViewer } from "./components/OFDViewer/OFDViewer";
import "./app.css";

const useStyles = makeStyles({
    root: {
        position: "fixed",
        top: 0,
        left: 0,
        height: "100vh",
        width: "100vw",
        overflowY: "hidden",
        overflowX: "hidden",
        fontSize: 12,
        padding: "24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    }
});

function getFileURL() {
    const params = new URLSearchParams(window.location.search);
    const url = params.get("ofd");
    if (url) {
        return decodeURIComponent(url);
    }
    return "";
}

export default function App() {
    const classes = useStyles();
    const [url, setUrl] = useState<string>(getFileURL());

    const handler: UploadObjectHandler = useCallback(nodes => {
        if (nodes.length !== 1) {
            console.warn("only allow drop 1 file once");
            return;
        }
        const file = nodes[0].file;
        if (!file) {
            console.warn("only allow drop 1 file once");
            return;
        }
        setUrl(URL.createObjectURL(file));
    }, []);

    if (!url) {
        return (
            <div className={classes.root}>
                <DropFIleArea handler={handler} />
            </div>
        );
    }

    return <OFDViewer url={url} />;
}
