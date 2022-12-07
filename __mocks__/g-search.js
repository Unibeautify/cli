const path = require("path");
const pkg = require(path.resolve(__dirname, "../package.json"));
const { devDependencies } = pkg;

const globalModules = fakeGlobalModules();

module.exports = function () {
  return Promise.resolve(globalModules);
};

function fakeGlobalModules() {
  return Object.keys(devDependencies).map(getModuleDetails).filter(Boolean);
}

function getModuleDetails(moduleName) {
  try {
    const pkgPath = require.resolve(moduleName);
    const pkg = require(`${moduleName}/package.json`);
    return { name: pkg.name, version: pkg.version, location: pkgPath };
  } catch (error) {
    return null;
  }
}
