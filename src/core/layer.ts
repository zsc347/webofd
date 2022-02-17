import { mm2px } from "../common/unit";
import { OFDDocument } from "./document";
import { PageProxy } from "./page";
import {
    BlockType,
    OFDBlock,
    OFDImageObject,
    OFDTextObject,
    TextCode
} from "./schema/OFDBlock";
import { OFDLayerElement } from "./schema/OFDLayerElement";
import { MediaType, ImageMedia } from "./schema/OFDMediaElement";

export class LayerProxy {
    private doc: OFDDocument;
    private page: PageProxy;
    private layer: OFDLayerElement;

    constructor({
        doc,
        page,
        element
    }: {
        doc: OFDDocument;
        page: PageProxy;
        element: OFDLayerElement;
    }) {
        this.doc = doc;
        this.page = page;
        this.layer = element;
    }

    public async paint({ ctx }: { ctx: CanvasRenderingContext2D }) {
        const blocks = this.layer.blocks;
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
}
