import { Knex } from "knex";

export interface Product {
	id?: number;
	name: string;
	description?: string;
	price: number;
	stock: number;
	image_url?: string;
	user_id: number;
	created_at?: Date;
	updated_at?: Date;
}

export class ProductModel {
	private db: Knex;
	private table = "products";

	constructor(db: Knex) {
		this.db = db;
	}

	async findAll(
		limit: number = 10,
		page: number = 1,
	): Promise<{ products: Product[]; total: number | any }> {
		const offset = (page - 1) * limit; //Menambahkan pagination untuk daftar produk

		// Query product dengan pagination
		const products = await this.db(this.table)
			.select("*")
			.limit(limit)
			.offset(offset)
			.orderBy("created_at", "desc");

		const [count] = await this.db(this.table).count({ total: "*" });

		return {
			products,
			total: count.total || 0,
		};
	}

	async findById(id: number): Promise<Product> {
		const products = await this.db(this.table).where({ id }).first();
		return products;
	}

	async findByUser(userId: number): Promise<Product[]> {
		const products = await this.db(this.table).where({ user_id: userId });
		return products;
	}

	async create(data: Partial<Product>): Promise<number> {
		const [id] = await this.db("products").insert({
			name: data.name,
			description: data.description || null,
			price: data.price,
			stock: data.stock || 0,
			image_url: data.image_url || null,
			user_id: data.user_id,
			created_at: new Date(),
			updated_at: new Date(),
		});
		return id;
	}

	async update(
		id: number,
		productData: Partial<Product>,
	): Promise<Product | null> {
		await this.db(this.table)
			.where({ id })
			.update({
				...productData,
				updated_at: this.db.fn.now(),
			});
		return this.findById(id);
	}

	async delete(id: number): Promise<boolean> {
		const deleted = await this.db(this.table).where({ id }).delete();
		return deleted > 0;
	}

	async search(keyword: string): Promise<Product[]> {
		const products = await this.db(this.table)
			.where("name", "like", `%${keyword}%`)
			.orWhere("description", "like", `%${keyword}%`);

		return products;
	}
}
