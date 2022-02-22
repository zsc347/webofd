import { FunctionComponent } from "react";
import { makeStyles } from "@material-ui/core";
import { OFDViewer } from "../../../../src/display/OFDViewer";
import {
    OFDActualSizeButton,
    OFDFitScreenButton,
    OFDFitWidthButton,
    OFDNavNextButton,
    OFDNavPrevButton
} from "../ToolButton/ToolButton";
import { OFDPageNavigator } from "./OFDPageNavigator/OFDPageNavigator";

const useStyles = makeStyles({
    root: {
        height: 58,
        flexShrink: 0,
        width: "100%",
        background: "#fff",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row"
    },
    center: {
        display: "flex",
        alignItems: "center",
        alignSelf: "flex-center"
    },
    divider: {
        height: 28,
        width: 1,
        background: "#F1F3F8"
    }
});

export const Divider: FunctionComponent = () => {
    const classes = useStyles();
    return <div className={classes.divider}></div>;
};

export const OFDToolbar: FunctionComponent<{
    viewer?: OFDViewer;
}> = ({}) => {
    const classes = useStyles();
    return (
        <div className={classes.root}>
            <div className={classes.center}>
                <OFDNavPrevButton disabled={true} />
                <OFDPageNavigator current={1} total={1} />
                <OFDNavNextButton disabled={true} />
                <Divider />
                <OFDActualSizeButton disabled={true} toggled={true} />
                <OFDFitWidthButton disabled={true} />
                <OFDFitScreenButton disabled={true} />
            </div>
        </div>
    );
};
