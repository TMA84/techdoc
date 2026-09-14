import * as esbuild from "esbuild";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const outfile = path.join(here, "..", "custom_components", "techdoc", "panel", "techdoc-panel.js");
const watch = process.argv.includes("--watch");

const options = {
  entryPoints: [path.join(here, "src", "techdoc-panel.ts")],
  bundle: true,
  format: "esm",
  target: "es2021",
  outfile,
  minify: !watch,
  sourcemap: watch ? "inline" : false,
  legalComments: "none",
};

if (watch) {
  const ctx = await esbuild.context(options);
  await ctx.watch();
  console.log(`Watching for changes, building to ${outfile} ...`);
} else {
  await esbuild.build(options);
  console.log(`Built ${outfile}`);
}
