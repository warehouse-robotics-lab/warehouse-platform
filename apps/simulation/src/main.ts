import process from "node:process";
import { clearInterval, setInterval } from "node:timers";

const keepAlive = setInterval(() => {}, 60_000);

let stopping = false;

function shutdown(signal: NodeJS.Signals): void {
  if (stopping) {
    return;
  }

  stopping = true;

  console.info(`[simulation] Stopping: ${signal}`);

  clearInterval(keepAlive);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

console.info(`[simulation] Started. PID: ${process.pid}`);
