import dotenv from "dotenv";

dotenv.config();

export const nodeEnv = process.env.NODE_ENV ?? "development";
export const isDev = nodeEnv !== "production";
export const port = Number(process.env.PORT ?? 3000);
export const mongoUri = process.env.MONGODB_URI ?? "";
export const useInMemory = !mongoUri || process.env.USE_IN_MEMORY === "true";
export const jwtSecret = process.env.JWT_SECRET || "dev-secret-change-me";
export const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "1h";
