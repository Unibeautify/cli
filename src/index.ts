import unibeautify, { Unibeautify } from "unibeautify";
const requireg = require("requireg");
const gSearch = require("g-search");

/**
Find all globally installed beautifiers.
*/
export function findInstalledBeautifiers(): Promise<string[]> {
  return new Promise((resolve, reject) => {
    gSearch()
    .then((globalPackages: GlobalSearchResult[]) => {
      const packageNames = globalPackages.map(pkg => pkg.name);
      const beautifierNames = packageNames.filter(pkg => {
        return /beautifier-.*/.test(pkg);
      });
      return resolve(beautifierNames);
    })
    .catch((error: Error) => {
      return reject(error);
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

export interface GlobalSearchResult {
  name: string;
  version: string;
  location: string;
}
