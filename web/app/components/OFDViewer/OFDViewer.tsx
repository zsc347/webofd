import { FunctionComponent, useEffect, useRef } from "react";
import { makeStyles } from "@material-ui/core";
import { OFDDocument } from "../../../../src/core/document";
import { Zip } from "../../../../src/core/zip";
import { FontLoader } from "../../../../src/display/FontLoader";
import { PageView } from "../../../../src/display/PageView";

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

export const OFDViewer: FunctionComponent<{
    url: string;
}> = ({ url }) => {
    const classes = useStyles();
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let doc: OFDDocument | null = null;

        const container = containerRef.current!;
        (async function () {
            const zip = new Zip({ url });
            const fontLoader = new FontLoader();
            doc = new OFDDocument({ zip, fontLoader });
            const page = await doc.ensurePage(0);
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
    }, [url]);

    return (
        <div className={classes.root}>
            <div className={classes.container} ref={containerRef}></div>
        </div>
    );
};
