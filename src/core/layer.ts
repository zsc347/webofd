import { OFDDocument } from "./document";
import { PageProxy } from "./page";
import { importBlock, OFDBlock } from "./schema/OFDBlock";
import { OFDLayerElement } from "./schema/OFDLayerElement";

export class LayerProxy {
    private doc: OFDDocument;
    private page: PageProxy;
    private layer: OFDLayerElement;
    private _blocks: OFDBlock[] | null;

    constructor({
        doc,
        page,
        element
    }: {
        doc: OFDDocument;
        page: PageProxy;
        element: OFDLayerElement;
    }) {
        this.doc = doc;
        this.page = page;
        this.layer = element;
        this._blocks = null;
    }

    public getBlocks() {
        if (!this._blocks) {
            this._blocks = [];
            const root = this.layer.element();
            const children = root.children;
            for (let i = 0, l = children.length; i < l; i++) {
                const element = children.item(i) as Element;
                const block = importBlock(this.doc, element);
                if (block) {
                    this._blocks.push(block);
                }
            }
            this.layer.element;
        }
        return this._blocks;
    }
}
