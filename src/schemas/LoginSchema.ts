// JSON Schema for Login
export const loginSchema = {
	body: {
		type: "object",
		required: ["username", "password"],
		properties: {
			username: { type: "string" },
			password: { type: "string" },
		},
	},
};
