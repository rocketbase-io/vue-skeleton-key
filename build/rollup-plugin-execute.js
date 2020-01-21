import {spawn, spawnSync} from "child_process";

export default (commands, {
  sync = false,
  once = true,
  shell = true,
  stdio = "inherit",
  env = process.env
} = {}) => {
  if (typeof commands === "string") commands = [commands];
  if (!Array.isArray(commands)) throw new Error("commands should be a string or string array");
  commands = commands.slice();

  let ranBefore = false;

  function next() {
    const command = commands.shift();
    if (!command) { ranBefore = true; return; }
    if (sync) {
      if (spawnSync(command, { shell, stdio, env }).status === 0)
        next();
    } else {
      return new Promise((resolve, reject) => {
        spawn(command, { shell, stdio, env }).on('close', code => {
          if (code === 0)
            resolve(next());
          else
            reject(code);
        })
      });
    }
  }

  return {
    writeBundle: () => once && ranBefore ? undefined : (ranBefore = true, next())
  };
}
