# Unibeautify-CLI

> CLI for Unibeautify

## Installation

```bash
npm install --global unibeautify-cli
```

## Usage

The global package will install a need command: `unibeautify`.

### Help

```bash
unibeautify --help
```

### Example

Install a Beautifier:

```
npm install --global beautifier-prettydiff
```

Then beautify using a language that Beautifier supports:

```bash
echo "function(n){return n+1;}" | unibeautify --language JavaScript --config-json '{"JavaScript":{"insize":2,"inchar":" "}}'
```
