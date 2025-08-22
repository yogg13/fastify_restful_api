import { FastifyRequest, FastifyReply } from "fastify";
import { User, UserLogin, UserModel } from "../models/User";

// Type untuk request register
interface RegisterRequest extends FastifyRequest {
	body: User;
}

// Type untuk request login
interface LoginRequest extends FastifyRequest {
	body: UserLogin;
}

export class AuthController {
	private userModel: UserModel;

	constructor(db: any) {
		this.userModel = new UserModel(db);
	}

	// Handler untuk registrasi user
	async register(request: RegisterRequest, reply: FastifyReply) {
		try {
			const { username, email, password } = request.body;

			// Validasi input
			if (!username || !email || !password) {
				return reply
					.code(400)
					.send({ error: "Username, email, password diperlukan" });
			}

			// Cek username or email exist
			const existingUsername = await this.userModel.findByUsername(username);
			if (existingUsername) {
				return reply.code(409).send({ error: " Username sudah digunakan" });
			}

			const existingEmail = await this.userModel.findByEmail(email);
			if (existingEmail) {
				return reply.code(409).send({ error: "Email sudah digunakan" });
			}

			const user = await this.userModel.create({
				username,
				email,
				password,
			});

			//Hilangkan password dari response
			const { password: _, ...safeUser } = user;

			return reply.code(201).send(safeUser);
		} catch (error) {
			request.log.error(error);
			return reply
				.code(500)
				.send({ error: "Terjadi kesalahan saat mendaftar user" });
		}
	}

	async login(request: LoginRequest, reply: FastifyReply) {
		try {
			const { username, password } = request.body;

			if (!username || !password) {
				return reply
					.code(400)
					.send({ error: "Username dan Password diperlukan" });
			}

			const existingUser = await this.userModel.findByUsername(username);
			if (!existingUser) {
				return reply.code(401).send({ error: "Username atau Password salah" });
			}

			const isPasswordValid = await this.userModel.verifyPassword(
				password,
				existingUser.password,
			);
			if (!isPasswordValid) {
				return reply.code(401).send({ error: "Username atau Password salah" });
			}

			// Check if user has an id
			if (!existingUser.id) {
				return reply.code(500).send({ error: "User data tidak valid" });
			}

			// Buat token jwt
			const token = await reply.jwtSign({
				id: existingUser.id,
				username: existingUser.username,
				email: existingUser.email,
			});

			return reply.code(200).send({
				user: {
					id: existingUser.id,
					username: existingUser.username,
					email: existingUser.email,
				},
				token,
			});
		} catch (error) {
			request.log.error(error);
			return reply.code(500).send({ error: "Terjadi kesalahan saat login" });
		}
	}

	async getProfile(request: FastifyRequest, reply: FastifyReply) {
		try {
			const userId = request.user.id | 0;

			const user = await this.userModel.findById(userId);
			if (!user) {
				return reply.code(404).send({ error: "User tidak ditemukan" });
			}

			//Hilangkan password dari response
			const { password: _, ...safeUser } = user;
			return reply.code(200).send(safeUser);
		} catch (error) {
			request.log.error(error);
			return reply
				.code(500)
				.send({ error: "Terjadi kesalahan saat mengambil profil" });
		}
	}
}
