#!/usr/bin/env node

/**
 * Module dependencies.
 */
import * as program from "commander";
import * as spawn from "cross-spawn";
import { setupUnibeautify } from "./index";
const pkg = require("../package.json");

program
  .version(pkg.version)
  .usage("[options] [files...]")
  .option("-l, --language <language>", "Language of file to beautify")
  // .option("-i, --input-file [file]", "Input file to be beautified")
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
interface IArgs extends commander.ICommand {
  args: string[];
  language?: string;
  outFile?: string;
  replace?: boolean;
  configFile?: string;
  configJson?: string;
}

const programArgs: IArgs = program.parse(process.argv);

const {
  args: files,
  language,
  outFile,
  replace,
  configFile,
  configJson
} = programArgs;

setupUnibeautify()
.then((unibeautify) => {

  if (!language) {
    process.stderr.write("A language is required.");
    return process.exit(1);
  }

  let config = {};
  if (configJson) {
    try {
      config = JSON.parse(configJson);
    } catch (e) {
      process.stderr.write(e.message);
      return process.exit(1);
    }
  }
  /**
  Process stdin or provided files.
  */
  if (files.length === 0) {
    // Process stdin
    // console.log("No files provided");
    process.stdin.resume();
    process.stdin.on("data", (data: string) => {
      // process.stdout.write(`${new Date()}: ${data}`)
      unibeautify.beautify({
        languageName: language,
        options: config,
        text: data.toString(),
      }).then((result: string) => {
        process.stdout.write(result);
      });
    });
    process.stdout.on("error", (err: any) => {
      if (err.code === "EPIPE") {
        return process.exit(1);
      }
      process.emit("error", err);
    });
  } else {
    // Process files
    // console.log("Files", files);
    process.stderr.write("Beautify files is not yet supported.");
    return process.exit(1);
  }

});

