import { mm2px } from "../common/unit";
import { PageProxy } from "../core/page";

export class PageView {
    private _page: PageProxy;

    private scale: number;

    constructor({ page }: { page: PageProxy }) {
        this._page = page;
        this.scale = 0.8;
    }

    public paint(container: HTMLDivElement) {
        const { page, scale } = this;

        const div = document.createElement("div");
        div.className = "page";

        const canvas = document.createElement("canvas");
        div.appendChild(canvas);
        container.appendChild(div);
        // const ctx = canvas.getContext("2d", { alpha: false });
        const box = page.getBox();
        const width = mm2px(box.width);
        const height = mm2px(box.height);
        canvas.width = width;
        canvas.height = height;
        canvas.style.width = `${width * scale}px`;
        canvas.style.height = `${height * scale}px`;

        div.style.width = canvas.style.width;
        div.style.height = canvas.style.height;
    }

    public get page() {
        return this._page;
    }
}
