import { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { Zip, ZipEntry } from "../../src/core/zip";

const url = "static/sample.ofd";

function ViewerApp() {
    const [entries, setEntries] = useState<ZipEntry[]>([]);

    useEffect(() => {
        let active = true;

        (async function () {
            const zip = new Zip({ url });
            const entreis = await zip.entries();
            if (active) {
                setEntries(entreis);
            }
        })();

        return () => {
            active = false;
        };
    }, []);

    return <div>{JSON.stringify(entries)} </div>;
}

ReactDOM.render(<ViewerApp />, document.getElementById("root"));
