import { FastifyInstance } from "fastify";
import { ProductController } from "../controllers/product.controller";

export default async function productRoutes(fastify: FastifyInstance) {
	const productController = new ProductController(fastify.db);

	// WAJIB! Tambahkan ini untuk multipart pada rute spesifik
	fastify.addContentTypeParser(
		"multipart/form-data",
		{},
		(request, payload, done) => {
			done(null);
		},
	);

	// Schema untuk validasi
	const productSchema = {
		body: {
			type: "object",
			properties: {
				name: { type: "string", minLength: 1 },
				description: { type: "string" },
				price: { type: "number", minimum: 0 },
				stock: { type: "number", minimum: 0 },
				image_url: { type: "string" },
			},
		},
	};

	const idParamSchema = {
		params: {
			type: "object",
			required: ["id"],
			properties: {
				id: { type: "string", pattern: "^[0-9]+$" },
			},
		},
	};

	fastify.get("/", async (request, reply) => {
		return productController.getAll(request as any, reply);
	});

	fastify.get("/:id", { schema: idParamSchema }, async (request, reply) => {
		return productController.getById(request as any, reply);
	});

	// Routes yang memerlukan autentikasi
	fastify.post(
		"/",
		{
			preHandler: fastify.authenticate,
		},
		async (request, reply) => {
			return productController.create(request, reply);
		},
	);

	fastify.put(
		"/:id",
		{
			preHandler: fastify.authenticate,
			schema: { ...productSchema, ...idParamSchema },
		},
		async (request, reply) => {
			return productController.update(request as any, reply);
		},
	);

	fastify.delete(
		"/:id",
		{
			preHandler: fastify.authenticate,
			schema: idParamSchema,
		},
		async (request, reply) => {
			return productController.delete(request as any, reply);
		},
	);

	fastify.get(
		"/my-products",
		{
			preHandler: fastify.authenticate,
		},
		async (request, reply) => {
			return productController.getMyProducts(request as any, reply);
		},
	);
}
