import unibeautify, {Unibeautify, Language, Beautifier, BeautifierBeautifyData } from 'unibeautify';
import * as path from 'path';
import requireg = require('requireg');
import findGlobalPackages = require('find-global-packages');

/**
Find all globally installed beautifiers.
*/
export function findInstalledBeautifiers(): Promise<string[]> {
  return new Promise((resolve, reject) => {
    findGlobalPackages((err, globalPackageDirs) => {
      if (err) {
        return reject(err);
      }
      const packageNames = globalPackageDirs.map((dir) => path.basename(dir));
      const beautifierNames = packageNames.filter((name: string) => {
        return /beautifier-.*/.test(name);
      });
      return resolve(beautifierNames);
    })
  });
}

export function loadBeautifiers(beautifierNames: string[]): Unibeautify {
  const beautifiers = beautifierNames.map((beautifierName) => {
    return requireg(beautifierName);
  });
  return unibeautify.loadBeautifiers(beautifiers);
}

export function loadInstalledBeautifiers(): Promise<Unibeautify> {
  return findInstalledBeautifiers()
  .then((beautifierNames: string[]) => {
    return loadBeautifiers(beautifierNames);
  });
}

export function setupUnibeautify(): Promise<Unibeautify> {
  return loadInstalledBeautifiers();
}
