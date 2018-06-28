#!/usr/bin/env node

/**
 * Module dependencies.
 */
import * as program from "commander";
import { setupUnibeautify } from "./index";
const pkg = require("../package.json");

program
  .version(pkg.version)
  .usage("[options] [files...]")
  .option("-l, --language <language>", "Language of file to beautify")
  // .option("-i, --input-file [file]", "Input file to be beautified")
  .option("-f, --file-path <file path>", "Path of the file to beautify from stdin")
  .option("-o, --out-file <file>", "Output file of beautified results")
  .option("-r, --replace", "Replace file(s) with beautified results", false)
  .option("-c, --config-file <file>", "Beautifier configuration file")
  .option("--config-json <JSON>", "Beautifier configuration as stringified JSON")
  // .option("-b, --beautifiers [beautifier...]", "Installed Beautifiers to load")
  // .option("--input-dir [directory]", "Input directory of files to be beautified")
  // .option("--output-dir [directory]", "Output directory of beautified results")
  ;

/**
Arguments parsed for program.
*/
interface IArgs extends program.Command {
  args: string[];
  language?: string;
  outFile?: string;
  replace?: boolean;
  configFile?: string;
  configJson?: string;
  filePath?: string;
}

const programArgs: IArgs = program.parse(process.argv);

const {
  args: files,
  language,
  outFile,
  replace,
  configFile,
  configJson,
  filePath
} = programArgs;

setupUnibeautify()
.then((unibeautify) => {

  if (!language) {
    console.error("A language is required.");
    return process.exit(1);
  }

  let config = {};
  if (configJson) {
    try {
      config = JSON.parse(configJson);
    } catch (e) {
      console.error("%s", e.message);
      return process.exit(1);
    }
  }

  if (process.stdin.isTTY) {
    console.error("Beautify files is not yet supported.");
    return process.exit(1);
  }
  else {
    let text = "";
    process.stdin.resume();
    process.stdin.on("data", (data: string) => {
        text = data.toString();
    });
    process.stdin.on("end", () => {
      console.log({filePath, language, config, text});
      unibeautify.beautify({
        filePath: filePath,
        languageName: language,
        options: config,
        text,
      }).then((result: string) => {
        process.stdout.write(result + "\n");
        return process.exit(0);
      }).catch((error: Error) => {
        process.stderr.write(error.message + "\n");
        return process.exit(1);
      });
    });
    process.stdout.on("error", (err: any) => {
      if (err.code === "EPIPE") {
        return process.exit(1);
      }
      process.emit("warning", err);
    });
  }

});

