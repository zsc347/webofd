import { OFDDocument } from "./document";
import { OFDPageElement } from "./schema/OFDPageElement";

export class PageProxy {
    private doc: OFDDocument;
    private page: OFDPageElement;
    private templates: PageProxy[];
    private ready: boolean;

    constructor({ doc, page }: { doc: OFDDocument; page: OFDPageElement }) {
        this.doc = doc;
        this.page = page;
        this.templates = [];
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
        this.ready = true;
    }

    public async render({ ctx }: { ctx: CanvasRenderingContext2D }) {
        // render templates with order
        for (let tpl of this.templates) {
            await tpl.render({ ctx });
        }

        // render curerent page
        const layers = this.page.contentLayers;
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
