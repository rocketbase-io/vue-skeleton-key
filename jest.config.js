const tsconfig = require("./tsconfig.json");
const { escapeRegExp } = require("lodash");
const { paths } = tsconfig.compilerOptions;

const keyToRegexp = key => `^${escapeRegExp(key).replace("\\*", "(.*)")}$`;
const valueToPathMatcher = ([value]) =>
  value.replace("*", "$1").replace("./", "<rootDir>/");
const entryMapper = ([key, value]) => [
  keyToRegexp(key),
  valueToPathMatcher(value)
];
const moduleNameMapper = Object.fromEntries(
  Object.entries(paths).map(entryMapper)
);

module.exports = {
  preset: "@vue/cli-plugin-unit-jest/presets/typescript",
  collectCoverage: true,
  collectCoverageFrom: ["src/**/*.ts", "!**/node_modules/**"],
  coverageReporters: ["lcovonly"],
  moduleNameMapper
};
