
import { Writable } from "stream";

export function createMockWritableStream(): MockStream {
    const ws: Writable & { rawData: string } = new Writable() as any;
    ws.rawData = "";
    ws._write = function (chunk: string, enc: string, next: Function) {
        ws.rawData += chunk;
        next();
    };
    return ws as any;
}

export interface MockStream extends NodeJS.WriteStream {
    rawData: string;
}
