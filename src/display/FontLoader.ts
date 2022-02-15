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

    private insertRule(rule: string) {
        let styleElement = this._styleElement;
        const styleSheet = styleElement.sheet!;
        styleSheet.insertRule(rule, styleSheet.cssRules.length);
    }

    public async importFont(font: OFDFontElement) {
        const url = await font.load();
        const rule = `@font-face {font-family:"${font.familyName}";src:${url}}`;
        this.insertRule(rule);
    }

    public dispose() {
        document.removeChild(this._styleElement);
    }
}
