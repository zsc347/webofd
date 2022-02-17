import { parseDelta } from "../utils";

describe("utils test", () => {
    it("parse delta string to number array", () => {
        const text = "保密保密保密开保密保密保密25保密1保密601密";
        const deltaXStr =
            "g 14 4.2333 g 2 2.1166 -63.4995 4.2333 2.1167 g 2 4.2333 2.1167 g 2 2.1166";
        const deltaYStr = "g 16 0 4.2333 g 7 0";

        const deltaX = parseDelta(deltaXStr);
        const deltaY = parseDelta(deltaYStr);
        expect(deltaX.length).toBe(text.length);
        expect(deltaX.length).toBe(deltaY.length);
    });
});
