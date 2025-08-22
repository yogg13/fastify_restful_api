import knex from "knex";
import dotenv from "dotenv";
import { DB_CONFIG } from "./config";

// Membuat env variable
dotenv.config();

// Konfigurasi koneksi db
const dbConfig = {
	client: "mysql2",
	connection: {
		host: DB_CONFIG.HOST,
		port: DB_CONFIG.PORT,
		user: DB_CONFIG.USER,
		password: DB_CONFIG.PASSWORD,
		database: DB_CONFIG.NAME,
	},
	pool: {
		min: 2,
		max: 10,
	},
	migrations: {
		tableName: "knex_migrations",
		directory: "./src/database/migrations",
	},
	seeds: {
		directory: "./src/database/seeds",
	},
};

// Membuat instance knex
const db = knex(dbConfig);

export default db;
