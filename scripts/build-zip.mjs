/**
 * Builds the deploy ZIP (assets/nimberlys-daycare-vercel.zip).
 *
 * The ZIP is intentionally OUTSIDE /public: it is served only through the
 * admin-protected route /api/admin/download-project, so visitors can never
 * download the source code.
 *
 * Usage:  bun run zip   (or: node scripts/build-zip.mjs)
 * Run it AFTER your code changes are done so the download contains the
 * latest version of everything.
 */

import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, statSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "assets");
const outZip = join(outDir, "nimberlys-daycare-vercel.zip");

// Same manifest that shipped with the previous ZIPs (source + assets + docs).
const INCLUDE = [
  ".env.example",
  ".gitignore",
  "DEPLOY.md",
  "bun.lock",
  "components.json",
  "eslint.config.mjs",
  "next-env.d.ts",
  "next.config.ts",
  "package.json",
  "postcss.config.mjs",
  "prisma",
  "public",
  "scripts",
  "src",
  "tailwind.config.ts",
  "tsconfig.json",
];

function countFiles(dir) {
  let n = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) n += countFiles(p);
    else n += 1;
  }
  return n;
}

try {
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
  rmSync(outZip, { force: true });

  execSync(
    `zip -r -q ${JSON.stringify(outZip)} ${INCLUDE.map((p) => JSON.stringify(p)).join(" ")} ` +
      `-x "*.DS_Store" -x "public/download/*" -x "*/node_modules/*" ` +
      // ⚠️ Temporary preview-only download helper must NEVER ship to
      // production (owner-facing button + public route). Keep excluded!
      `-x "src/components/TempZipButton.tsx" -x "src/app/api/temp-download/*"`,
    { cwd: root, stdio: "inherit" }
  );

  const sizeMb = (statSync(outZip).size / (1024 * 1024)).toFixed(1);
  let total = 0;
  for (const item of INCLUDE) {
    const p = join(root, item);
    if (existsSync(p) && statSync(p).isDirectory()) total += countFiles(p);
    else if (existsSync(p)) total += 1;
  }
  console.log(`✅ ${outZip}`);
  console.log(`   ${total} files, ${sizeMb} MB`);
} catch (err) {
  console.error("❌ Failed to build ZIP:", err?.message ?? err);
  process.exit(1);
}
