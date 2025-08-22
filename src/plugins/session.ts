import fp from "fastify-plugin";
import cookie from "@fastify/cookie";
import session from "@fastify/session";
import { FastifyInstance, FastifyPluginAsync } from "fastify";

const sessionPlugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
	fastify.register(cookie);

	fastify.register(session, {
		cookieName: "sessionId",
		secret: process.env.SESSION_SECRET || "default_session_secret_dev_only",
		cookie: {
			secure: process.env.NODE_ENV === "production",
			httpOnly: true,
			maxAge: 86400000, //24 jam
		},
	});
};
export default fp(sessionPlugin);
