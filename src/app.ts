import express from "express";
import cors from "cors";
import routes from "./routes";
import { setupSwagger } from "./lib/swagger";
import { notFoundHandler } from "./middlewares/notFound";
import { errorHandler } from "./middlewares/errorHandler";
import client from "prom-client";

const app = express();

const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestDurationSeconds = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "HTTP request duration in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
});
register.registerMetric(httpRequestDurationSeconds);

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  const end = httpRequestDurationSeconds.startTimer({ method: req.method });
  res.on("finish", () => {
    const route = (req as any).route?.path || req.path || "unknown_route";
    end({ route, status_code: res.statusCode });
  });
  next();
});

app.get("/metrics", async (_req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

// app.get("/health", (_req, res) => {
//   res.json({ status: "ok" });
// });

// /docs UI and /api base path for routes
setupSwagger(app);

app.use("/api", routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
