import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
	return knex.schema.createTable("products", (table) => {
		table.increments("id").primary();
		table.string("name", 100).notNullable();
		table.text("description");
		table.decimal("price", 10, 2).notNullable();
		table.integer("stock").notNullable().defaultTo(0).unsigned();
		table.string("image_url", 255);
		table.integer("user_id").unsigned().notNullable();
		table.timestamps(true, true);
		// Foreign key to table users
		table.foreign("user_id").references("id").inTable("users");
	});
}

export async function down(knex: Knex): Promise<void> {
	return knex.schema.dropTableIfExists("products");
}
