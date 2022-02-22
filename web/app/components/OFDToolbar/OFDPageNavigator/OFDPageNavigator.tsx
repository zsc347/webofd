import { ChangeEventHandler, FunctionComponent, useState } from "react";
import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles({
    navigator: {
        flexDirection: "row",
        flexShrink: 0,
        height: 20,
        borderRadius: 6,
        background: "#F7F9FC",
        padding: 2,
        fontSize: 14,
        fontWeight: 400,
        lineHeight: "20px",
        textAlign: "center",
        display: "flex",
        color: "#333"
    },
    input: {
        display: "inline-block",
        border: "none",
        outline: "none",
        maxWidth: 32,
        minWidth: 24,
        background: "transparent",
        textAlign: "center",
        fontSize: 14,
        fontWeight: 400,
        color: "#333",
        fontFamily: `PingFangSC-Regular,"Helvetica Neue",Helvetica,Arial,sans-serif,"Microsoft YaHei"`
    },
    span: {
        maxWidth: 48,
        minWidth: 32
    }
});

export const OFDPageNavigator: FunctionComponent<{
    current: number;
    total: number;
}> = ({ current, total }) => {
    const classes = useStyles();

    const [value, setValue] = useState<number>(current);

    const handleChange: ChangeEventHandler<HTMLInputElement> = evt => {
        const num = parseInt(evt.target.value);
        setValue(num || 0);
    };

    return (
        <div className={classes.navigator}>
            <input
                onChange={handleChange}
                className={classes.input}
                value={value}
            ></input>
            /<span className={classes.span}>{total}</span>
        </div>
    );
};
