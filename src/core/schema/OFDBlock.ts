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

export abstract class Run {
    public abstract name(): string;
}
export interface TextCode {
    deltaY?: string;
    deltaX?: string;
    x: number;
    y: number;
    text: string;
}

export class TextCodeRun extends Run {
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

export class FillColorRun extends Run {
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
    private _runs!: Run[];
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

export class AbbreviatedDataRun extends Run {
    public abbreviatedData: string;

    constructor({ abbreviatedData }: { abbreviatedData: string }) {
        super();
        this.abbreviatedData = abbreviatedData;
    }

    public name(): string {
        return "AbbreviatedDataRun";
    }
}

export class OFDPageBlock extends OFDBlock {
    private doc: OFDDocument;
    private _blocks: OFDBlock[];

    constructor({ doc, el }: { doc: OFDDocument; el: Element }) {
        super({ el });
        this.doc = doc;
        this._blocks = [];
        this.parseBlocks();
    }

    private parseBlocks() {
        const children = this.element.children;
        const blocks: OFDBlock[] = [];
        for (let i = 0, l = children.length; i < l; i++) {
            const ele = children.item(i) as Element;
            const block = importBlock(this.doc, ele);
            if (block) {
                blocks.push(block);
            }
        }
        this._blocks = blocks;
    }

    public get blocks() {
        return this._blocks;
    }

    public get type(): BlockType {
        return BlockType.PageBlock;
    }
}

export class OFDPathObject extends OFDBlock {
    private _boundary!: OFDRect;
    private _fill: boolean;
    private _stroke: boolean;
    private _lineWidth: number | null;
    private _runs: AbbreviatedDataRun[];

    constructor({ el }: { el: Element }) {
        super({ el });
        this._runs = [];
        this._stroke = false;
        this._fill = false;
        this._lineWidth = null;
        this.init();
    }

    private init() {
        const el = this.element;
        this._boundary = parseBox(el.getAttribute("Boundary")!);
        this._fill = Boolean(el.getAttribute("Fill"));
        this._stroke = Boolean(el.getAttribute("Stroke"));
        if (!this._stroke && !this._fill) {
            this._stroke = true;
        }
        this._boundary = parseBox(el.getAttribute("Boundary")!);
        if (el.getAttribute("LineWidth")) {
            this._lineWidth = parseFloat(el.getAttribute("LineWidth")!);
        }
        const children = el.children;
        for (let i = 0, l = children.length; i < l; i++) {
            const ele = children.item(i)!;
            if (ele.localName === "AbbreviatedData") {
                const abbreviatedData = ele.textContent!;
                this._runs.push(new AbbreviatedDataRun({ abbreviatedData }));
            }
        }
    }

    public get boundary() {
        return this._boundary;
    }

    public get runs() {
        return this._runs;
    }

    public get fill() {
        return this._fill;
    }

    public get stroke() {
        return this._stroke;
    }

    public get lineWidth() {
        return this._lineWidth;
    }

    public get type(): BlockType {
        return BlockType.PathObject;
    }
}

export function importBlock(doc: OFDDocument, el: Element): OFDBlock | null {
    if (el.localName === "TextObject") {
        return new OFDTextObject({ doc, el });
    }
    if (el.localName === "ImageObject") {
        return new OFDImageObject({ el });
    }
    if (el.localName === "PathObject") {
        return new OFDPathObject({ el });
    }
    if (el.localName === "CompositeObject") {
        console.warn(`unsupport page block '${el.localName}'`);
        return null;
    }
    if (el.localName === "PageBlock") {
        return new OFDPageBlock({ doc, el });
    }
    console.error(`unexpect object in layer`, el);
    return null;
}

export enum BlockType {
    PageBlock = "PageBlock",
    TextObject = "TextObject",
    ImageObject = "ImageObject",
    PathObject = "PathObject"
}
