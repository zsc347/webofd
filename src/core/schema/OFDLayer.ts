import { mm2px } from "../../common/unit";
import { OFDDocument } from "../document";
import {
    BlockType,
    importBlock,
    OFDBlock,
    OFDTextObject,
    TextCode
} from "./OFDBlock";
import { OFDElement } from "./OFDElement";
import { OFDPageElement } from "./OFDPageElement";

export class OFDLayerElement implements OFDElement {
    private doc: OFDDocument;
    private _page: OFDPageElement;
    private _element: Element;

    private _layerID!: string;

    private _blocks!: OFDBlock[] | null;

    constructor({
        doc,
        page,
        element
    }: {
        doc: OFDDocument;
        page: OFDPageElement;
        element: Element;
    }) {
        this.doc = doc;
        this._element = element;
        this._page = page;
        this._blocks = null;
        this.init();
    }

    private init() {
        const root = this._element;
        this._layerID = root.getAttribute("ID")!;
    }

    public element(): Element {
        return this._element;
    }

    public paint({ ctx }: { ctx: CanvasRenderingContext2D }) {
        console.log(`start to paint layer`, ctx, this);
        const blocks = this.parseBlocks();
        blocks.forEach(blk => this.paintBlock(blk, { ctx }));
    }

    private paintBlock(
        block: OFDBlock,
        { ctx }: { ctx: CanvasRenderingContext2D }
    ) {
        console.log(`start to paint layer`, ctx, this);
        const blocks = this.parseBlocks();
        blocks.forEach(block => {
            if (block.type === BlockType.TextObject) {
                this.paintText(block as OFDTextObject, { ctx });
            }
        });
    }

    private paintText(
        obj: OFDTextObject,
        { ctx }: { ctx: CanvasRenderingContext2D }
    ) {
        console.log(`paing text obj`, obj);
        const texts = obj.textCodes;
        const paint = (text: TextCode) => {
            const mx = obj.boundary.left + text.x;
            const my = obj.boundary.top + text.y;
            const x = mm2px(mx);
            const y = mm2px(my);
            ctx.fillText(text.text, x, y);
        };
        texts.forEach(paint);
    }

    private parseBlocks() {
        if (this._blocks === null) {
            const children = this.element().children;
            const blocks: OFDBlock[] = [];
            for (let i = 0, l = children.length; i < l; i++) {
                const ele = children.item(i) as Element;
                const block = importBlock(ele);
                if (block) {
                    blocks.push(block);
                }
            }
            this._blocks = blocks;
        }
        return this._blocks;
    }

    public get layerID() {
        return this._layerID;
    }
}
