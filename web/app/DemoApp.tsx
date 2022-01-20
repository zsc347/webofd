import ReactDOM from "react-dom";
import { ooxml } from "../../src";

function ViewerApp() {
    return <div>{ooxml()} </div>;
}

ReactDOM.render(<ViewerApp />, document.getElementById("root"));
