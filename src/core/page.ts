import { OFDDocument } from "./document";
import { LayerProxy } from "./layer";
import { OFDPageElement } from "./schema/OFDPageElement";

export class PageProxy {
    private doc: OFDDocument;
    private page: OFDPageElement;
    private layers: LayerProxy[];
    private templates: PageProxy[];
    private ready: boolean;

    constructor({ doc, page }: { doc: OFDDocument; page: OFDPageElement }) {
        this.doc = doc;
        this.page = page;
        this.templates = [];
        this.layers = [];
        this.ready = false;
    }

    public async ensure() {
        if (this.ready) {
            return;
        }
        const refs = this.page.templateRefs;
        this.templates = refs.map(ref => this.doc.getTemplate(ref.templateID));
        const awaits = this.templates.map(tpl => tpl.ensure());
        await Promise.all(awaits);

        this.layers = this.page.contentLayers.map(
            layerEl =>
                new LayerProxy({
                    doc: this.doc,
                    page: this,
                    element: layerEl
                })
        );

        this.ready = true;
    }

    public async render({ ctx }: { ctx: CanvasRenderingContext2D }) {
        if (!this.ready) {
            throw new Error("illegal state");
        }
        // render templates with order
        for (let tpl of this.templates) {
            await tpl.render({ ctx });
        }

        // render curerent page
        const layers = this.layers;
        for (let layer of layers) {
            await layer.paint({ ctx });
        }
    }

    public getPhysicalBox() {
        return this.page.area;
    }

    public getTempates(): PageProxy[] {
        return this.templates;
    }
}
