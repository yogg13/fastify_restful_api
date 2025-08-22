import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
	return knex.schema.createTable("users", (table) => {
		table.increments("id").primary();
		table.string("username", 100).notNullable().unique();
		table.string("email", 100).notNullable().unique();
		table.string("password", 100).notNullable();
		table.boolean("is_active").defaultTo(true);
		table.timestamps(true, true);
	});
}

export async function down(knex: Knex): Promise<void> {
	return knex.schema.dropTableIfExists("users");
}
