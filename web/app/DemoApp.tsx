import ReactDOM from "react-dom";
import { makeStyles } from "@material-ui/core";
import { useEffect, useRef } from "react";
import { OFDDocument } from "../../src/core/document";
import { Zip } from "../../src/core/zip";
import { PageView } from "../../src/display/PageView";
import "./app.css";
import { FontLoader } from "../../src/display/FontLoader";

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
        backgroundColor: "#525659"
    },
    container: {
        left: "50%",
        transform: "translateX(-50%)",
        position: "absolute"
    }
});

const sample = "static/sample.ofd";
function ViewerApp() {
    const classes = useStyles();
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let doc: OFDDocument | null = null;

        const container = containerRef.current!;
        (async function () {
            const zip = new Zip({ url: sample });
            const fontLoader = new FontLoader();
            doc = new OFDDocument({ zip, fontLoader });
            await doc.init();
            const page = await doc.getPage(0);
            if (!page) {
                throw new Error("unexpected");
            }
            const pv = new PageView({ page });
            pv.paint(container);
        })();

        return () => {
            if (doc) {
                doc.dispose();
            }
        };
    }, []);

    return (
        <div className={classes.root}>
            <div className={classes.container} ref={containerRef}></div>
        </div>
    );
}

ReactDOM.render(<ViewerApp />, document.getElementById("root"));
