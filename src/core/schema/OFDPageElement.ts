import { OFDRect, parseRect } from "../../common/utils";
import { OFDDocument } from "../document";
import { OFDElement } from "./OFDElement";
import { OFDLayerElement } from "./OFDLayer";
import { importRootNode } from "./xml";

export class OFDPageElement implements OFDElement {
    private doc: OFDDocument;
    private _element: Element | null;
    private _pageID: string;
    private _area: OFDRect | null;
    private _contentLayers: OFDLayerElement[] | null;

    private _inited: boolean;

    constructor({
        doc,
        pageID,
        xml
    }: {
        doc: OFDDocument;
        pageID: string;
        xml: Document;
    }) {
        this.doc = doc;
        this._pageID = pageID;
        this._element = importRootNode(xml);
        this._inited = false;
        this._area = null;
        this._contentLayers = null;
    }

    private checkInited() {
        if (!this._inited) {
            throw new Error("must call `ensur` before access attributes");
        }
    }

    public ensure() {
        if (this._inited) {
            return;
        }
        if (!this._element || !this._element.namespaceURI) {
            throw new Error("element not settled");
        }
        const root = this._element;
        const ns = this._element.namespaceURI;

        // init area
        const areaEl = root.getElementsByTagNameNS(ns, "Area")![0];
        const box = areaEl.getElementsByTagNameNS(ns, "PhysicalBox")![0];
        this._area = parseRect(box.textContent!);

        // init content layers
        const layerEls = root.getElementsByTagNameNS(ns, "Layer");
        const layers: OFDLayerElement[] = [];
        layers.length = layerEls.length;
        for (let i = 0, l = layerEls.length; i < l; i++) {
            const layerEl = layerEls.item(i)!;
            layers[i] = new OFDLayerElement({
                doc: this.doc,
                page: this,
                element: layerEl
            });
        }
        this._contentLayers = layers;

        this._inited = true;
    }

    public element(): Element {
        if (!this._element) {
            throw new Error("illegal: access before initialized");
        }
        return this._element;
    }

    public get pageID() {
        return this._pageID;
    }

    public get area() {
        this.checkInited();
        return this._area!;
    }

    public get contentLayers() {
        this.checkInited();
        return this._contentLayers!;
    }
}
