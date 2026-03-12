// Rename .js -> .cjs in dist/cjs so Node.js treats them as CommonJS
import { readdirSync, renameSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const dir = new URL("../dist/cjs", import.meta.url).pathname;

function processDir(d) {
  for (const file of readdirSync(d, { withFileTypes: true })) {
    const full = join(d, file.name);
    if (file.isDirectory()) {
      processDir(full);
    } else if (file.name.endsWith(".js")) {
      const newPath = full.replace(/\.js$/, ".cjs");
      // Fix require() paths: .js -> .cjs
      let content = readFileSync(full, "utf-8");
      content = content.replace(/require\(["'](\.[^"']+)\.js["']\)/g, (_, p) => `require("${p}.cjs")`);
      writeFileSync(newPath, content);
      if (full !== newPath) {
        try { renameSync(full, newPath); } catch {}
      }
    }
  }
}

processDir(dir);
console.log("✓ Renamed .js → .cjs in dist/cjs");
