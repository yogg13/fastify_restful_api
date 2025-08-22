import fp from "fastify-plugin";
import jwt from "@fastify/jwt";
import { FastifyInstance, FastifyPluginAsync } from "fastify";

const jwtPlugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
	// Daftatkan plugin jwt
	fastify.register(jwt, {
		secret: process.env.JWT_SECRET || "default_secret_dev_only",
		sign: {
			expiresIn: process.env.JWT_EXPIRES_IN || "1d",
		},
	});

	// Tambahkan decorator untuk verifikasi jwt token
	fastify.decorate("authenticate", async (request: any, reply: any) => {
		try {
			await request.jwtVerify();
		} catch (error) {
			reply.code(401).send({ error: "Unauthorized access" });
		}
	});
};

// Deklarasi type untuk memperluas authenticate di FastifyInstace dengan TS
declare module "fastify" {
	interface FastifyInstance {
		authenticate: (request: any, reply: any) => Promise<void>;
	}
}

// Memperluas type request untuk menyertakan user
declare module "@fastify/jwt" {
	interface FastifyJWT {
		payload: { id: number; username: string; email: string };
		user: {
			id: number;
			username: string;
			email: string;
		};
	}
}

export default fp(jwtPlugin);
