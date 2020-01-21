const allHooks = [
  { name: "augmentChunkHash", kind: ["sync", "sequential"], phase: "generate" },
  { name: "banner", kind: ["async", "parallel"], phase: "generate" },
  { name: "buildEnd", kind: ["async", "parallel"], phase: "build" },
  { name: "buildStart", kind: ["async", "parallel"], phase: "build" },
  { name: "footer", kind: ["async", "parallel"], phase: "generate" },
  { name: "generateBundle", kind: ["async", "sequential"], phase: "generate" },
  { name: "intro", kind: ["async", "parallel"], phase: "generate" },
  { name: "load", kind: ["async", "first"], phase: "build" },
  { name: "options", kind: ["sync", "sequential"], phase: "build" },
  { name: "outputOptions", kind: ["sync", "sequential"], phase: "generate" },
  { name: "outro", kind: ["async", "parallel"], phase: "generate" },
  { name: "renderChunk", kind: ["async", "sequential"], phase: "generate" },
  { name: "renderError", kind: ["async", "parallel"], phase: "generate" },
  { name: "renderStart", kind: ["async", "parallel"], phase: "generate" },
  { name: "resolveDynamicImport", kind: ["async", "first"], phase: "build" },
  { name: "resolveFileUrl", kind: ["sync", "first"], phase: "generate" },
  { name: "resolveId", kind: ["async", "first"], phase: "build" },
  { name: "resolveImportMeta", kind: ["sync", "first"], phase: "generate" },
  { name: "transform", kind: ["async", "sequential"], phase: "build" },
  { name: "watchChange", kind: ["sync", "sequential"], phase: "build" },
  { name: "writeBundle", kind: ["async", "parallel"], phase: "generate" }
];

export default function(plugins = [], { once = false } = {}) {
  let hooks = [];
  plugins.forEach(
    plugin => (hooks = [...new Set(hooks.concat(Object.keys(plugin)))])
  );
  hooks = hooks.filter(hook => allHooks.find(it => it.name === hook));
  const merged = {};
  const before = [];
  for (let hook of hooks)
    merged[hook] = (...params) => {
      if (before.find(it => it === hook) && once) return;
      before.push(hook);
      const relevant = plugins.filter(plugin => hook in plugin);
      const spec = allHooks.find(it => it.name === hook);
      let lastResult = undefined;
      function next() {
        const plugin = relevant.shift();
        if (!plugin) return lastResult;
        if (spec.kind.find(it => it === "async"))
          return Promise.resolve(
            (plugin[hook].call && plugin[hook].call(plugin, ...params)) ||
              plugin[hook]
          )
            .then(res => (lastResult = res))
            .then(next);
        else return (lastResult = plugin[hook]), next();
      }
      return next();
    };
  return merged;
}
