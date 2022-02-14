import { OFDRect, parseRect } from "../../common/utils";
import { OFDFont } from "./OFDFont";

export abstract class OFDBlock {
    protected _element: Element;

    constructor({ element }: { element: Element }) {
        this._element = element;
    }

    public get element() {
        return this._element;
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

    constructor({ element }: { element: Element }) {
        super({ element });
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

export function importBlock(element: Element): OFDBlock | null {
    if (element.localName !== "TextObject") {
        console.warn(`unexpect object in layer`, element);
        return null;
    }
    return new OFDTextObject({ element });
}

export enum BlockType {
    TextObject = "TextObject"
}
