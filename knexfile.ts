import dotenv from "dotenv";
import type { Knex } from "knex";
import path from "path";

dotenv.config();

const config: Knex.Config = {
	client: "mysql2",
	connection: {
		host: process.env.DB_HOST || "localhost",
		port: Number(process.env.DB_PORT) || 3306,
		user: process.env.DB_USER || "root",
		password: process.env.DB_PASSWORD || "",
		database: process.env.DB_NAME || "db_fastify_advanced",
	},
	pool: {
		min: 2,
		max: 10,
	},
	migrations: {
		tableName: "knex_migrations",
		directory: path.join(__dirname, "src/database/migrations"),
	},
	seeds: {
		directory: path.join(__dirname, "src/database/seeds"),
	},
};
export default config;
