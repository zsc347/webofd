import { OFDDocument } from "../document";
import { importBlock, OFDBlock } from "./OFDBlock";
import { OFDElement } from "./OFDElement";
import { OFDPageElement } from "./OFDPageElement";

export class OFDLayerElement implements OFDElement {
    private doc: OFDDocument;
    private _page: OFDPageElement;
    private _element: Element;

    private _layerID!: string;

    private _blocks: OFDBlock[];

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
        this._blocks = [];
        this.init();
    }

    private init() {
        const root = this._element;
        this._layerID = root.getAttribute("ID")!;
        this.parseBlocks();
    }

    public element(): Element {
        return this._element;
    }

    private parseBlocks() {
        const children = this.element().children;
        const blocks: OFDBlock[] = [];
        for (let i = 0, l = children.length; i < l; i++) {
            const ele = children.item(i) as Element;
            const block = importBlock(this.doc, ele);
            if (block) {
                blocks.push(block);
            }
        }
        this._blocks = blocks;
    }

    public get blocks() {
        return this._blocks;
    }

    public get layerID() {
        return this._layerID;
    }
}
