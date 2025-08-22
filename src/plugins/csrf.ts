import fp from "fastify-plugin";
import csrf from "@fastify/csrf-protection";
import { FastifyInstance, FastifyPluginAsync } from "fastify";

const csrfPlugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
	fastify.register(csrf, {
		sessionPlugin: "@fastify/session", // Bergantung pada session plugin
	});

	// Route for take a CSRF Token
	fastify.get("/csrf-token", (request, reply) => {
		// Menghasilkan token CSRF dan mengirimkannya ke client
		return { csrf: reply.generateCsrf() };
	});
};

export default fp(csrfPlugin);
