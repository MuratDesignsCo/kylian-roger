/**
 * fix-orphan-braces.js
 *
 * Removes orphan closing braces from a CSS file.
 * An "orphan" closing brace is one that would bring the nesting depth below 0,
 * meaning it has no matching opening brace.
 *
 * The script walks the file character by character, respects strings and comments
 * so it doesn't miscount braces inside them, and strips only the truly unmatched `}`.
 */

const fs = require("fs");
const path = require("path");

const filePath =
  process.argv[2] ||
  path.join(__dirname, "../src/styles/styles.css");

const src = fs.readFileSync(filePath, "utf8");

let depth = 0;
let out = "";
let i = 0;
let removed = 0;
const removedPositions = []; // track line numbers for reporting

// helper: current line number
function lineAt(pos) {
  let line = 1;
  for (let j = 0; j < pos && j < src.length; j++) {
    if (src[j] === "\n") line++;
  }
  return line;
}

while (i < src.length) {
  const ch = src[i];

  // --- skip CSS comments  /* ... */  ---
  if (ch === "/" && src[i + 1] === "*") {
    const end = src.indexOf("*/", i + 2);
    if (end === -1) {
      // unterminated comment – keep the rest as-is
      out += src.slice(i);
      break;
    }
    out += src.slice(i, end + 2);
    i = end + 2;
    continue;
  }

  // --- skip quoted strings (single or double) ---
  if (ch === '"' || ch === "'") {
    const quote = ch;
    let j = i + 1;
    while (j < src.length) {
      if (src[j] === "\\") {
        j += 2; // skip escaped character
        continue;
      }
      if (src[j] === quote) {
        j++;
        break;
      }
      j++;
    }
    out += src.slice(i, j);
    i = j;
    continue;
  }

  // --- track braces ---
  if (ch === "{") {
    depth++;
    out += ch;
    i++;
    continue;
  }

  if (ch === "}") {
    if (depth > 0) {
      depth--;
      out += ch;
    } else {
      // orphan closing brace – skip it
      removed++;
      removedPositions.push(lineAt(i));
    }
    i++;
    continue;
  }

  // --- everything else ---
  out += ch;
  i++;
}

// Write back
fs.writeFileSync(filePath, out, "utf8");

// Report
console.log(`Removed ${removed} orphan closing brace(s).`);
if (removedPositions.length) {
  console.log(`At lines: ${removedPositions.join(", ")}`);
}

// Verify
const opens = (out.match(/\{/g) || []).length;
const closes = (out.match(/\}/g) || []).length;
console.log(`\nVerification after fix:`);
console.log(`  Opening braces: ${opens}`);
console.log(`  Closing braces: ${closes}`);
console.log(`  Difference:     ${closes - opens}`);
if (opens === closes) {
  console.log(`  ✓ Braces are balanced.`);
} else {
  console.log(`  ✗ Braces are NOT balanced — manual review needed.`);
  process.exit(1);
}
