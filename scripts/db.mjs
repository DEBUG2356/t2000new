// Runs an SQL file (or inline SQL with -e) against the Supabase Postgres database (DATABASE_URL in .env.local).
import fs from "node:fs";
import pg from "pg";
const env = Object.fromEntries(fs.readFileSync(".env.local", "utf8").split(/\r?\n/).filter((l) => l.includes("=") && !l.startsWith("#")).map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]));
const sql = process.argv[2] === "-e" ? process.argv[3] : fs.readFileSync(process.argv[2], "utf8");
const client = new pg.Client({ connectionString: process.env.DATABASE_URL || env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await client.connect();
const res = await client.query(sql);
for (const r of [res].flat()) if (r.rows?.length) console.table(r.rows);
await client.end();
console.log("ok");
