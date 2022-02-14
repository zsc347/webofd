import { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { OFDDocument } from "../../src/core/document";
import { Zip } from "../../src/core/zip";

const sample = "static/sample.ofd";
function ViewerApp() {
    const [data, setData] = useState<string>("");

    useEffect(() => {
        let active = true;

        (async function () {
            const zip = new Zip({ url: sample });
            const doc = new OFDDocument({ zip });
            await doc.init();
            const page = await doc.getPage(0);
            if (!page) {
                throw new Error("unexpected");
            }
            if (active) {
                setData(JSON.stringify(page.getArea()));
            }
        })();

        return () => {
            active = false;
        };
    }, []);

    return (
        <div>
            <div>{data}</div>
        </div>
    );
}

ReactDOM.render(<ViewerApp />, document.getElementById("root"));
