import { OFDDocument } from "../document";
import { OFDElement } from "./OFDElement";
import { OFDPageElement } from "./OFDPageElement";
import { importRootNode } from "./xml";

export class OFDDocumentElement implements OFDElement {
    private doc: OFDDocument;

    private _element: Element | null;
    private _inited: boolean;
    private _pages: OFDPageElement[];

    constructor({ doc }: { doc: OFDDocument }) {
        this.doc = doc;
        this._element = null;
        this._inited = false;
        this._pages = [];
    }

    private checkInited() {
        if (!this._inited) {
            throw new Error("must call method `ensure` before get childs");
        }
    }

    public async ensure() {
        if (this._inited) {
            return;
        }
        if (!this._element || !this._element.namespaceURI) {
            throw new Error("illegal state, element not settled");
        }
        const { doc } = this;
        const { zip } = doc;
        const root = this._element;
        const ns = this._element.namespaceURI;
        const pc = root.getElementsByTagNameNS(ns, "Page");

        const pages: OFDPageElement[] = [];
        pages.length = pc.length;
        const contents = [];
        for (let i = 0, l = pc.length; i < l; i++) {
            const p = pc.item(i);
            if (!p) {
                throw new Error("illegal page element");
            }
            const loc = p.getAttribute("BaseLoc");
            const pageID = p.getAttribute("ID");
            if (!loc || !pageID) {
                throw new Error("illegal page element");
            }
            const dom = zip.loadAsDOM(`Doc_0/${loc}`);
            const promise = dom.then(xml => {
                pages[i] = new OFDPageElement({ doc, pageID, xml });
            });
            contents.push(promise);
        }
        await Promise.all(contents);
        this._pages = pages;
        this._inited = true;
    }

    public import(xml: Document) {
        this._element = importRootNode(xml);
    }

    public getPages(): OFDPageElement[] {
        this.checkInited();
        return this._pages;
    }

    public element(): Element {
        if (!this._element) {
            throw new Error("illegal: access before initialized");
        }
        return this._element;
    }
}
