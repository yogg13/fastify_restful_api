import { FastifyInstance } from "fastify";
import { AuthController } from "../controllers/auth.controller";
import { registerSchema } from "../schemas/RegisterSchema";
import { loginSchema } from "../schemas/LoginSchema";

export default async function authRoutes(fastify: FastifyInstance) {
	const authController = new AuthController(fastify.db);

	fastify.post(
		"/register",
		{ schema: registerSchema },
		async (request, reply) => {
			return authController.register(request as any, reply);
		},
	);

	fastify.post(
		"/login",
		{ schema: loginSchema },
		async (request, reply) => {
			return authController.login(request as any, reply);
		},
		// authController.login.bind(authController),
	);

	fastify.get(
		"/profile",
		{ preHandler: fastify.authenticate },
		authController.getProfile.bind(authController),
	);
}
