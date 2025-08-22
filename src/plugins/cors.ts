import fp from "fastify-plugin";
import cors from "@fastify/cors";
import fastify, { FastifyInstance, FastifyPluginAsync } from "fastify";

const corsPlugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
	fastify.register(cors, {
		origin: process.env.CORS_ORIGIN || "*",
		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		credentials: true,
		maxAge: 86400, //Caching preflight request selama 24 jam
	});
};

export default fp(corsPlugin);
