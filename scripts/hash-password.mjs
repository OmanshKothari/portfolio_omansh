// One-time helper: turn a plaintext admin password into an ADMIN_PASSWORD_HASH.
//
//   npm run hash-password -- "your-strong-password"
//
// Copy the printed value into .env (local) and the Vercel env vars.
// The format is "<saltHex>:<derivedKeyHex>" using Node's scrypt — it must match
// verifyPassword() in src/lib/auth.server.ts.
import { scryptSync, randomBytes } from "node:crypto";
import { createInterface } from "node:readline/promises";

const SCRYPT_KEYLEN = 64;

function hash(password) {
  const salt = randomBytes(16);
  const derived = scryptSync(password, salt, SCRYPT_KEYLEN);
  return `${salt.toString("hex")}:${derived.toString("hex")}`;
}

let password = process.argv[2];
if (!password) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  password = (await rl.question("Admin password: ")).trim();
  rl.close();
}

if (!password || password.length < 8) {
  console.error("Password must be at least 8 characters.");
  process.exit(1);
}

console.log("\nADMIN_PASSWORD_HASH=" + hash(password) + "\n");
