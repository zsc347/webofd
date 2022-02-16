import { RefObject, useCallback, useEffect, useRef, useState } from "react";
import {
    FolderNode,
    containsFiles,
    parseDropEvent
} from "../helper/uploadHelper";

export type UploadObjectHandler = (obj: FolderNode[]) => void;

export default function useFileDrop<T extends HTMLElement = HTMLElement>(
    active: boolean,
    dropRef: RefObject<T>,
    handler: UploadObjectHandler
) {
    const [dragging, setDragging] = useState<boolean>(false);
    const counterRef = useRef<number>(0);

    const handleDragEnter = (e: DragEvent) => {
        console.log(`drag enter ...`);
        e.preventDefault();
        e.stopPropagation();
        if (counterRef.current === 0) {
            if (containsFiles(e)) {
                setDragging(true);
            }
        }
        counterRef.current++;
    };

    const handleDragLeave = (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        counterRef.current--;
        if (counterRef.current === 0) {
            setDragging(false);
        }
    };

    const handleDragOver = (e: DragEvent) => {
        e.stopPropagation();
        e.preventDefault();
    };

    const handleDrop = useCallback(
        (e: DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setDragging(false);
            counterRef.current = 0;
            if (!containsFiles(e)) {
                return;
            }
            parseDropEvent(e).then(output => {
                handler(output);
            });
        },
        [handler]
    );

    useEffect(() => {
        const node = dropRef.current;
        console.log(`runing file drop effect`, active, node);
        if (active && node) {
            console.log(`drag event`);
            node.addEventListener("dragenter", handleDragEnter);
            node.addEventListener("dragleave", handleDragLeave);
            node.addEventListener("dragover", handleDragOver);
            node.addEventListener("drop", handleDrop);

            return () => {
                node.removeEventListener("dragenter", handleDragEnter);
                node.removeEventListener("dragleave", handleDragLeave);
                node.removeEventListener("dragover", handleDragOver);
                node.removeEventListener("drop", handleDrop);
            };
        }
    }, [active, dropRef, handleDrop]);

    return { dragging };
}
