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

    public getArea() {
        return this.page.area;
    }
}
