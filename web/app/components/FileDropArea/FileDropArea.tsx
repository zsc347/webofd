import { FunctionComponent, memo, useRef } from "react";
import { makeStyles } from "@material-ui/core";
import useFileDrop, { UploadObjectHandler } from "../../hooks/useFileDrop";
import clsx from "clsx";

const useStyles = makeStyles({
    root: {
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },
    container: {
        maxWidth: "600px",
        maxHeight: "300px",
        width: "60%",
        height: "40%",
        outline: "dashed #4285f4 1px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },
    message: {
        fontSize: 16,
        color: "#1565c0",
        fontWeight: 700
    },
    active: {
        outline: "solid #4285f4 2px"
    }
});

export const FileDropArea: FunctionComponent<{
    handler: UploadObjectHandler;
}> = ({ handler }) => {
    const classes = useStyles();

    const container = useRef<HTMLDivElement>(null);

    const { dragging } = useFileDrop(true, container, handler);

    return (
        <div className={classes.root}>
            <div
                ref={container}
                className={clsx(classes.container, dragging && classes.active)}
            >
                <span className={classes.message}>
                    拖拽OFD文件到此处进行preview
                </span>
            </div>
        </div>
    );
};

export default memo(FileDropArea);
