import * as program from "commander";
import chalk from "chalk";

import { getSupportedLanguages, setupUnibeautify } from "./index";
import { BeautifyData } from "unibeautify";

export class Runner {
  public beautify(programArgs: IArgs): Promise<void> {
    const {
      // args: files,
      language,
      // outFile,
      // replace,
      // configFile,
      configJson,
      filePath,
    } = programArgs;
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

  public support(options: { json?: boolean; languages?: boolean }): void {
    const printer: (info: SupportInfo) => void = options.json
      ? this.jsonPrinter
      : this.listPrinter;
    const info: SupportInfo = {};
    if (options.languages) {
      info["languages"] = getSupportedLanguages();
    }
    // if (cmd.beautifiers) {
    //   console.log("Coming soon!");
    //   info["beautifiers"] = [];
    // }
    if (Object.keys(info).length === 0) {
      // tslint:disable-next-line:no-console
      this.writeError("Required option --languages is missing.");
      this.exit(1);
    } else {
      printer(info);
      this.exit(0);
    }
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

  private jsonPrinter = (info: SupportInfo) => {
    this.writeOut(JSON.stringify(info, null, 2));
  }

  private listPrinter = (info: SupportInfo) => {
    Object.keys(info).forEach(section => {
      this.writeOut(chalk.blue(`Supported ${section}\n`));
      const items = info[section];
      items.forEach((item, index) => this.writeOut(`${index + 1}. ${item}\n`));
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

interface SupportInfo {
  [section: string]: string[];
}
