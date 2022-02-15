import { importMedia, MultiMedia } from "./media";
import { PageProxy } from "./page";
import { OFDDocumentElement } from "./schema/OFDDocumentElement";
import { importRootNode } from "./schema/xml";
import { Zip } from "./zip";

type TemplateMap = Record<string, PageProxy>;
type ResourceMap = Record<string, MultiMedia>;

export class OFDDocument {
    private _zip: Zip;

    private _ns: string | null;
    private _pages: PageProxy[] | null;
    private _version: string | null;
    private _tplMap: TemplateMap;
    private _resMap: ResourceMap;

    constructor({ zip }: { zip: Zip }) {
        this._zip = zip;
        this._pages = null;
        this._ns = null;
        this._version = null;
        this._tplMap = Object.create(null);
        this._resMap = Object.create(null);
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

        // read pages and templates
        const rootXML = await zip.loadAsDOM(docRootName);

        const root = new OFDDocumentElement({
            doc: this,
            el: rootXML.getRootNode() as Element
        });
        root.import(rootXML);
        await root.ensure();
        const pages = root.getPages();
        this._pages = pages.map(page => new PageProxy({ doc: this, page }));
        const templates = root.getTemlates();
        templates.map(page => {
            const tpl = new PageProxy({ doc: this, page });
            this._tplMap[page.gid] = tpl;
        });

        const loadResources = async () => {
            const { documentRes } = root;
            if (!documentRes) {
                return;
            }
            const resDOM = await zip.loadAsDOM(`Doc_0/${documentRes}`);
            const resXML = importRootNode(resDOM)!;
            const mediasEl = resXML.getElementsByTagNameNS(
                resXML.namespaceURI,
                "MultiMedias"
            )[0];
            if (!mediasEl) {
                return;
            }
            const mediaEls = mediasEl.children;
            for (let i = 0, l = mediaEls.length; i < l; i++) {
                const media = importMedia(this, mediaEls.item(i)!);
                if (media) {
                    this._resMap[media.gid] = media;
                }
            }
        };

        await loadResources();
        console.trace("document init done");
    }

    public getTemplate(templateID: string) {
        return this._tplMap[templateID];
    }

    public getResource(resourceID: string) {
        return this._resMap[resourceID];
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
