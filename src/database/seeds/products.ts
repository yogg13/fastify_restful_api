import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
	// Deletes ALL existing entries
	await knex("products").del();

	const existingUsers = await knex("users").select("id");
	let adminId, userId;

	if (existingUsers.length < 2) {
		// If there are not enough users, create them
		await knex("users").insert([
			{
				id: 1,
				email: "admin@example.com",
				username: "admin",
				password: "adminpassword",
			},
			{
				id: 2,
				email: "user@example.com",
				username: "user",
				password: "userpassword",
			},
		]);
		adminId = 1;
		userId = 2;
	} else {
		adminId = existingUsers[0].id;
		userId = existingUsers[1].id;
	}

	// Inserts seed entries
	await knex("products").insert([
		{
			name: "Laptop Lenovo",
			description: "Ini deskripsi laptop lenovo",
			price: 7000000,
			stock: 10,
			user_id: adminId,
		},
		{
			name: "Macbook M2",
			description: "Ini deskripsi Macbook M2",
			price: 12000000,
			stock: 10,
			user_id: adminId,
		},
		{
			name: "HP VIVO V20",
			description: "Ini HP VIVO V20",
			price: 4000000,
			stock: 10,
			user_id: userId,
		},
	]);
}
