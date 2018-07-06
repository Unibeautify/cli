#!/usr/bin/env node

/**
 * Module dependencies.
 */
import * as program from "yargs";

import { Runner } from "./Runner";

program
  .version()
  .command({
    builder: {
      "config-file": {
        alias: "c",
        demandOption: false,
        describe: "Beautifier configuration file",
        type: "string",
      },
      "config-json": {
        demandOption: false,
        describe: "Beautifier configuration as stringified JSON",
        type: "string",
      },
      "file-path": {
        alias: "f",
        demandOption: false,
        describe: "Path of the file to beautify from stdin",
        type: "string",
      },
      language: {
        alias: "l",
        demandOption: true,
        describe: "Language of file to beautify",
        type: "string",
      },
      "out-file": {
        alias: "o",
        demandOption: false,
        describe: "Output file of beautified results",
        type: "string",
      },
      replace: {
        alias: "r",
        default: false,
        demandOption: false,
        describe: "Replace file(s) with beautified results",
        type: "boolean",
      },
    },
    command: "*",
    describe: "Beautify Files",
    handler: (argv) => {
      const main = new Runner();
      main.beautify(argv);
    }
  })
  .command({
    aliases: ["list", "ls"],
    builder: {
      all: {
        alias: "a",
        default: false,
        demandOption: false,
        describe: "List all languages supported",
      },
      beautifiers: {
        alias: "b",
        default: false,
        demandOption: false,
        describe: "List installed beautifiers",
      },
      json: {
        alias: "j",
        default: false,
        demandOption: false,
        describe: "List as JSON array",
      },
      languages: {
        alias: "l",
        default: false,
        demandOption: false,
        describe: "List supported languages based on installed beautifiers",
      },
    },
    command: "support",
    describe: "List languages and beautifiers",
    handler: (argv) => {
      const main = new Runner();
      main.support(argv);
    }
  })
  .help()
  .argv;


  // .option("-i, --input-file [file]", "Input file to be beautified")
  // .option("-b, --beautifiers [beautifier...]", "Installed Beautifiers to load")
  // .option("--input-dir [directory]", "Input directory of files to be beautified")
  // .option("--output-dir [directory]", "Output directory of beautified results")

// const programArgs: IArgs = program.parse(process.argv);
// const main = new Runner();
// main.beautify(programArgs);
