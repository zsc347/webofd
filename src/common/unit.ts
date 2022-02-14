// Unit values relative to 1 inch
const mapping = {
    in: 1,
    cm: 2.54,
    mm: 25.4,
    pt: 72,
    pc: 12,
    px: 96
};

type UNIT = keyof typeof mapping;

function convert(value: number, oldUnit: UNIT, newUnit: UNIT) {
    return (value * mapping[newUnit]) / mapping[oldUnit];
}

export function mm2px(mm: number) {
    return convert(mm, "mm", "px");
}
