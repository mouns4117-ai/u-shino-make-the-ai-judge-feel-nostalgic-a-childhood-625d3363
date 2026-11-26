// Make the AI Judge Feel Nostalgic: A Childhood Memory
// Writes one sentence (1-280 chars) recalling a childhood memory to /output/entry.txt.
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";

const ENTRY =
  "Grandma's kitchen smelled of fresh rice and woodsmoke, and I would sit on the cold tile floor shelling peas into a chipped blue bowl while the radio murmured songs she hummed along to, not knowing those afternoons would end.";

function emptyOutputDirContents(): void {
  // /output is a mounted directory: create it if missing, then empty its
  // CONTENTS, never remove the dir itself.
  mkdirSync("/output", { recursive: true });
  for (const name of readdirSync("/output")) {
    rmSync(`/output/${name}`, { recursive: true, force: true });
  }
}

function main(): void {
  // Fail fast on gate violations before touching /output.
  if (ENTRY.includes("\n") || ENTRY.includes("\r")) {
    throw new Error("entry must be a single line");
  }
  if (ENTRY.charCodeAt(0) === 0xfeff) {
    throw new Error("entry must not start with a BOM");
  }
  for (const ch of ENTRY) {
    if (ch.charCodeAt(0) < 0x20 && ch !== "\t") {
      throw new Error("entry must not contain control characters");
    }
  }
  const bytes = Buffer.byteLength(ENTRY, "utf8");
  if (bytes > 560) {
    throw new Error(`entry too long in bytes: ${bytes}`);
  }
  if (!ENTRY.endsWith(".")) {
    throw new Error("entry must be one complete sentence");
  }
  if (ENTRY.length < 1 || ENTRY.length > 280) {
    throw new Error(`entry must be 1-280 chars, got ${ENTRY.length}`);
  }
  if (ENTRY.trim().length === 0) {
    throw new Error("entry must not be only whitespace");
  }
  emptyOutputDirContents();
  mkdirSync("/output", { recursive: true });
  writeFileSync("/output/entry.txt", ENTRY, "utf8");
  const written = readFileSync("/output/entry.txt", "utf8");
  if (written !== ENTRY) {
    throw new Error("read-back mismatch: entry.txt does not hold exactly the entry");
  }
  const sha = createHash("sha256").update(written, "utf8").digest("hex");
  console.log(`wrote /output/entry.txt (${ENTRY.length} chars, sha256 ${sha})`);
}

main();
