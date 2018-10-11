# Unibeautify-CLI

[![Build Status](https://travis-ci.com/Unibeautify/unibeautify-cli.svg?branch=master)](https://travis-ci.com/Unibeautify/unibeautify-cli) [![Build status](https://ci.appveyor.com/api/projects/status/au135a4m4x4omfpa/branch/master?svg=true)](https://ci.appveyor.com/project/Glavin001/unibeautify-cli/branch/master) [![Maintainability](https://api.codeclimate.com/v1/badges/8547ff73a2419bbabf92/maintainability)](https://codeclimate.com/github/Unibeautify/unibeautify-cli/maintainability) [![Test Coverage](https://api.codeclimate.com/v1/badges/8547ff73a2419bbabf92/test_coverage)](https://codeclimate.com/github/Unibeautify/unibeautify-cli/test_coverage)

> CLI for [Unibeautify](https://github.com/Unibeautify/unibeautify)

## Installation

```bash
$ npm install --global @unibeautify/cli
```

## Usage

The package will be globally accessible as a new command-line interface (CLI) application called [`unibeautify`](https://github.com/Unibeautify/unibeautify).

### Help

**Note**: Not all options are currently supported.

```bash
$ unibeautify --help

unibeautify

Beautify Files

Commands:
  unibeautify          Beautify Files                                  [default]
  unibeautify support  List languages and beautifiers        [aliases: list, ls]

Options:
  --version          Show version number                               [boolean]
  --help             Show help                                         [boolean]
  --config-file, -c  Beautifier configuration file                      [string]
  --config-json      Beautifier configuration as stringified JSON       [string]
  --file-path, -f    Path of the file to beautify from stdin            [string]
  --language, -l     Language of file to beautify            [string] [required]
  --out-file, -o     Output file of beautified results                  [string]
  --replace, -r      Replace file(s) with beautified results [boolean] [default: false]

```
```bash
$ unibeautify list --help

unibeautify support

List languages and beautifiers

Options:
  --version          Show version number                               [boolean]
  --help             Show help                                         [boolean]
  --all, -a          List all languages supported               [default: false]
  --beautifiers, -b  List installed beautifiers                 [default: false]
  --json, -j         List as JSON array                         [default: false]
  --languages, -l    List supported languages based on installed beautifiers [default: false]
```

### Example

Install [`unibeautify`](https://github.com/Unibeautify/unibeautify) and a Beautifier, such as [`beautifier-prettydiff`](https://github.com/Unibeautify/beautifier-prettydiff):

```
$ npm install --global unibeautify @unibeautify/beautifier-prettydiff
```

Then beautify using a language that Beautifier supports:

```bash
$ unibeautify --language JavaScript --config-json '{"JavaScript": {"beautifiers": ["ESLint"],"quotes": "double"}}' <<< "const test = 'test';"
```

This returns the following formatted result:

```javascript
const test = "test";
```
