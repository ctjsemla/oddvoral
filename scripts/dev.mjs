import { existsSync, unlinkSync } from "node:fs";
import { createServer } from "node:net";
import { spawn } from "node:child_process";
import path from "node:path";

const lockPath = path.join(process.cwd(), ".next", "dev", "lock");
if (existsSync(lockPath)) {
  try {
    unlinkSync(lockPath);
    console.log("Removed stale Next.js dev lock.");
  } catch {
    console.warn("Could not remove dev lock — stop other `next dev` processes if needed.");
  }
}

function portFree(port) {
  return new Promise((resolve) => {
    const server = createServer();
    server.once("error", () => resolve(false));
    server.once("listening", () => {
      server.close(() => resolve(true));
    });
    server.listen(port, "127.0.0.1");
  });
}

async function pickPort(candidates) {
  for (const port of candidates) {
    if (await portFree(port)) return port;
  }
  return candidates[0];
}

const preferred = process.env.PORT ? [process.env.PORT] : ["3000", "3001", "3002"];
const port = await pickPort(preferred);

if (port !== preferred[0]) {
  console.log(`Port ${preferred[0]} busy — starting dev server on http://localhost:${port}`);
}

const child = spawn("npx", ["next", "dev", "-p", port], {
  stdio: "inherit",
  env: { ...process.env, PORT: port },
});

child.on("exit", (code) => process.exit(code ?? 0));
