import { OFDDocument } from "../document";
import { OFDElement } from "./OFDElement";
import { OFDPageElement } from "./OFDPageElement";

export class OFDLayerElement implements OFDElement {
    private doc: OFDDocument;
    private _page: OFDPageElement;
    private _element: Element;

    private _layerID!: string;

    constructor({
        doc,
        page,
        element
    }: {
        doc: OFDDocument;
        page: OFDPageElement;
        element: Element;
    }) {
        this.doc = doc;
        this._element = element;
        this._page = page;
        this.init();
    }

    private init() {
        const root = this._element;
        this._layerID = root.getAttribute("ID")!;
    }

    public element(): Element {
        return this._element;
    }

    public get layerID() {
        return this._layerID;
    }
}
