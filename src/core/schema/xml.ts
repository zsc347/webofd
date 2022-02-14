function importRootNode(xml?: Document): Element | null {
    if (xml) {
        const doc = globalThis.document;
        try {
            return doc.importNode(xml.documentElement, true);
        } catch (err: unknown) {
            console.warn("failed to import node", xml);
        }
    }
    return null;
}

export { importRootNode };
