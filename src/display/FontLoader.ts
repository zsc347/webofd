import { OFDFontElement } from "../core/schema/OFDFont";

export class FontLoader {
    private _docFonts: FontFace[];

    constructor() {
        this._docFonts = [];
    }

    public async importFont(cfont: OFDFontElement) {
        const url = await cfont.load();
        if (url) {
            const font = new FontFace(cfont.familyName, `url(${url})`);
            try {
                await font.load();
                document.fonts.add(font);
                this._docFonts.push(font);
            } catch (err: unknown) {
                // ignore
                console.error(`Failed to load font '${cfont.familyName}'`);
            }
        }
    }

    public dispose() {
        this._docFonts.forEach(font => document.fonts.delete(font));
    }
}
