import pino from "pino";
import { isDev } from "../config/env";
import fs from "fs";

const logStream = fs.createWriteStream("/var/log/express.log", { flags: "a" });

const logger = pino(
  {
    name: "app",
    level: isDev ? "debug" : "info",
    transport: isDev
      ? {
          target: "pino-pretty",
          options: { colorize: true, translateTime: "SYS:standard" },
        }
      : undefined,
  },
  logStream
);

export default logger;
