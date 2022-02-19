import { mm2px } from "./unit";

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
export function parseDelta(deltaStr?: string): number[] {
    if (!deltaStr) {
        return [];
    }
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

// sample: "M 0 0 L 71.4112 0 L 71.4112 8.4642 L 0 8.4642 C"
export function parseAbbreviatedData(abbr: string): {
    start: {
        x: number;
        y: number;
    } | null;
    path: Path2D;
} {
    const ops = abbr.split(" ");
    let rs = [];
    let start = null;
    for (let i = 0, l = ops.length; i < l; i++) {
        const op = ops[i];
        if (op.length === 0) {
            continue;
        }
        if (op === "S") {
            const x = mm2px(parseFloat(ops[i + 1]));
            const y = mm2px(parseFloat(ops[i + 2]));
            start = { x, y };
        } else if (
            op === "M" ||
            op === "L" ||
            op === "Q" ||
            op === "B" ||
            op === "A"
        ) {
            rs.push(op);
        } else {
            rs.push(`${mm2px(parseFloat(op))}`);
        }
    }
    const pathRaw = rs.join(" ");
    console.log(`raw path is`, pathRaw);
    const path = new Path2D(pathRaw);
    return { start, path };
}

export function roundToDivide(x: number, div: number): number {
    const r = x % div;
    if (r === 0) {
        return x;
    }
    return Math.round(x - r + div);
}
