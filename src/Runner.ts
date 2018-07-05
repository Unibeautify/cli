import * as program from "commander";

import { setupUnibeautify } from "./index";
import { BeautifyData } from "unibeautify";

export class Runner {
  constructor(private programArgs: IArgs) {}

  public run() {
    const {
      // args: files,
      language,
      // outFile,
      // replace,
      // configFile,
      configJson,
      filePath,
    } = this.programArgs;
    return setupUnibeautify().then(unibeautify => {
      if (!language) {
        this.writeError("A language is required.");
        return this.exit(1);
      }
      const config = this.parseConfig(configJson);
      if (this.isTerminal) {
        this.writeError("Beautify files is not yet supported.");
        return this.exit(1);
      } else {
        return this.readFromStdin().then(text => {
          const data: BeautifyData = {
            filePath: filePath,
            languageName: language,
            options: config as any,
            text,
          };
          return unibeautify
            .beautify(data)
            .then((result: string) => {
              this.writeOut(result);
              return this.exit(0);
            })
            .catch((error: Error) => {
              this.writeError(error.message);
              return this.exit(1);
            });
        });
      }
    });
  }

  private parseConfig(configJson?: string): object {
    let config = {};
    if (configJson) {
      try {
        config = JSON.parse(configJson);
      } catch (e) {
        this.writeError(e.message);
        this.exit(1);
      }
    }
    return config;
  }

  protected get isTerminal(): boolean {
    return Boolean(process.stdin.isTTY);
  }

  protected readFromStdin(): Promise<string> {
    return new Promise((resolve, reject) => {
      let text = "";
      process.stdin.resume();
      process.stdin.on("data", (data: string) => {
        text = data.toString();
      });
      process.stdin.on("end", () => {
        return resolve(text);
      });
      process.stdout.on("error", (err: any) => {
        if (err.code === "EPIPE") {
          return this.exit(1);
        }
        process.emit("warning", err);
      });
    });
  }

  protected writeOut(text: string): void {
    process.stdout.write(text);
  }

  protected writeError(text: string): void {
    process.stderr.write(text);
  }

  protected exit(exitCode: number): void {
    process.exit(exitCode);
  }
}

/**
  Arguments parsed for program.
  */
export interface IArgs extends program.Command {
  args: string[];
  language?: string;
  outFile?: string;
  replace?: boolean;
  configFile?: string;
  configJson?: string;
  filePath?: string;
}
