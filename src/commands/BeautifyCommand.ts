import { BeautifyData } from "unibeautify";
import * as cosmiconfig from "cosmiconfig";
import * as fs from "fs";

import { setupUnibeautify } from "../utils";
import { BaseCommand } from "./BaseCommand";

export class BeautifyCommand extends BaseCommand {
  protected stdin: NodeJS.ReadStream = process.stdin;

  public beautify(programArgs: IArgs): Promise<string> {
    const { language, filePath } = programArgs;
    return setupUnibeautify().then(unibeautify => {
      if (!language) {
        const error = new Error("A language is required.");
        this.writeError(error.message);
        this.exitCode = 1;
        return Promise.reject(error);
      }
      return Promise.all([
        this.readConfig(programArgs),
        this.readText(filePath),
      ]).then(([config, text]) => {
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
            return result;
          })
          .catch((error: Error) => {
            this.writeError(error.message);
            this.exitCode = 1;
            return Promise.reject(error);
          });
      });
    });
  }

  private readConfig(programArgs: IArgs): Promise<any> {
    const { configFile, configJson } = programArgs;
    if (configJson) {
      return this.parseConfig(configJson);
    } else {
      return this.configFile(configFile);
    }
  }

  private readText(filePath?: string): Promise<string> {
    // if (this.isTerminal && filePath) {
    if (filePath) {
      return this.readFile(filePath);
    } else {
      return this.readFromStdin();
    }
  }

  private parseConfig(configJson: string): Promise<object> {
    try {
      return Promise.resolve(JSON.parse(configJson));
    } catch (error) {
      this.writeError(error.message);
      this.exitCode = 2;
      return Promise.reject(error);
    }
  }

  private configFile(configFile?: string, filePath?: string) {
    const configExplorer = cosmiconfig("unibeautify", {});
    const loadConfigPromise = configFile
      ? configExplorer.load(configFile)
      : configExplorer.search(filePath);
    return loadConfigPromise
      .then(result => (result ? result.config : null))
      .catch(error =>
        Promise.reject(
          new Error(`Could not load configuration file ${configFile}`)
        )
      );
  }

  protected get isTerminal(): boolean {
    return Boolean(this.stdin.isTTY);
  }

  protected readFromStdin(): Promise<string> {
    return new Promise((resolve, reject) => {
      let text = "";
      this.stdin.on("data", (data: string) => {
        text = data.toString();
      });
      this.stdin.on("end", () => {
        return resolve(text);
      });
      this.stdin.on("error", (err: any) => {
        if (err.code === "EPIPE") {
          this.exitCode = 1;
          return reject(err);
        }
        process.emit("warning", err);
      });
      this.stdin.resume();
    });
  }

  private readFile(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, (error, data) => {
        if (error) {
          return reject(error);
        }
        return resolve(data.toString());
      });
    });
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
