const { execSync, spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
try {
  require("dotenv").config();
} catch (e) {
  // dotenv might not be installed yet, ignore
}

function freePort3000() {
  try {
    if (process.platform === "win32") {
      const output = execSync("netstat -ano | findstr :3000", {
        stdio: ["ignore", "pipe", "ignore"],
        encoding: "utf8",
      });
      const pids = new Set();
      for (const line of output.split("\n")) {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && /^\d+$/.test(pid)) pids.add(pid);
      }
      for (const pid of pids) {
        execSync(`taskkill /PID ${pid} /F`, { stdio: "ignore" });
      }
    } else {
      execSync("fuser -k 3000/tcp", { stdio: "ignore" });
    }
  } catch (_) {
    // Port is free or command unavailable; continue.
  }
}

function ensureDatabase() {
  try {
    const net = require("net");
    const client = new net.Socket();
    client.setTimeout(1000);
    client.on("connect", () => {
      client.destroy();
    });
    client.on("error", () => {
      console.log("⚡ Auto-starting local MariaDB database daemon on port 3306...");
      try {
        const path = require("path");
        const dataDir = path.join(__dirname, "..", ".mariadb_data");
        const dbProcess = spawn("mariadbd", [
          `--datadir=${dataDir}`,
          "--socket=/tmp/mariadb.sock",
          "--pid-file=/tmp/mariadb.pid",
          "--port=3306",
          "--bind-address=0.0.0.0"
        ], { detached: true, stdio: "ignore" });
        dbProcess.on("error", (err) => {
          console.warn("Local mariadbd daemon not found or failed to start:", err.message);
        });
        dbProcess.unref();
      } catch (e) {
        console.warn("Could not start mariadbd:", e.message);
      }
    });
    client.connect(3306, "127.0.0.1");
  } catch (_) {}
}

freePort3000();
// A configured remote database does not need (and must not trigger) a local
// MariaDB daemon. The daemon is only a fallback for local/mock development.
if (!process.env.DATABASE_URL || process.env.DATABASE_MODE === "local") {
  ensureDatabase();
}

const env = {
  ...process.env,
  NODE_ENV: "development",
  NODE_OPTIONS: "--max-old-space-size=8192 --no-warnings",
  NEXT_TELEMETRY_DISABLED: "1",
  NEXT_CPU_COUNT: "12",
  UV_THREADPOOL_SIZE: "16",
  PRISMA_CLIENT_ENGINE_TYPE: process.env.PRISMA_CLIENT_ENGINE_TYPE || "binary",
  DATABASE_MODE: process.env.DATABASE_URL ? (process.env.DATABASE_MODE || "remote") : "mock",
};

// Forward CLI arguments (e.g. --hostname 0.0.0.0)
const passThroughArgs = process.argv.slice(2);
const useTurbo = !passThroughArgs.includes("--no-turbo");
const filteredArgs = passThroughArgs.filter(arg => arg !== "--no-turbo");

const nextArgs = ["next", "dev"];
if (useTurbo) {
  nextArgs.push("--turbo");
} else {
  nextArgs.push("--webpack");
}
nextArgs.push(...filteredArgs);

console.log(`Starting dev server with arguments: ${nextArgs.join(" ")}`);

const projectRoot = path.join(__dirname, "..");
const bundledNode = path.join(
  projectRoot,
  ".tools",
  "node-v22.23.2-win-x64",
  process.platform === "win32" ? "node.exe" : "bin/node"
);
const nodeExecutable = fs.existsSync(bundledNode) ? bundledNode : process.execPath;
const nextCli = path.join(projectRoot, "node_modules", "next", "dist", "bin", "next");

const child = spawn(nodeExecutable, [nextCli, ...nextArgs.slice(1)], {
  stdio: "inherit",
  env,
});

child.on("close", (code) => process.exit(code ?? 0));
