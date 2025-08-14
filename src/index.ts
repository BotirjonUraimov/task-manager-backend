import app from "./app";
import logger from "./lib/logger";
import { port } from "./config/env";
import { connectToDatabase, disconnectFromDatabase } from "./lib/db";

const server = app.listen(port, async () => {
  logger.info({ port }, "Server started");
  try {
    await connectToDatabase();
  } catch (error) {
    logger.error({ error }, "Failed to connect to database");
  }
});

function shutdown(signal: string) {
  logger.info({ signal }, "Shutting down");
  server.close(async () => {
    logger.info("HTTP server closed");
    await disconnectFromDatabase();
    process.exit(0);
  });

  setTimeout(() => {
    logger.error("Force shutdown");
    process.exit(1);
  }, 10000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
