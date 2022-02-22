import { useCallback, useState } from "react";
import { makeStyles } from "@material-ui/core";
import FileDropArea from "./components/FileDropArea/FileDropArea";
import { UploadObjectHandler } from "./hooks/useFileDrop";
import { OFDContainer } from "./components/OFDContainer/OFDContainer";
import { OFDToolbar } from "./components/OFDToolbar/OFDToolbar";
import "./app.css";

const useStyles = makeStyles({
    "@global": {
        body: {
            margin: 0,
            fontSize: "1.4em",
            lineHeight: 1.4,
            fontFamily: `PingFangSC-Regular,"Helvetica Neue",Helvetica,Arial,sans-serif,"Microsoft YaHei"`,
            backgroundColor: "#fff"
        }
    },

    root: {
        position: "fixed",
        top: 0,
        left: 0,
        height: "100vh",
        width: "100vw",
        overflowY: "hidden",
        overflowX: "hidden",
        display: "flex",
        flexDirection: "column"
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
                <FileDropArea handler={handler} />
            </div>
        );
    }

    return (
        <div className={classes.root}>
            <OFDToolbar />
            <OFDContainer url={url} />
        </div>
    );
}
