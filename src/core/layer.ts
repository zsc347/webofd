import { mm2px } from "../common/unit";
import { parseDelta } from "../common/utils";
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
        const texts = obj.textCodes;
        ctx.save();
        const paint = (run: TextCode) => {
            const dx = parseDelta(run.deltaX);
            const dy = parseDelta(run.deltaY);
            const fontFamily = obj.font.familyName;
            const fontSize = mm2px(obj.size);
            ctx.font = `${fontSize}px ${fontFamily}`;
            let x = mm2px(obj.boundary.left + run.x);
            let y = mm2px(obj.boundary.top + run.y);
            const text = run.text;
            for (let i = 0, l = text.length; i < l; i++) {
                const ch = run.text.charAt(i);
                ctx.fillText(ch, x, y);
                x += mm2px(dx[i] || 0);
                y += mm2px(dy[i] || 0);
            }
        };
        texts.forEach(paint);
        ctx.restore();
    }

    private async paintImage(
        obj: OFDImageObject,
        { ctx }: { ctx: CanvasRenderingContext2D }
    ) {
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
    }
}
