import { OFDDocument } from "../document";
import { OFDFontFace } from "./OFDFont";
import { OFDRect, parseCTM, parseBox } from "../../common/utils";

export abstract class OFDBlock {
    protected _el: Element;

    constructor({ el }: { el: Element }) {
        this._el = el;
    }

    public get element() {
        return this._el;
    }

    abstract get type(): BlockType;
}

export abstract class TextRun {
    public abstract name(): string;
}
export interface TextCode {
    deltaY?: string;
    deltaX?: string;
    x: number;
    y: number;
    text: string;
}

export class TextCodeRun extends TextRun {
    public deltaY?: string;
    public deltaX?: string;
    public x: number;
    public y: number;
    public text: string;

    constructor({ deltaY, deltaX, x, y, text }: TextCode) {
        super();
        this.deltaX = deltaX;
        this.deltaY = deltaY;
        this.x = x;
        this.y = y;
        this.text = text;
    }

    public name(): string {
        return "TextCode";
    }
}

export class FillColorRun extends TextRun {
    private alpha: string;
    private value: string;

    constructor({ alpha = "", value = "" }: { alpha: string; value: string }) {
        super();
        this.alpha = alpha;
        this.value = value;
    }

    public rgba() {
        const rgb = this.value.split(" ");
        if (rgb.length !== 3) {
            return "";
        }
        const [r, g, b] = rgb;
        if (this.alpha) {
            const alpha = parseInt(this.alpha) / 100;
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }
        return `rgba(${r}, ${g}, ${b})`;
    }

    public name(): string {
        return "FillColor";
    }
}

export class OFDTextObject extends OFDBlock {
    private doc: OFDDocument;
    private _boundary!: OFDRect;
    private _id!: string;
    private _font!: OFDFontFace;
    private _size!: number;
    private _runs!: TextRun[];
    private _ctm: number[] | null;

    constructor({ doc, el }: { doc: OFDDocument; el: Element }) {
        super({ el });
        this._runs = [];
        this.doc = doc;
        this._ctm = null;
        this.init();
    }

    private init() {
        const root = this.element;
        this._id = root.getAttribute("ID")!;
        this._boundary = parseBox(root.getAttribute("Boundary")!);
        this._size = parseFloat(root.getAttribute("Size")!);
        this._font = this.doc.getFont(root.getAttribute("Font")!);

        const ctmStr = root.getAttribute("CTM");
        if (ctmStr) {
            this._ctm = parseCTM(ctmStr);
        }

        const children = this.element.children;
        for (let i = 0, l = children.length; i < l; i++) {
            const ele = children.item(i)!;
            if (ele.localName === "TextCode") {
                const deltaX = ele.getAttribute("DeltaX") || "";
                const deltaY = ele.getAttribute("DeltaY") || "";
                const x = parseFloat(ele.getAttribute("X")!);
                const y = parseFloat(ele.getAttribute("Y")!);
                const text = ele.textContent!;
                this._runs.push(
                    new TextCodeRun({
                        deltaX,
                        deltaY,
                        x,
                        y,
                        text
                    })
                );
            }

            if (ele.localName === "FillColor") {
                const alpha = ele.getAttribute("Alpha") || "";
                const value = ele.getAttribute("Value") || "";
                this._runs.push(new FillColorRun({ alpha, value }));
            }
        }
    }

    public get type(): BlockType {
        return BlockType.TextObject;
    }

    public get size() {
        return this._size;
    }

    public get boundary() {
        return this._boundary;
    }

    public get font() {
        return this._font;
    }

    public get runs() {
        return this._runs;
    }

    public get ctm() {
        return this._ctm;
    }
}

export class OFDImageObject extends OFDBlock {
    private _resID!: string;
    private _ctm!: number[];
    private _boundary!: OFDRect;

    constructor({ el }: { el: Element }) {
        super({ el });
        this.init();
    }

    private init() {
        const el = this.element;
        this._resID = el.getAttribute("ResourceID")!;
        this._ctm = parseCTM(el.getAttribute("CTM")!);
        this._boundary = parseBox(el.getAttribute("Boundary")!);
    }

    public get resourceID() {
        return this._resID;
    }

    public get ctm() {
        return this._ctm;
    }

    public get boundary() {
        return this._boundary;
    }

    get type(): BlockType {
        return BlockType.ImageObject;
    }
}

export function importBlock(doc: OFDDocument, el: Element): OFDBlock | null {
    if (el.localName === "TextObject") {
        return new OFDTextObject({ doc, el });
    }
    if (el.localName === "ImageObject") {
        return new OFDImageObject({ el });
    }
    console.warn(`unexpect object in layer`, el);
    return null;
}

export enum BlockType {
    TextObject = "TextObject",
    ImageObject = "ImageObject"
}
