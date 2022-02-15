import { OFDRect, parseRect } from "../../common/utils";
import { OFDDocument } from "../document";
import { OFDElement } from "./OFDElement";
import { OFDLayerElement } from "./OFDLayer";
import { importRootNode } from "./xml";

export interface TempalteRef {
    templateID: string;
    zOrder: string;
}

export class OFDPageElement implements OFDElement {
    private doc: OFDDocument;
    private _element: Element | null;
    private _gid: string;
    private _area: OFDRect | null;
    private _contentLayers: OFDLayerElement[] | null;

    private _isTemplate: boolean;
    private _templateRefs: TempalteRef[];

    constructor({
        doc,
        gid,
        xml,
        template = false
    }: {
        doc: OFDDocument;
        gid: string;
        xml: Document;
        template?: boolean;
    }) {
        this.doc = doc;
        this._gid = gid;
        this._element = importRootNode(xml);
        this._area = null;
        this._contentLayers = null;
        this._isTemplate = Boolean(template);
        this._templateRefs = [];

        this.init();
    }

    private init() {
        if (!this._element || !this._element.namespaceURI) {
            throw new Error("element not settled");
        }
        const root = this._element;
        const ns = this._element.namespaceURI;

        // read area
        const areaEl = root.getElementsByTagNameNS(ns, "Area")![0];
        const box = areaEl.getElementsByTagNameNS(ns, "PhysicalBox")![0];
        this._area = parseRect(box.textContent!);

        // read content layers
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

        // read template refs
        const templateEls = root.getElementsByTagNameNS(ns, "Template");
        for (let i = 0, l = templateEls.length; i < l; i++) {
            const el = templateEls.item(i)!;
            const templateID = el.getAttribute("TemplateID")!;
            const zOrder = el.getAttribute("Background")!;
            this._templateRefs.push({
                templateID,
                zOrder
            } as TempalteRef);
        }
    }

    public element(): Element {
        if (!this._element) {
            throw new Error("illegal: access before initialized");
        }
        return this._element;
    }

    public get gid() {
        return this._gid;
    }

    public get area() {
        return this._area!;
    }

    public get contentLayers() {
        return this._contentLayers!;
    }

    public isTemplate() {
        return this._isTemplate;
    }

    public get templateRefs() {
        return this._templateRefs;
    }
}
