import { defineEnvVars } from "@sveltejs/kit/env";

export const variables = defineEnvVars({
	MESSAGE_KEY_V1: {},
	UPLOAD_DIR: {}
});