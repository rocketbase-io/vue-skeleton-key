/* eslint-disable no-console */
import { compile, ssrCompile } from "vue-template-compiler";
import { transformAsync } from "@babel/core";
import { promises as fs, existsSync } from "fs";
import { resolve, dirname } from "path";
import babelPluginVueTransformWith from "./babel-plugin-vue-transform-with";

export default ({ pattern = /\.vue\.html/g, ssr = false, showTips = true, showErrors = true, debug = false } = {}) => {
  const matcher = typeof pattern === "string" ? new RegExp(pattern, "g") : pattern;
  const paths = {};

  function resolveId(id, context) {
    if (!matcher.test(id)) return null;
    if (debug) console.log("RESOLVING", id);
    const resolved = resolve(dirname(context), id);
    id = paths[id] = existsSync(resolved) ? resolved : resolve(process.cwd(), id);
    return { id };
  }

  async function load(id) {
    id = id.replace("!!vue!!", "");
    if (!matcher.test(id)) return null;
    if (debug) console.log("LOADING", id);
    const template = await fs.readFile(paths[id] || id);
    return transform(template.toString("utf8"), id);
  }

  async function transform(template, id) {
    if (!matcher.test(id)) return null;
    if (debug) console.log("TRANSPILING", id);
    const { errors, render, tips } = ssr ? ssrCompile(template) : compile(template);
    if (showTips || debug) tips.forEach(console.warn);
    if (showErrors || debug) errors.forEach(console.error);
    if (errors.length || !render) throw new Error("Invalid Vue Template");
    const { code } = await transformAsync(`export default function render() {${render}}`, {
      plugins: [babelPluginVueTransformWith],
      parserOpts: { strictMode: false },
      compact: true,
      comments: false
    });
    if (!code) throw new Error("Invalid Vue Template");
    if (debug) console.log("TRANSPILED", id);
    return { code, map: { mappings: "" } };
  }

  return { name: "vue-compile-html", resolveId, load, transform };
};
