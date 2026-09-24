#!/usr/bin/env node
// npm links a package bin through a symlink, so run.mjs's own entry-point
// check would not match. This file is the bin; it only forwards arguments.
import { main } from "./run.mjs";

await main(process.argv.slice(2));
