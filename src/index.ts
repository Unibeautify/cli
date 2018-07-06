import unibeautify, { Unibeautify } from "unibeautify";
const requireg = require("requireg");
import { spawn } from "child_process";

/**
Find all globally installed beautifiers.
*/
export function findInstalledBeautifiers(): Promise<string[]> {
  return new Promise((resolve, reject) => {
    runSpawn("npm", ["ls", "-g", "--depth=0", "--json"]).then(
      globalPackages => {
        const packageJSON = JSON.parse(globalPackages).dependencies;
        const packageNames = Object.keys(packageJSON);
        const beautifierNames = packageNames.filter((name: string) => {
          return /beautifier-.*/.test(name);
        });
        return resolve(beautifierNames);
      }
    );
  });
}

function runSpawn(exe: string, args: string[]): Promise<any> {
  return new Promise((resolve, reject) => {
    const ls = spawn(exe, args);
    let stdout = "";
    ls.stdout.on("data", data => {
      return (stdout += data);
    });
    // ls.stderr.on("data", (data) => {
    //   console.log(`stderr: ${data}`);
    // });
    ls.on("close", code => {
      return resolve(stdout);
    });
    ls.on("error", err => {
      // tslint:disable-next-line:no-console
      console.error(err);
    });
  });
}

export function loadBeautifiers(beautifierNames: string[]): Unibeautify {
  const beautifiers = beautifierNames.map(beautifierName => {
    return requireg(beautifierName).default;
  });
  return unibeautify.loadBeautifiers(beautifiers);
}

export function loadInstalledBeautifiers(): Promise<Unibeautify> {
  return findInstalledBeautifiers().then((beautifierNames: string[]) => {
    return loadBeautifiers(beautifierNames);
  });
}

export function setupUnibeautify(): Promise<Unibeautify> {
  return loadInstalledBeautifiers();
}

export function getSupportedLanguages(): string[] {
  return unibeautify.supportedLanguages.map(language => {
    return language.name;
  });
}

export function getAllLanguages(): string[] {
  return unibeautify.getLoadedLanguages().map(language => {
    return language.name;
  });
}
