let last = 0;

export function uuid(): string {
    const timestamp = Date.now();
    if (timestamp <= last) {
        last = timestamp + 1;
    } else {
        last = timestamp;
    }
    return String(last);
}
