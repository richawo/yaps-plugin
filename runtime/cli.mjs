#!/usr/bin/env node
// Keep the package bin explicit and dispatch setup separately from tool calls.
const argv = process.argv.slice(2);
if (argv[0] === "install-linux") {
  const { main } = await import("./install-linux.mjs");
  await main(argv.slice(1));
} else {
  const { main } = await import("./run.mjs");
  await main(argv);
}
