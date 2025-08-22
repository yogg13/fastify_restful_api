import fastify, { FastifyInstance } from "fastify";
import { Server, IncomingMessage, ServerResponse } from "http";
import dotenv from "dotenv";
import dbPlugin from "./plugins/db.ts";
import jwtPlugin from "./plugins/jwt.ts";
import corsPlugin from "./plugins/cors.ts";
import sessionPlugin from "./plugins/session.ts";
import csrfPlugin from "./plugins/csrf.ts";
import multipartPlugin from "./plugins/multipart.ts";
import authRoutes from "./routes/auth.routes.ts";
import productRoutes from "./routes/product.routes.ts";
import { SERVER_CONFIG } from "./config/config.ts";

dotenv.config();

// Buat instance Fastify
const server: FastifyInstance<Server, IncomingMessage, ServerResponse> =
	fastify({
		logger: true,
	});

// Daftarkan plugins
server.register(multipartPlugin);
server.register(corsPlugin);
server.register(sessionPlugin);
server.register(csrfPlugin);
server.register(dbPlugin);
server.register(jwtPlugin);

server.register(authRoutes, { prefix: "/api/auth" });
server.register(productRoutes, { prefix: "/api/products" });

server.get("/", async (request, reply) => {
	return { message: "Selamat datang di Fastify API" };
});

// For handle error routes
server.setErrorHandler((error, request, reply) => {
	request.log.error(error);
	reply.code(500).send({ error: "An error occurred on the server" });
});

// Fungsi untuk menjalankan server
const start = async () => {
	try {
		await server.listen({
			port: SERVER_CONFIG.PORT,
			host: SERVER_CONFIG.HOST,
		});
		console.log(`Server running in ${server.server.address()}`);
	} catch (error) {
		server.log.error(error);
		process.exit(1);
	}
};

start();
