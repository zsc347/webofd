export async function load(url: string): Promise<Uint8Array> {
    const rsp = await fetch(url);
    const data = await rsp.arrayBuffer();
    return new Uint8Array(data);
}
