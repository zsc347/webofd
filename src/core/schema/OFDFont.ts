export class OFDFont {
    private _fontId: string;

    constructor({ fontID }: { fontID: string }) {
        this._fontId = fontID;
    }

    public static of(fontID: string) {
        return new OFDFont({ fontID });
    }
}
