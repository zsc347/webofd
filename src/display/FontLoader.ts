import { OFDFontElement } from "../core/schema/OFDFont";

export class FontLoader {
    private _styleElement;

    constructor() {
        this._styleElement = document.createElement("style");
        this._styleElement.id = `OFDJS_FONT_${Date.now()}`;
        document.documentElement
            .getElementsByTagName("head")[0]
            .appendChild(this._styleElement);
    }

    public async importFont(cfont: OFDFontElement) {
        const url = await cfont.load();
        if (url) {
            const font = new FontFace(cfont.familyName, `url(${url})`);
            await font.load();
            document.fonts.add(font);
        }
    }

    public dispose() {
        document.removeChild(this._styleElement);
    }
}
