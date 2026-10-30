// Fails when yarn.lock resolves more than one version of a package that must
// be unique in the dependency tree.
//
// Two copies of `vue` break Nuxt's `ComponentCustomProperties` augmentation
// (dozens of cryptic TS2339 in templates); two copies of `eslint-plugin-vue`
// crash ESLint at load ("Different instances of plugin"). Dependabot
// regenerates the lockfile on every rebase and can reintroduce such a
// duplicate silently — this check names it directly.
//
// Usage: node scripts/check-singletons.mjs   (run in the CI Lint job)
import { readFileSync } from "node:fs";

// Stateless helpers (e.g. @better-auth/utils) are left out on purpose: a
// duplicate there is harmless and would only make the check noisy.
const SINGLETONS = new Set([
  "vue",
  "@vue/runtime-core",
  "@vue/runtime-dom",
  "@vue/reactivity",
  "@vue/compiler-sfc",
  "vue-router",
  "pinia",
  "eslint-plugin-vue",
  "@prisma/client",
  "prisma",
  "better-auth",
  "@better-auth/core",
]);

// Berry lockfile: every entry carries `resolution: "<name>@npm:<version>"`.
const lockfile = readFileSync("yarn.lock", "utf8");
const versions = new Map();
for (const [, name, version] of lockfile.matchAll(
  /^\s+resolution: "(@?[^@"]+)@npm:([^"]+)"$/gm,
)) {
  if (!SINGLETONS.has(name)) continue;
  if (!versions.has(name)) versions.set(name, new Set());
  versions.get(name).add(version);
}

const duplicates = [...versions].filter(([, set]) => set.size > 1);
if (duplicates.length === 0) {
  console.log(`check-singletons: OK (${versions.size} packages checked)`);
  process.exit(0);
}

console.error("check-singletons: duplicated packages in yarn.lock:");
for (const [name, set] of duplicates) {
  console.error(`  ${name}: ${[...set].join(", ")}`);
  console.error(`    → inspect with: yarn why ${name}`);
}
console.error(
  "Fix: yarn dedupe <name> (or widen the range that pins the old copy).",
);
process.exit(1);
