import { mm2px } from "../../common/unit";
import { OFDDocument } from "../document";
import { ImageMedia, MediaType } from "./OFDMediaElement";
import {
    BlockType,
    importBlock,
    OFDBlock,
    OFDImageObject,
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

    public async paint({ ctx }: { ctx: CanvasRenderingContext2D }) {
        const blocks = this.parseBlocks();
        for (let block of blocks) {
            await this.paintBlock(block, { ctx });
        }
    }

    private async paintBlock(
        block: OFDBlock,
        { ctx }: { ctx: CanvasRenderingContext2D }
    ) {
        if (block.type === BlockType.TextObject) {
            await this.paintText(block as OFDTextObject, { ctx });
        }
        if (block.type === BlockType.ImageObject) {
            await this.paintImage(block as OFDImageObject, { ctx });
        }
    }

    private paintText(
        obj: OFDTextObject,
        { ctx }: { ctx: CanvasRenderingContext2D }
    ) {
        // console.log(`paing text obj`, obj);
        const texts = obj.textCodes;
        const paint = (text: TextCode) => {
            const mx = obj.boundary.left + text.x;
            const my = obj.boundary.top + text.y;
            const x = mm2px(mx);
            const y = mm2px(my);
            ctx.save();
            const fontFamily = obj.font.familyName;
            const fontSize = mm2px(obj.size);
            ctx.font = `${fontSize}px ${fontFamily}`;
            ctx.fillText(text.text, x, y);
            ctx.restore();
        };
        texts.forEach(paint);
        console.log(`texts painted`);
    }

    private async paintImage(
        obj: OFDImageObject,
        { ctx }: { ctx: CanvasRenderingContext2D }
    ) {
        console.log(`paint image object`, obj);
        const resId = obj.resourceID;
        const { doc } = this;
        const res = doc.getResource(resId);
        if (res.type !== MediaType.Image) {
            console.warn("unexpect resource", res);
        }
        const media = res as ImageMedia;
        const img = await media.load();

        const x = mm2px(obj.boundary.left);
        const y = mm2px(obj.boundary.top);
        const w = mm2px(obj.boundary.width);
        const h = mm2px(obj.boundary.height);
        ctx.drawImage(img, x, y, w, h);

        console.log("image painted", img);
    }

    private parseBlocks() {
        if (this._blocks === null) {
            const children = this.element().children;
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
        console.log(`==> blocks`, this._blocks);
        return this._blocks;
    }

    public get layerID() {
        return this._layerID;
    }
}
