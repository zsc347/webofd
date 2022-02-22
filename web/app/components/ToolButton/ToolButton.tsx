import { FunctionComponent, ReactElement } from "react";
import { makeStyles } from "@material-ui/core";
import NavigateBeforeIcon from "@material-ui/icons/NavigateBefore";
import NavigateNextIcon from "@material-ui/icons/NavigateNext";
import AspectRatioIcon from "@material-ui/icons/AspectRatio";
import CropLandscapeIcon from "@material-ui/icons/CropLandscape";
import LaptopIcon from "@material-ui/icons/Laptop";

import clsx from "clsx";

const useStyles = makeStyles({
    outer: {
        display: "flex",
        flexShrink: 0,
        borderRadius: 8,
        margin: "4px 4px",
        border: "none",
        flexDirection: "column",
        alignItems: "center",
        padding: "4px 12px",
        background: "#fff",
        color: "#495366",
        cursor: "pointer",
        "&.toggled": {
            color: "#06A7FF"
        },
        "&:hover:enabled": {
            background: "rgba(0, 0, 0, 0.05)"
        },
        "&:disabled": {
            opacity: 0.6
        }
    },
    icon: {
        height: 20,
        width: 20
    },
    text: {
        height: 20,
        fontSize: 12,
        fontWeight: 400
    }
});

export const OFDToolButton: FunctionComponent<{
    toggled?: boolean;
    disabled?: boolean;
    text: string;
    renderIcon: (className: string) => ReactElement;
}> = ({ toggled = false, disabled, text, renderIcon }) => {
    const classes = useStyles();

    const icon = renderIcon(classes.icon);
    return (
        <button
            disabled={disabled}
            className={clsx(classes.outer, toggled && "toggled")}
        >
            {icon}
            <div className={classes.text}>{text}</div>
        </button>
    );
};

export const OFDNavPrevButton: FunctionComponent<{
    disabled?: boolean;
    toggled?: boolean;
}> = ({ disabled, toggled }) => {
    return (
        <OFDToolButton
            disabled={disabled}
            toggled={toggled}
            text="上一页"
            renderIcon={className => (
                <NavigateBeforeIcon className={className} />
            )}
        />
    );
};

export const OFDNavNextButton: FunctionComponent<{
    toggled?: boolean;
    disabled?: boolean;
}> = ({ toggled = false, disabled }) => {
    return (
        <OFDToolButton
            text="下一页"
            disabled={disabled}
            toggled={toggled}
            renderIcon={className => <NavigateNextIcon className={className} />}
        />
    );
};

export const OFDActualSizeButton: FunctionComponent<{
    toggled?: boolean;
    disabled?: boolean;
}> = ({ toggled = false, disabled }) => {
    return (
        <OFDToolButton
            text="实际大小"
            disabled={disabled}
            toggled={toggled}
            renderIcon={className => (
                <CropLandscapeIcon className={className} />
            )}
        />
    );
};

export const OFDFitWidthButton: FunctionComponent<{
    toggled?: boolean;
    disabled?: boolean;
}> = ({ toggled = false, disabled }) => {
    return (
        <OFDToolButton
            text="适合宽度"
            disabled={disabled}
            toggled={toggled}
            renderIcon={className => <AspectRatioIcon className={className} />}
        />
    );
};

export const OFDFitScreenButton: FunctionComponent<{
    toggled?: boolean;
    disabled?: boolean;
}> = ({ toggled = false, disabled }) => {
    return (
        <OFDToolButton
            text="适合界面"
            disabled={disabled}
            toggled={toggled}
            renderIcon={className => <LaptopIcon className={className} />}
        />
    );
};
