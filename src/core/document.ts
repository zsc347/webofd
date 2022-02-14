import { PageProxy } from "./page";
import { OFDDocumentElement } from "./schema/OFDDocumentElement";
import { importRootNode } from "./schema/xml";
import { Zip } from "./zip";

export class OFDDocument {
    private _zip: Zip;

    private _ns: string | null;
    private _pages: PageProxy[] | null;
    private _version: string | null;

    constructor({ zip }: { zip: Zip }) {
        this._zip = zip;
        this._pages = null;
        this._ns = null;
        this._version = null;
    }

    public async init() {
        const { zip } = this;
        const xml = await zip.loadAsDOM("OFD.xml");
        const ofd = importRootNode(xml);
        if (!ofd || !ofd.namespaceURI) {
            throw new Error("Illegal doc");
        }
        const ns = ofd.namespaceURI;
        this._ns = ns;
        const version = ofd.getAttribute("Version");
        if (!version) {
            throw new Error("Illegal doc");
        }
        this._version = version;
        console.log(ofd.getAttribute("Version"));
        const docRootName = ofd.getElementsByTagNameNS(ns, "DocRoot")[0]
            .textContent;
        if (!docRootName) {
            throw new Error("Illegal doc");
        }
        const rootXML = await zip.loadAsDOM(docRootName);
        const root = new OFDDocumentElement({ doc: this });
        root.import(rootXML);
        await root.ensure();
        const pages = root.getPages();
        this._pages = pages.map(
            page => new PageProxy({ doc: this, page: page })
        );

        console.trace("document init done");
    }

    public async getPage(pageNum: number): Promise<PageProxy | null> {
        if (this._pages === null) {
            throw new Error("Illega state");
        }
        if (pageNum > this._pages.length) {
            console.warn(`illegal argument 'pageNum' ${pageNum}`);
            return null;
        }
        const page = this._pages[pageNum];
        await page.ensure();
        return page;
    }

    public async getPages(): Promise<PageProxy[]> {
        if (this._pages) {
            return this._pages;
        }
        return this._pages!;
    }

    public get ns() {
        return this._ns;
    }

    public get version() {
        return this._version!;
    }

    public get zip() {
        return this._zip;
    }

    public dispose() {}
}
