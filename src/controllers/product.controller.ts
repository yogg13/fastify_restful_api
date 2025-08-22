import { FastifyRequest, FastifyReply } from "fastify";
import { Product, ProductModel } from "../models/Product";
import fs from "fs";
import path from "path";
import { pipeline } from "stream/promises";
import { v4 as uuidv4 } from "uuid";

// Tambahkan deklarasi tipe untuk multipart request
interface MultipartFile {
	filename: string;
	mimetype: string;
	file: NodeJS.ReadableStream;
	fieldname: string;
	encoding: string;
	fields: Record<string, string>;
	value: string;
}

interface ProductRequest extends FastifyRequest {
	body: Partial<Product>;
}

interface ParamsRequest extends FastifyRequest {
	params: {
		id: string;
	};
}

interface PaginationRequest extends FastifyRequest {
	query: {
		page?: string;
		limit?: string;
		search?: string;
	};
}

export class ProductController {
	private productModel: ProductModel;

	constructor(db: any) {
		this.productModel = new ProductModel(db);
	}

	async getAll(request: PaginationRequest, reply: FastifyReply) {
		try {
			const page = request.query.page ? parseInt(request.query.page) : 1;
			const limit = request.query.limit ? parseInt(request.query.limit) : 10;

			if (request.query.search) {
				const products = await this.productModel.search(request.query.search);
				return reply.code(200).send({
					products,
					total: products.length,
					page,
					limit,
					search: request.query.search,
				});
			}

			const { products, total } = await this.productModel.findAll(limit, page);
			return reply.code(200).send({
				products,
				total,
				page,
				limit,
				totalPage: Math.ceil(total / limit),
			});
		} catch (error) {
			request.log.error(error);
			return reply
				.code(500)
				.send({ error: "Terjadi kesalahan saat mengambil produk" });
		}
	}
	async getById(request: ParamsRequest, reply: FastifyReply) {
		try {
			const id = parseInt(request.params.id);

			const product = await this.productModel.findById(id);
			if (!product) {
				return reply.code(404).send({ error: "Product Not Found" });
			}

			return reply.code(200).send(product);
		} catch (error) {
			request.log.error(error);
			return reply
				.code(500)
				.send({ error: "Terjadi kesalahan saat mengambil produk" });
		}
	}

	async create(request: FastifyRequest, reply: FastifyReply) {
		try {
			// Validasi user
			if (!request.user || !request.user.id) {
				return reply.code(403).send({ error: "Authentication required" });
			}

			const userId = request.user.id;
			console.log("Processing request from user:", userId);

			// Debug headers
			console.log("Request Content-Type:", request.headers["content-type"]);

			// Data produk
			const productData: Partial<Product> = {
				user_id: userId,
				stock: 0,
			};

			// Periksa content-type
			const contentType = request.headers["content-type"] || "";

			// Untuk multipart/form-data
			if (contentType.includes("multipart/form-data")) {
				console.log("Processing multipart/form-data request");

				try {
					// Siapkan direktori upload
					const uploadDir = path.join(process.cwd(), "uploads");
					if (!fs.existsSync(uploadDir)) {
						fs.mkdirSync(uploadDir, { recursive: true });
					}

					// Gunakan busboy untuk memproses form data
					const bb = require("busboy")({ headers: request.headers });

					// Proses form data dengan busboy
					await new Promise<void>((resolve, reject) => {
						// Handle file upload
						bb.on("file", (fieldname: string, file: any, info: any) => {
							const { filename, encoding, mimeType } = info;
							console.log(
								`Processing file: ${fieldname}, filename: ${filename}`,
							);

							if (fieldname === "image_url") {
								const fileExt = path.extname(filename) || ".jpg";
								const fileName = `${uuidv4()}${fileExt}`;
								const filePath = path.join(uploadDir, fileName);

								console.log(`Saving file to: ${filePath}`);
								const writeStream = fs.createWriteStream(filePath);
								file.pipe(writeStream);

								file.on("end", () => {
									productData.image_url = `/uploads/${fileName}`;
									console.log("File processed successfully");
								});
							} else {
								// Skip file yang bukan image_url
								file.resume();
							}
						});

						// Handle field
						bb.on("field", (fieldname: string, value: string) => {
							console.log(`Field: ${fieldname} = ${value}`);
							switch (fieldname) {
								case "name":
									productData.name = value;
									break;
								case "description":
									productData.description = value;
									break;
								case "price":
									productData.price = parseFloat(value);
									break;
								case "stock":
									productData.stock = parseInt(value, 10);
									break;
							}
						});

						// Handle finish
						bb.on("finish", () => {
							console.log("Busboy processing finished");
							resolve();
						});

						// Handle error
						bb.on("error", (err: Error) => {
							console.error("Busboy error:", err);
							reject(err);
						});

						// Pipe request ke busboy
						request.raw.pipe(bb);
					});
				} catch (err) {
					console.error("Error in multipart processing:", err);
					return reply.code(500).send({
						error: "Error processing form data",
						details: err instanceof Error ? err.message : String(err),
					});
				}
			}
			// Untuk JSON - body raw
			else {
				console.log("Processing JSON request");
				const body = request.body as any;
				productData.name = body?.name;
				productData.description = body?.description;
				productData.price = Number(body?.price);
				productData.stock = body?.stock ? Number(body?.stock) : 0;
				productData.image_url = body?.image_url;
			}

			// Validasi data
			if (!productData.name || !productData.price) {
				return reply.code(400).send({
					error: "Product name and or price required",
				});
			}

			console.log("Saving product data:", productData);

			// Simpan ke database
			const newProductId = await this.productModel.create({
				name: productData.name,
				description: productData.description || "No description",
				price: productData.price,
				stock: productData.stock || 0,
				image_url: productData.image_url,
				user_id: userId,
			} as Product);

			// Ambil produk yang baru dibuat
			const newProduct = await this.productModel.findById(newProductId);

			return reply.code(201).send({
				success: true,
				message: `Product ${productData.name} successfully created`,
			});
		} catch (error) {
			console.error("Error creating product:", error);
			request.log.error(error);
			return reply.code(500).send({
				error: "An error occurred while making the product",
				details: error instanceof Error ? error.message : String(error),
			});
		}
	}

