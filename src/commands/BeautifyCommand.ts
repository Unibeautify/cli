import { BeautifyData, Unibeautify } from "unibeautify";
import cosmiconfig from "cosmiconfig";
import * as fs from "fs";

import { setupUnibeautify, getAllLanguages } from "../utils";
import { BaseCommand } from "./BaseCommand";

export class BeautifyCommand extends BaseCommand {
  protected stdin: NodeJS.ReadStream = process.stdin;

  public beautify(programArgs: IArgs): Promise<string> {
    const { language, filePath } = programArgs;
    return setupUnibeautify().then(unibeautify => {
      return this.validateLanguage(language, unibeautify).then(() => {
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
              return this.writeToFileOrStdout({ result, programArgs }).then(
                () => result
              );
            })
            .catch((error: Error) => {
              return this.handleError(error, 1);
            });
        });
      });
    });
  }

  private readConfig(programArgs: IArgs): Promise<any> {
    const { configFile, configJson, filePath } = programArgs;
    if (configJson) {
      return this.parseConfig(configJson);
    } else {
      return this.configFile({ configFile, filePath });
    }
  }

  private readText(filePath?: string): Promise<string> {
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
      return this.handleError(error, 2);
    }
  }

  private configFile({
    configFile,
    filePath,
  }: {
    configFile?: string;
    filePath?: string;
  }) {
    const configExplorer = cosmiconfig("unibeautify", { stopDir: filePath });
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

  protected readFromStdin(): Promise<string> {
    return new Promise((resolve, reject) => {
      let text = "";
      if (this.stdin.isTTY) {
        resolve(text);
        return;
      }
      this.stdin.on("data", (data: string) => {
        text = data.toString();
      });
      this.stdin.on("end", () => {
        resolve(text);
      });
      this.stdin.on("error", (err: any) => {
        if (err.code === "EPIPE") {
          return this.handleError(err, 1);
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

  private writeToFileOrStdout({
    result,
    programArgs,
  }: {
    result: string;
    programArgs: IArgs;
  }) {
    const { inplace, filePath } = programArgs;
    if (inplace && filePath) {
      return this.writeFile(result, filePath);
    } else {
      return Promise.resolve(this.writeOut(result));
    }
  }

  private writeFile(text: string, filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      fs.writeFile(filePath, text, error => {
        if (error) {
          return reject(error);
        }
        return resolve();
      });
    });
  }

  private validateLanguage(language: string | undefined, unibeautify: Unibeautify) {
    if (!language) {
      const error = new Error("A language is required.");
      return this.handleError(error, 1);
    }
    const langs = unibeautify.findLanguages({name: language});
    if (langs.length === 0) {
      const bestMatchLanguage = getAllLanguages().find(lang => {
        return lang.toLowerCase() === language.toLowerCase();
      });
      if (bestMatchLanguage) {
        const error = new Error(`Language '${language}' was not found. Did you mean '${bestMatchLanguage}'?`);
        return this.handleError(error, 1);
      }
    }
    return Promise.resolve({});
  }
}

/**
  Arguments parsed for program.
  */
export interface IArgs {
  args: string[];
  language?: string;
  outFile?: string;
  inplace?: boolean;
  configFile?: string;
  configJson?: string;
  filePath?: string;
}
