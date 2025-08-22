import type { Knex } from "knex";
import bcrypt from "bcrypt";

export interface User {
	id?: number;
	username: string;
	email: string;
	password: string;
	is_active?: boolean;
	created_at?: Date;
	updated_at?: Date;
}

export interface UserLogin {
	username: string;
	password: string;
}

export class UserModel {
	private db: Knex;
	private table = "users";

	constructor(db: Knex) {
		this.db = db;
	}

	async create(userData: User): Promise<User> {
		const hashedPassword = await bcrypt.hash(userData.password, 10);

		const [id] = await this.db(this.table).insert({
			...userData,
			password: hashedPassword,
		});

		const user = await this.findById(id);
		return user as User;
	}	

	async findById(id: number): Promise<User | null> {
		const user = await this.db(this.table).where({ id }).first();
		return user || null;
	}

	async findByUsername(username: string): Promise<User | null> {
		const user = this.db(this.table).where({ username }).first();
		return user || null;
	}

	async findByEmail(email: string): Promise<User | null> {
		const user = await this.db(this.table).where({ email }).first();
		return user || null;
	}

	async verifyPassword(
		plainPassword: string,
		hashedPassword: string,
	): Promise<boolean> {
		return bcrypt.compare(plainPassword, hashedPassword);
	}
}
