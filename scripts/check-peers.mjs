// Fails on peer dependencies that THIS project should declare but doesn't.
//
// pinia 4 needs @vue/devtools-api as a peer; it only resolved because another
// package happened to pull it in (#96). Yarn reports such gaps as warnings
// (YN0002 missing peer, YN0060 incompatible peer) and CI stayed green.
//
// Usage (CI Lint job):
//   yarn install --immutable --mode=skip-build > install.log 2>&1
//   node scripts/check-peers.mjs        (reads ./install.log)
import { readFileSync } from "node:fs";

// Known, accepted gaps: provided by nuxt itself at runtime.
// Remove an entry once it is declared; never add one without a reason.
const ALLOWED = new Set(["rolldown", "vite"]);

const log = readFileSync("install.log", "utf8");
const problems = [
  ...log.matchAll(
    /(YN0002|YN0060): .*nuxt-app@workspace:\. (?:doesn't provide|provides) (\S+?)(?: with version \S+)? \((p[0-9a-f]{6})\)/g,
  ),
].filter(([, , name]) => !ALLOWED.has(name));

if (problems.length === 0) {
  console.log("check-peers: OK");
  process.exit(0);
}
console.error("check-peers: peer dependencies to declare in package.json:");
for (const [line, , name, hash] of problems) {
  console.error(`  ${name}: ${line.trim()}`);
  console.error(`    → details: yarn explain peer-requirements ${hash}`);
}
process.exit(1);
