import { OFDRect, parseCTM, parseRect } from "../../common/utils";
import { OFDFont } from "./OFDFont";

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

export interface TextCode {
    deltaX: string;
    x: number;
    y: number;
    text: string;
}

export class OFDTextObject extends OFDBlock {
    private _boundary!: OFDRect;
    private _id!: string;
    private _font!: OFDFont;
    private _size!: number;
    private _textCodes!: TextCode[];

    constructor({ element: el }: { element: Element }) {
        super({ el: el });
        this._textCodes = [];
        this.init();
    }

    private init() {
        const root = this.element;
        this._id = root.getAttribute("ID")!;
        this._boundary = parseRect(root.getAttribute("Boundary")!);
        this._size = parseFloat(root.getAttribute("Size")!);
        this._font = OFDFont.of(root.getAttribute("Font")!);

        const children = this.element.children;
        for (let i = 0, l = children.length; i < l; i++) {
            const ele = children.item(i)!;
            if (ele.localName === "TextCode") {
                const deltaX = ele.getAttribute("DeltaX");
                const x = parseFloat(ele.getAttribute("X")!);
                const y = parseFloat(ele.getAttribute("Y")!);
                const text = ele.textContent!;
                this._textCodes.push({
                    deltaX,
                    x,
                    y,
                    text
                } as TextCode);
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

    public get textCodes() {
        return this._textCodes;
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
        this._boundary = parseRect(el.getAttribute("Boundary")!);
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

export function importBlock(element: Element): OFDBlock | null {
    if (element.localName === "TextObject") {
        return new OFDTextObject({ element });
    }
    if (element.localName === "ImageObject") {
        return new OFDImageObject({ el: element });
    }
    console.warn(`unexpect object in layer`, element);
    return null;
}

export enum BlockType {
    TextObject = "TextObject",
    ImageObject = "ImageObject"
}
