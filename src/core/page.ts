import { OFDDocument } from "./document";
import { OFDPageElement } from "./schema/OFDPageElement";

export class PageProxy {
    private doc: OFDDocument;
    private page: OFDPageElement;

    constructor({ doc, page }: { doc: OFDDocument; page: OFDPageElement }) {
        this.doc = doc;
        this.page = page;
    }

    public async ensure() {
        await this.page.ensure();
    }

    public render({ ctx }: { ctx: CanvasRenderingContext2D }) {
        const layers = this.page.contentLayers;
        for (let layer of layers) {
            layer.paint({ ctx });
        }
    }

    public getBox() {
        return this.page.area;
    }
}
