import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

export const SERVER_CONFIG = {
	PORT: Number(process.env.PORT) || 8081,
	HOST: process.env.HOST || "0.0.0.0",
	NODE_ENV: process.env.NODE_ENV || "development",
};

// Konfigurasi database
export const DB_CONFIG = {
	HOST: process.env.DB_HOST || "localhost",
	PORT: Number(process.env.DB_PORT) || 3306,
	USER: process.env.DB_USER || "root",
	PASSWORD: process.env.DB_PASSWORD || "",
	NAME: process.env.DB_NAME || "db_fastify_advanced",
};

// Konfigurasi JWT
export const JWT_CONFIG = {
	SECRET: process.env.JWT_SECRET || "default_secret_dev_only",
	EXPIRES_IN: process.env.JWT_EXPIRES_IN || "1d",
};

// Konfigurasi Session
export const SESSION_CONFIG = {
	SECRET: process.env.SESSION_SECRET || "default_session_secret_dev_only",
	COOKIE_MAX_AGE: Number(process.env.COOKIE_MAX_AGE) || 86400000,
};

// Konfigurasi CORS
export const CORS_CONFIG = {
	ORIGIN: process.env.CORS_ORIGIN || "*",
	METHODS: ["GET", "PUT", "POST", "DELETE", "OPTIONS"],
};
