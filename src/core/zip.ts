import JSZip from "jszip";
import { load } from "./load";

export interface ZipEntry {
    filename: string;
}

export class Zip {
    private url: string;

    private zip: JSZip | null;

    constructor({ url }: { url: string }) {
        this.url = url;
        this.zip = null;
    }

    private async ensureDataLoaded() {
        if (!this.zip) {
            const zip = new JSZip();
            const data = await load(this.url);
            this.zip = await zip.loadAsync(data, {
                checkCRC32: false
            });
        }
    }

    public async entries() {
        await this.ensureDataLoaded();
        const zip = this.zip!;
        return Object.keys(zip.files).map(filename => {
            const ent = zip.files[filename];
            return {
                filename: ent.name
            } as ZipEntry;
        });
    }

    public async load(filename: string): Promise<Uint8Array> {
        await this.ensureDataLoaded();
        const zip = this.zip!;
        const entry = zip.file(filename);
        if (entry) {
            return entry.async("uint8array");
        }
        throw new Error(`${filename} not found`);
    }

    private async loadAsString(filename: string): Promise<string> {
        await this.ensureDataLoaded();
        const data = await this.load(filename);
        const decoder = new TextDecoder();
        return decoder.decode(data);
    }

    public async loadAsDOM(filename: string): Promise<Document> {
        await this.ensureDataLoaded();
        const content = await this.loadAsString(filename);
        const parser = new DOMParser();
        return parser.parseFromString(content, "text/xml");
    }
}
