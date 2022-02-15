import { OFDDocument } from "./document";

export enum MediaType {
    Image = "Image"
}

export abstract class MultiMedia {
    protected _el: Element;
    protected _gid!: string;

    constructor({ el }: { el: Element }) {
        this._el = el;
    }

    public get element() {
        return this._el;
    }

    public get gid() {
        return this._gid;
    }

    abstract get type(): MediaType;
}

export class ImageMedia extends MultiMedia {
    private doc: OFDDocument;
    private _loc;

    constructor({ doc, el }: { doc: OFDDocument; el: Element }) {
        super({ el });
        this.doc = doc;
        this._gid = el.getAttribute("ID")!;
        const fileEl = el.getElementsByTagNameNS(
            el.namespaceURI,
            "MediaFile"
        )[0];
        if (!fileEl) {
            throw new Error("invalid media res");
        }
        this._loc = fileEl.textContent || "";
    }

    public async load(): Promise<HTMLImageElement> {
        const img = new Image();
        const data = await this.doc.zip.load(`Doc_0/Res/${this._loc}`);
        img.src = URL.createObjectURL(new Blob([data]));
        await new Promise<void>((resolve, reject) => {
            img.onload = () => {
                resolve();
            };
            img.onerror = () => {
                reject();
            };
        });
        return img;
    }

    public get loc() {
        return this._loc;
    }

    public get type() {
        return MediaType.Image;
    }
}

export function importMedia(doc: OFDDocument, el: Element): MultiMedia | null {
    if (el.localName !== "MultiMedia" || el.getAttribute("Type") !== "Image") {
        console.warn(
            `unkown media type ${el.localName} ${el.getAttribute("Type")}`
        );
        return null;
    }
    return new ImageMedia({ doc, el });
}
