export interface OFDRect {
    left: number;
    top: number;
    width: number;
    height: number;
}

export function rect(left: number, top: number, width: number, height: number) {
    return { left, top, width, height } as OFDRect;
}

export function parseBox(rectStr: string) {
    const nums = rectStr.split(" ").map(s => parseFloat(s));
    return rect(nums[0], nums[1], nums[2], nums[3]);
}

export function parseCTM(ctmStr: string) {
    return ctmStr.split(" ").map(s => parseFloat(s));
}

// TODO, optimize using iterator to prevent a large array generated
// sample: "g 14 4.2333 g 2 2.1166 -63.4995 4.2333 2.1167 g 2 4.2333 2.1167 g 2 2.1166"
export function parseDelta(deltaStr: string): number[] {
    const parts = deltaStr.split(" ");
    const rs: number[] = [];

    let i = 0;
    const l = parts.length;
    while (i < l) {
        const p = parts[i];
        if (p == "g" && i + 2 < l) {
            const repeat = parseInt(parts[i + 1]);
            const delta = parseFloat(parts[i + 2]);
            rs.push(...Array<number>(repeat).fill(delta));
            i += 3;
        } else {
            rs.push(parseFloat(parts[i]));
            i++;
        }
    }
    return rs;
}
