import { promises as fs } from "fs";
import { template } from "lodash";
import { Extractor, ExtractorConfig } from "@microsoft/api-extractor";

const apiExtractor = async (config, override, { cleanup }) => {
  if (typeof override === "string") override = await fs.readFile(override)
    .then(it => it.toString("utf8"))
    .then(it => JSON.parse(it));
  if (typeof config === "string") config = await fs.readFile(config)
    .then(it => it.toString("utf8"))
    .then(it => typeof override === "object" ? template(it)({...override}) : it)
    .then(it => JSON.parse(it));
  config = typeof override === "function" ? await override(config) : config;

  await fs.writeFile("api-extractor.json", JSON.stringify(config, null, 2));
  const cfg = await ExtractorConfig.loadFileAndPrepare("api-extractor.json");
  if (cleanup) await fs.unlink("api-extractor.json");
  const result = Extractor.invoke(cfg, {
    localBuild: process.env.NODE_ENV !== "production",
    showVerboseMessages: process.env.NODE_ENV !== "production"
  });
  process.exitCode = result.succeeded ? 0 : 1;
};

export default ({ config = "config/api-extractor.json", override = "package.json", cleanup = true } = {}) => ({
  buildEnd: err => err ? null : apiExtractor(config, override, { cleanup })
});
