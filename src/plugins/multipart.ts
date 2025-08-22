import fastifyMultipart from "@fastify/multipart";
import { FastifyPluginAsync } from "fastify";

const multipartPlugin: FastifyPluginAsync = async (fastify) => {
	// Gunakan konfigurasi yang lebih sederhana
	fastify.register(fastifyMultipart, {
		limits: {
			fileSize: 10 * 1024 * 1024, // 10MB
		},
		attachFieldsToBody: false, // Pastikan ini false agar kita bisa menggunakan mode stream
	});
};

export default multipartPlugin;
