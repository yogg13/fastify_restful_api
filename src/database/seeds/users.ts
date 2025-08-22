import { Knex } from "knex";
import bcrypt from "bcrypt";

export async function seed(knex: Knex): Promise<void> {
	// Deletes ALL existing entries
	await knex("products").del();
	await knex("users").del();

	const password = await bcrypt.hash("password123", 10);

	// Inserts seed entries
	await knex("users").insert([
		{
			username: "admin",
			email: "admin@gmail.com",
			password,
			is_active: true,
		},
		{
			username: "user1",
			email: "user1@gmail.com",
			password,
			is_active: true,
		},
	]);
}
