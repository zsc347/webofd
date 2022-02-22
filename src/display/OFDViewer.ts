import { OFDDocument } from "../core/document";

export class OFDViewer {
    private _doc: OFDDocument;

    constructor({ doc }: { doc: OFDDocument }) {
        this._doc = doc;
    }

    public get doc() {
        return this._doc;
    }
}
