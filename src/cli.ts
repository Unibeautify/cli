#!/usr/bin/env node

/**
 * Module dependencies.
 */
import * as program from "commander";

const pkg = require("../package.json");
import { Runner, IArgs } from "./Runner";

program
  .version(pkg.version)
  .command("beautify", "Beautify files", { isDefault: true })
  .usage("[options] [files...]")
  .option("-l, --language <language>", "Language of file to beautify")
  // .option("-i, --input-file [file]", "Input file to be beautified")
  .option(
    "-f, --file-path <file path>",
    "Path of the file to beautify from stdin"
  )
  .option("-o, --out-file <file>", "Output file of beautified results")
  .option("-r, --replace", "Replace file(s) with beautified results", false)
  .option("-c, --config-file <file>", "Beautifier configuration file")
  .option(
    "--config-json <JSON>",
    "Beautifier configuration as stringified JSON"
  );
// .option("-b, --beautifiers [beautifier...]", "Installed Beautifiers to load")
// .option("--input-dir [directory]", "Input directory of files to be beautified")
// .option("--output-dir [directory]", "Output directory of beautified results")

program
  .command("support", "List supported languages and/or beautifiers installed")
  .alias("list")
  .alias("ls")
  .option("-a, --languages", "List available languages")
  //   .option("-b, --beautifiers", "List beautifiers installed")
  .option("-j, --json", "List as JSON array.")
  .action((items, cmd) => {
    const main = new Runner();
    return main.support(cmd);
  });

const programArgs: IArgs = program.parse(process.argv);
const main = new Runner();
main.beautify(programArgs);