	async update(request: ProductRequest & ParamsRequest, reply: FastifyReply) {
		try {
			if (!request.user.id) {
				return reply
					.code(403)
					.send({ error: "You can't have access to create product" });
			}

			const userId = request.user.id;
			const id = parseInt(request.params.id);

			const product = await this.productModel.findById(id);
			if (!product) {
				return reply.code(404).send({ error: "Product Not Found" });
			}

			if (request.user.id !== userId) {
				return reply.code(403).send({
					error: "You can't have permission to update this product",
				});
			}
			await this.productModel.update(id, request.body);
			return reply
				.code(200)
				.send(`Product ${request.body.name} successfully updated`);
		} catch (error) {
			request.log.error(error);
			return reply
				.code(500)
				.send({ error: "An error occurred while updating the product" });
		}
	}

	async delete(request: ParamsRequest, reply: FastifyReply) {
		try {
			if (!request.user.id) {
				return reply
					.code(403)
					.send({ error: "You can't have access to create product" });
			}

			const id = parseInt(request.params.id);
			const userId = request.user.id;

			const product = await this.productModel.findById(id);
			if (!product) {
				return reply.code(404).send({ error: "Product Not Found" });
			}

			if (request.user.id !== userId) {
				return reply.code(403).send({
					error: "You can't have permission to update this product",
				});
			}

			const deleted = await this.productModel.delete(id);

			if (deleted) {
				return reply
					.code(204)
					.send({ message: "Deleted Product successfully" });
			} else {
				return reply.code(500).send({ error: "Failed to delete the Product" });
			}
		} catch (error) {
			request.log.error(error);
			return reply
				.code(500)
				.send({ error: "An error occurred while deleting the product" });
		}
	}

	async getMyProducts(request: PaginationRequest, reply: FastifyReply) {
		try {
			if (!request.user.id) {
				return reply
					.code(403)
					.send({ error: "You can't have access to get proudct" });
			}

			const userId = request.user.id;
			const products = await this.productModel.findByUser(userId);

			if (!products) {
				return reply.code(404).send({ error: "Product Not Found" });
			}

			return reply.code(200).send({
				products,
				total: products.length,
			});
		} catch (error) {
			request.log.error(error);
			return reply
				.code(500)
				.send({ error: "An error occurred while getting the product" });
		}
	}
}
