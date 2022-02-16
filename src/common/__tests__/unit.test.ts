import { mm2px } from "../unit";

describe("convert between units", () => {
    it("can convert mm to px", () => {
        const pxVal = mm2px(1);
        expect(Math.abs(pxVal - 96 / 25.4) < 0.001).toBe(true);
    });
});
