import { defineEnvVars } from "@sveltejs/kit/env";

export const variables = defineEnvVars({
	DATABASE_URL: {},
	MESSAGE_KEY_V1: {},
	UPLOAD_DIR: {}
});