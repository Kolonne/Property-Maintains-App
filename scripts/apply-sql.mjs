import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL not set. Run with: node --env-file=.env.local scripts/apply-sql.mjs ...");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

function splitStatements(text) {
  const noLineComments = text.replace(/--[^\n]*\n/g, "\n");
  return noLineComments
    .split(/;\s*(?:\n|$)/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

async function runFile(path) {
  const text = readFileSync(path, "utf-8");
  const stmts = splitStatements(text);
  console.log(`\n→ ${path}: ${stmts.length} statements`);
  let i = 0;
  for (const stmt of stmts) {
    i++;
    try {
      await sql.query(stmt);
      const first = stmt.split("\n")[0].slice(0, 70);
      console.log(`  [${i}/${stmts.length}] OK: ${first}`);
    } catch (e) {
      console.error(`  [${i}/${stmts.length}] FAIL:`, e.message);
      console.error(`  Statement: ${stmt.slice(0, 200)}...`);
      process.exit(1);
    }
  }
}

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error("Usage: node scripts/apply-sql.mjs <file.sql> [more.sql ...]");
  process.exit(1);
}

for (const f of files) await runFile(f);
console.log("\n✓ All done.");
