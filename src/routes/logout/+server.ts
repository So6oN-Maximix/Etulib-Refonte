import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ cookies, locals }) => {
    cookies.delete("user_id", { path: "/" });
    locals.user = null;
    throw redirect(303, "/");
};