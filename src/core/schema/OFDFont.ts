import { OFDDocument } from "../document";

export interface OFDFontFace {
    familyName: string;
    fontID: string;
}

export class OFDFontElement {
    private doc: OFDDocument;
    private _el: Element;
    private _fontId: string;
    private _familyName: string;
    private _loc: string;

    constructor({ doc, el }: { doc: OFDDocument; el: Element }) {
        this.doc = doc;
        this._el = el;
        this._familyName = el.getAttribute("FamilyName")!;
        this._fontId = el.getAttribute("ID")!;

        const fileEl = el.getElementsByTagNameNS(
            el.namespaceURI,
            "FontFile"
        )[0];
        this._loc = fileEl?.textContent || "";
    }

    public async load(): Promise<string> {
        if (!this.load) {
            return "";
        }
        const binary = await this.doc.zip.load(`Doc_0/Res/${this._loc}`);
        return URL.createObjectURL(new Blob([binary]));
    }

    public get familyName() {
        return this._familyName;
    }

    public get loc() {
        return this._loc;
    }

    public get fontID() {
        return this._fontId;
    }

    public get face() {
        return {
            fontID: this._fontId,
            familyName: this._familyName
        } as OFDFontFace;
    }

    public get element() {
        return this._el;
    }
}
