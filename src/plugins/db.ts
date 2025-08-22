//Fastify plugin wrapper untuk pengelolaan scope dan dependensi
import fp from "fastify-plugin";
import { FastifyInstance, FastifyPluginAsync } from "fastify";
import db from "../config/database";

const dbPlugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
	// Tambahkan instance db ke Fastify
	fastify.decorate("db", db);

	// Tutup koneksi db saat server berhenti
	fastify.addHook("onClose", async (instance) => {
		await db.destroy();
	});
};

// Deklarasi type untuk memperluas FastifyInstance menggunakan TS
declare module "fastify" {
	interface FastifyInstance {
		db: typeof db;
	}
}

export default fp(dbPlugin);
