import { FunctionComponent, useEffect, useRef } from "react";
import { makeStyles } from "@material-ui/core";
import { OFDDocument } from "../../../../src/core/document";
import { Zip } from "../../../../src/core/zip";
import { FontLoader } from "../../../../src/display/FontLoader";
import { PageView } from "../../../../src/display/PageView";

const useStyles = makeStyles({
    container: {
        overflowY: "auto",
        overflowX: "auto",
        padding: "24px",
        background: "#F7F9FC",
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
    },
    content: {
        outline: "1px solid #ccc",
        boxShadow: "0 2px 8px 0 rgb(0 0 0 / 2%)",
        width: "600px",
        height: "600px",
        overflow: "hidden",
        flexShrink: 0,
        background: "#999"
    }
});

export const OFDContainer: FunctionComponent<{
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

    return <div className={classes.container} ref={containerRef}></div>;
};
