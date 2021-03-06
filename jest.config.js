const tsconfig = require("./tsconfig.json");
const { escapeRegExp, entries, fromPairs } = require("lodash");
const { paths } = tsconfig.compilerOptions;

const keyToRegexp = key => `^${escapeRegExp(key).replace("\\*", "(.*)")}$`;
const valueToPathMatcher = ([value]) => value.replace("*", "$1").replace("./", "<rootDir>/");
const entryMapper = ([key, value]) => [keyToRegexp(key), valueToPathMatcher(value)];
const moduleNameMapper = fromPairs(entries(paths).map(entryMapper));

module.exports = {
  preset: "@vue/cli-plugin-unit-jest/presets/typescript",
  collectCoverage: true,
  collectCoverageFrom: ["src/**/*.ts", "!**/node_modules/**", "!**.html", "!**/components/**"],
  coverageReporters: ["lcovonly"],
  moduleNameMapper: {
    ...moduleNameMapper
  },
  transform: {
    ".*\\.vue\\.html$": "<rootDir>/tests/util/dummy-template.js"
  }
};
