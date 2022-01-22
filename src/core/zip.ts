import JSZip from "jszip";
import { load } from "./load";


export interface ZipEntry {
    filename:string;
}

export class Zip {

    private url: string;

    private zip:JSZip|null;

    constructor({ url }: { url: string }) {
        this.url = url;
        this.zip = null;
    }

    private async ensureDataLoaded() {
        if (!this.zip) {
            const zip = new JSZip();
            const  data = await load(this.url);
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
                filename: ent.name,
            } as ZipEntry;
        })
    }
}
