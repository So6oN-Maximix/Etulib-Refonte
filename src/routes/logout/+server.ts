import { prisma } from "#lib/server/prisma";
import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ cookies, locals }) => {
    const token = cookies.get("session");
    if (token) {
        await prisma.session.deleteMany({ where: { id: token } });
        cookies.delete("session", { path: "/" });
    }
    locals.user = null;
    throw redirect(303, "/");
};