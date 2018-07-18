import chalk from "chalk";

import {
  getSupportedLanguages,
  findInstalledBeautifiers,
  setupUnibeautify,
  getAllLanguages,
} from "./index";
import { BeautifyData } from "unibeautify";
import * as cosmiconfig from "cosmiconfig";

export class Runner {
  // tslint:disable
  public beautify(programArgs: IArgs): Promise<void> {
    const {
      // args: files,
      language,
      // outFile,
      // replace,
      configFile,
      configJson,
      filePath,
    } = programArgs;
    return setupUnibeautify().then(async unibeautify => {
      if (!language) {
        this.writeError("A language is required.");
        return this.exit(1);
      }
      let config: any;
      if (configJson) {
        config = this.parseConfig(configJson);
      } else {
        config = await this.configFile(configFile);
      }
      if (this.isTerminal) {
        this.writeError("Beautify files is not yet supported.");
        return this.exit(1);
      } else {
        return this.readFromStdin().then(text => {
          const data: BeautifyData = {
            filePath: filePath,
            languageName: language,
            options: (config as any) || {},
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

  public support(options: {
    json?: boolean;
    languages?: boolean;
    beautifiers?: boolean;
    all?: boolean;
  }): Promise<void> {
    const printer: (info: SupportInfo) => void = options.json
      ? this.jsonPrinter
      : this.listPrinter;
    const info: SupportInfo = {};
    return setupUnibeautify().then(async unibeautify => {
      if (options.languages) {
        if (options.all) {
          info["languages"] = getAllLanguages();
        } else {
          info["languages"] = getSupportedLanguages();
        }
      }
      if (options.beautifiers) {
        const beautifiers = await findInstalledBeautifiers();
        info["beautifiers"] = beautifiers;
      }
      if (Object.keys(info).length === 0) {
        this.writeError("Nothing to show");
        this.exit(1);
      } else {
        printer(info);
        this.exit(0);
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

  private configFile(configFile?: string, filePath?: string) {
    const configExplorer = cosmiconfig("unibeautify", {});
    if (configFile) {
      return configExplorer
        .load(configFile)
        .then(result => (result ? result.config : null))
        .catch(error => {
          Promise.reject(error);
        });
    }
    return configExplorer
      .search(filePath)
      .then(result => (result ? result.config : null))
      .catch(error => {
        Promise.reject(error);
      });
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
    // unibeautify:ignore-next-line
  }

  private listPrinter = (info: SupportInfo) => {
    Object.keys(info).forEach(section => {
      this.writeOut(chalk.blue(`Supported ${section}`));
      const items = info[section];
      items.forEach((item, index) => this.writeOut(`${index + 1}. ${item}`));
    });
    // unibeautify:ignore-next-line
  }

  protected writeOut(text: string): void {
    process.stdout.write(text + "\n");
  }

  protected writeError(text: string): void {
    process.stderr.write(text + "\n");
  }

  protected exit(exitCode: number): void {
    process.exit(exitCode);
  }
}

/**
  Arguments parsed for program.
  */
export interface IArgs {
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
