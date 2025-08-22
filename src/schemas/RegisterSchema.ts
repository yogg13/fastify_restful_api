// JSON Schema for Register
export const registerSchema = {
	body: {
		type: "object",
		required: ["username", "email", "password"],
		properties: {
			username: { type: "string", minLength: 3 },
			email: { type: "string", format: "email" },
			password: { type: "string", minLength: 6 },
		},
	},
};
