import { FontLoader } from "../display/FontLoader";
import { importMedia, MultiMedia } from "./schema/OFDMediaElement";
import { PageProxy } from "./page";
import { OFDDocumentElement } from "./schema/OFDDocumentElement";
import { OFDFontElement, OFDFontFace } from "./schema/OFDFont";
import { importRootNode } from "./schema/xml";
import { Zip } from "./zip";

type TemplateMap = Record<string, PageProxy | undefined>;
type ResourceMap = Record<string, MultiMedia | undefined>;
type FontsMap = Record<string, OFDFontFace | undefined>;

export class OFDDocument {
    private _zip: Zip;

    private _ns: string | null;
    private _pages: PageProxy[] | null;
    private _version: string | null;
    private _tplMap: TemplateMap;
    private _resMap: ResourceMap;
    private _fontsMap: FontsMap;

    private _ready: boolean;

    private fontLoader: FontLoader;

    constructor({ zip, fontLoader }: { zip: Zip; fontLoader: FontLoader }) {
        this._zip = zip;
        this._pages = null;
        this._ns = null;
        this._version = null;
        this._tplMap = Object.create(null);
        this._resMap = Object.create(null);
        this._fontsMap = Object.create(null);
        this._ready = false;
        this.fontLoader = fontLoader;
    }

    public async init() {
        if (this._ready) {
            return;
        }
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
        const root = new OFDDocumentElement({
            doc: this,
            el: importRootNode(rootXML) as Element
        });

        // read pages and templates
        const loadPages = async () => {
            await root.ensure();
            const pages = root.getPages();
            this._pages = pages.map(page => new PageProxy({ doc: this, page }));
            const templates = root.getTemlates();
            templates.map(page => {
                const tpl = new PageProxy({ doc: this, page });
                this._tplMap[page.gid] = tpl;
            });
        };

        // read medias
        const loadMedias = async () => {
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
        // read and import fonts
        const loadFonts = async () => {
            const { publicRes } = root;
            if (!publicRes) {
                return;
            }
            const resDOM = await zip.loadAsDOM(`Doc_0/${publicRes}`);
            const resXML = importRootNode(resDOM)!;
            const fontsEl = resXML.getElementsByTagNameNS(
                resXML.namespaceURI,
                "Fonts"
            )[0];
            if (!fontsEl) {
                return;
            }
            const fontEls = fontsEl.children;
            const processes = [];
            for (let i = 0, l = fontEls.length; i < l; i++) {
                const fontEl = fontEls.item(i)!;
                const font = new OFDFontElement({ doc: this, el: fontEl });
                this._fontsMap[font.fontID] = font.face;
                if (font.loc) {
                    processes.push(this.fontLoader.importFont(font));
                }
            }
            await Promise.all(processes);
            console.log(`fonts loaded`);
        };

        await loadMedias();
        await loadFonts();
        await loadPages();

        this._ready = true;
        console.log("document init done");
    }

    public async ensurePage(pageNum: number): Promise<PageProxy | null> {
        await this.init();
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

    public getTemplate(templateID: string) {
        const tpl = this._tplMap[templateID];
        if (!tpl) {
            throw new Error(`template not found ${templateID}`);
        }
        return tpl;
    }

    public getResource(resourceID: string) {
        const res = this._resMap[resourceID];
        if (!res) {
            throw new Error(`res not found ${resourceID}`);
        }
        return res;
    }

    public getFont(fontID: string) {
        const face = this._fontsMap[fontID];
        if (!face) {
            throw new Error(`font face not found ${fontID}`);
        }
        return face;
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

    public get ready() {
        return this._ready;
    }

    public dispose() {
        this.fontLoader.dispose();
    }
}
