import { OFDDocument } from "../document";
import { OFDElement } from "./OFDElement";
import { OFDPageElement } from "./OFDPageElement";

export class OFDDocumentElement implements OFDElement {
    private doc: OFDDocument;

    private _el: Element;
    private _inited: boolean;
    private _pages: OFDPageElement[];
    private _templates: OFDPageElement[];

    private _publicRes: string;
    private _documentRes: string;

    constructor({ doc, el }: { doc: OFDDocument; el: Element }) {
        this.doc = doc;
        this._inited = false;
        this._pages = [];
        this._templates = [];
        this._publicRes = "";
        this._documentRes = "";
        this._el = el;
        this.init();
    }

    private init() {
        if (!this._el || !this._el.namespaceURI) {
            throw new Error("illegal state, element not settled");
        }
        const root = this._el;
        const ns = this._el.namespaceURI;

        const publicResEl = root.getElementsByTagNameNS(ns, "PublicRes")[0];
        if (publicResEl) {
            this._publicRes = publicResEl.textContent || "";
        }
        const documentResEl = root.getElementsByTagNameNS(ns, "DocumentRes")[0];
        if (documentResEl) {
            this._documentRes = documentResEl.textContent || "";
        }
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
        const root = this._el!;
        const ns = root.namespaceURI;
        this._pages = await this.loadPages(
            root.getElementsByTagNameNS(ns, "Page"),
            "Doc_0/"
        );
        this._templates = await this.loadPages(
            root.getElementsByTagNameNS(ns, "TemplatePage"),
            "Doc_0/",
            true
        );
        this._inited = true;
    }

    private async loadPages(
        collection: HTMLCollectionOf<Element>,
        locPrefix = "",
        isTemplate = false
    ): Promise<OFDPageElement[]> {
        const { doc } = this;
        const { zip } = doc;
        const pages: OFDPageElement[] = [];
        const contents = [];
        for (let i = 0, l = collection.length; i < l; i++) {
            const p = collection.item(i);
            if (!p) {
                throw new Error("illegal page element");
            }
            const loc = p.getAttribute("BaseLoc");
            const gid = p.getAttribute("ID");
            if (!loc || !gid) {
                throw new Error("illegal page element");
            }
            const dom = zip.loadAsDOM(`${locPrefix}${loc}`);
            const promise = dom.then(xml => {
                pages[i] = new OFDPageElement({
                    doc,
                    gid,
                    xml,
                    template: isTemplate
                });
            });
            contents.push(promise);
        }
        await Promise.all(contents);
        return pages;
    }

    public getPages(): OFDPageElement[] {
        this.checkInited();
        return this._pages;
    }

    public getTemlates(): OFDPageElement[] {
        this.checkInited();
        return this._templates;
    }

    public get publicRes() {
        return this._publicRes;
    }

    public get documentRes() {
        return this._documentRes;
    }

    public element(): Element {
        if (!this._el) {
            throw new Error("illegal: access before initialized");
        }
        return this._el;
    }
}
