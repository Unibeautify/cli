import { Writable, Readable } from "stream";

export function createMockWritableStream(): MockWritableStream {
  const ws: Writable & { rawData: string } = new Writable() as any;
  ws.rawData = "";
  ws._write = function(chunk: string, enc: string, next: Function) {
    ws.rawData += chunk;
    next();
  };
  return ws as any;
}

export interface MockWritableStream extends NodeJS.WriteStream {
  rawData: string;
}

export function createMockReadableStream(
  rawData: string,
  isTTY: boolean = false
): NodeJS.ReadStream {
  const rs: any = new Readable();
  rs.isTTY = isTTY;
  rs._read = function() {
    rs.emit("data", rawData);
    rs.emit("end");
  };
  return rs;
}
