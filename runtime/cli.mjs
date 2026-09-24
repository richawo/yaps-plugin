#!/usr/bin/env node
// npm links a package bin through a symlink, so run.mjs's own entry-point
// check would not match. This file is the bin; it only forwards arguments.
const argv = process.argv.slice(2);
if (argv[0] === "install-linux") {
  const { main } = await import("./install-linux.mjs");
  await main(argv.slice(1));
} else {
  const { main } = await import("./run.mjs");
  await main(argv);
}
