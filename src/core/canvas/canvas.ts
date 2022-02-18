export function currentTransform(ctx: CanvasRenderingContext2D) {
    const tf = ctx.getTransform();
    const { a, b, c, d, e, f } = tf;
    return [a, b, c, d, e, f];
}

export function currentTransformInverse(ctx: CanvasRenderingContext2D) {
    // Calculation done using WolframAlpha:
    // http://www.wolframalpha.com/input/?i=Inverse+{{a%2C+c%2C+e}%2C+{b%2C+d%2C+f}%2C+{0%2C+0%2C+1}}

    const m = currentTransform(ctx);
    const [a, b, c, d, e, f] = m;
    const ad_bc = a * d - b * c;
    const bc_ad = b * c - a * d;
    return [
        d / ad_bc,
        b / bc_ad,
        c / bc_ad,
        a / ad_bc,
        (d * e - c * f) / bc_ad,
        (b * e - a * f) / ad_bc
    ];
}
