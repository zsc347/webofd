import { uuid } from "./uuid";

export interface FolderNode {
    name: string;
    children: FolderNode[];
    fkey: string;
    file?: File;
}

export function containsFiles(event: DragEvent) {
    if (event.dataTransfer?.types) {
        for (let i = 0; i < event.dataTransfer.types.length; i++) {
            if (event.dataTransfer.types[i] === "Files") {
                return true;
            }
        }
    }
    return false;
}

export async function parseDropEvent(evt: DragEvent): Promise<FolderNode[]> {
    return parseDropEventChrome(evt);
}

async function parseDropEventChrome(evt: DragEvent): Promise<FolderNode[]> {
    if (!evt.dataTransfer?.items) {
        return [];
    }
    const root = { fkey: "pseudo", name: "pseudo", children: [] } as FolderNode;
    const attempts: Promise<unknown>[] = [];
    for (let i = 0; i < evt.dataTransfer.items.length; i++) {
        const entry = evt.dataTransfer.items[i].webkitGetAsEntry();
        if (entry) {
            attempts.push(parseEntry("", entry, root));
        }
    }
    await Promise.all(attempts);
    return root.children;
}

async function parseEntry(
    path: string,
    entry: FileSystemEntry,
    parent: FolderNode
) {
    const cname = path + "/" + entry.name;
    if (entry.isFile) {
        const ent = entry as FileSystemFileEntry;
        return new Promise<void>((resolve, reject) => {
            ent.file(
                file => {
                    parent.children.push({
                        name: file.name,
                        file,
                        fkey: uuid()
                    } as FolderNode);
                    resolve();
                },
                err => {
                    reject(err);
                }
            );
        });
    }

    if (entry.isDirectory) {
        const dir = entry as FileSystemDirectoryEntry;
        const dirReader = dir.createReader();
        const cur = {
            name: entry.name,
            children: [],
            fkey: uuid()
        } as FolderNode;
        parent.children.push(cur);

        return new Promise((resolve, reject) => {
            const attempts: Promise<unknown>[] = [];
            (function iterRead() {
                dirReader.readEntries(
                    ents => {
                        if (!ents.length) {
                            resolve(Promise.all(attempts));
                        } else {
                            for (let i = 0, l = ents.length; i < l; i++) {
                                attempts.push(parseEntry(cname, ents[i], cur));
                            }
                            iterRead();
                        }
                    },
                    err => {
                        reject(err);
                    }
                );
            })();
        });
    }
}

export function extractFiles(root: FolderNode) {
    const fmap = new Map<string, File>();
    const dfs = (cur: FolderNode) => {
        if (cur.file) {
            fmap.set(cur.fkey, cur.file);
        } else {
            cur.children.forEach(child => dfs(child));
        }
    };
    dfs(root);
    return fmap;
}

export function extractParent(root: FolderNode) {
    const parentMap = new Map<string, string>();
    const dfs = (cur: FolderNode, parent: string | null) => {
        if (cur.file) {
            parent && parentMap.set(cur.fkey, parent);
        } else {
            cur.children.forEach(child => dfs(child, cur.fkey));
        }
    };
    dfs(root, null);
    return parentMap;
}
