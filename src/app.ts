import express from "express";
import cors from "cors";
import routes from "./routes";
import { setupSwagger } from "./lib/swagger";
import { notFoundHandler } from "./middlewares/notFound";
import { errorHandler } from "./middlewares/errorHandler";

const app = express();

app.use(cors());
app.use(express.json());

// app.get("/health", (_req, res) => {
//   res.json({ status: "ok" });
// });

// /docs UI and /api base path for routes
setupSwagger(app);

app.use("/api", routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
