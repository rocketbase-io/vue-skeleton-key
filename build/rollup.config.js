import sourcemaps from "rollup-plugin-sourcemaps";
import commonjs from "rollup-plugin-commonjs";
import ts from "@wessberg/rollup-plugin-ts";
import paths from "rollup-plugin-ts-paths";
import apiExtractor from "@rocketbase/rollup-plugin-api-extractor";
import execute from "@rocketbase/rollup-plugin-exec";
import sequential from "@rocketbase/rollup-plugin-sequential";
import vueTemplates from "./rollup-plugin-vue-template";
import nodeResolve from "rollup-plugin-node-resolve";
import { name, globals, external } from "./package";
import banner from "./banner";

export default {
  input: "src/main.ts",
  output: ["umd", "iife", "esm", "cjs"].map(format => ({
    file: `dist/${name}${format === "umd" ? "" : `.${format}`}.js`,
    exports: "named",
    sourceMap: true,
    format,
    globals,
    name,
    banner
  })),
  external,
  plugins: [
    vueTemplates(),
    sourcemaps(),
    paths(),
    commonjs(),
    nodeResolve(),
    ts({ tsconfig: "tsconfig.build.json", exclude: ["**/*.html"] }),
    sequential(
      [
        apiExtractor({
          config: "build/api-extractor.json",
          override: { name },
          cleanup: false
        }),
        execute(
          [
            "api-documenter markdown --output-folder docs --input-folder dist",
            "rimraf temp api-extractor.json dist/*.*.d.ts",
            "cp build/www/basic-theme.css dist/VueSkeletonKey.css",
            "cp build/www/basic-theme.styl dist/VueSkeletonKey.styl"
          ],
          {
            stdio: "ignore"
          }
        )
      ],
      { once: true }
    )
  ]
};
