// / <reference path="../globals/node/index.d.ts" />
import * as child_process from "child_process";

declare module "cross-spawn" {
  /**
  Asynchronous cross-spawn.
  */
  export function spawn(command: string, args?: string[], options?: child_process.SpawnOptions): child_process.ChildProcess;
  /**
  Synchonous cross-spawn.
  */
  export function sync(command: string, args?: string[], options?: child_process.SpawnSyncOptions): child_process.SpawnSyncReturns<Buffer>;
}
