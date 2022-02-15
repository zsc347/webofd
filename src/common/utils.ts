export interface OFDRect {
    left: number;
    top: number;
    width: number;
    height: number;
}

export function rect(left: number, top: number, width: number, height: number) {
    return { left, top, width, height } as OFDRect;
}

export function parseRect(rectStr: string) {
    const nums = rectStr.split(" ").map(s => parseInt(s));
    return rect(nums[0], nums[1], nums[2], nums[3]);
}

export function parseCTM(ctmStr: string) {
    return ctmStr.split(" ").map(s => parseInt(s));
}
