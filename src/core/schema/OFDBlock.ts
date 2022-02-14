import { OFDRect } from "../../common/utils";
import { OFDFont } from "./OFDFont";

export abstract class OFDBlock {
    protected _element: Element;

    constructor({ element }: { element: Element }) {
        this._element = element;
    }

    public get element() {
        return this._element;
    }

    abstract get type(): string;
}

export interface TextCode {
    deltaX: string;
    x: number;
    y: number;
    text: string;
}

export class OFDTextObject extends OFDBlock {
    public boundary?: OFDRect;
    public id?: string;
    public _font?: OFDFont;
    public _size?: number;

    constructor({ element }: { element: Element }) {
        super({ element });
    }

    get type(): string {
        return "TextObject";
    }
}

export function importBlock(element: Element): OFDBlock {
    return new OFDTextObject({ element });
}
