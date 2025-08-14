import pino from "pino";
import fs from "fs";
import path from "path";
import { isDev } from "../config/env";

const LOG_FILE = process.env.LOG_FILE || "/var/log/express.log";
const LOG_LEVEL = process.env.LOG_LEVEL || (isDev ? "debug" : "info");

function createDevLogger() {
  return pino({
    name: "app",
    level: LOG_LEVEL,
    transport: {
      target: "pino-pretty",
      options: { colorize: true, translateTime: "SYS:standard" },
    },
  });
}

function createProdLogger() {
  let destination: pino.DestinationStream | NodeJS.WritableStream =
    pino.destination(1);

  try {
    const dir = path.dirname(LOG_FILE);
    fs.mkdirSync(dir, { recursive: true });
    fs.appendFileSync(LOG_FILE, "");
    destination = pino.destination({
      dest: LOG_FILE,
      mkdir: true,
      sync: false,
    });
  } catch {}

  return pino(
    {
      name: "app",
      level: LOG_LEVEL,
      timestamp: pino.stdTimeFunctions.isoTime,
    },
    destination
  );
}

const logger = isDev ? createDevLogger() : createProdLogger();
export default logger;
