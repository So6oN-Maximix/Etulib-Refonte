import { fail, redirect } from "@sveltejs/kit";
import bcrypt from "bcrypt";
import { prisma } from "#lib/server/prisma";
import type { Actions } from "./$types";
import { randomBytes } from "node:crypto";

const DUMMY_HASH = bcrypt.hashSync("dummy-password", 12);

export const actions: Actions = {
    default: async ({ request, cookies }) => {
		const data = await request.formData();

        const email = String(data.get("email") ?? "").trim();
        const password = String(data.get("password") ?? "");

        const value = { email };
        
		if (!email || !password) return fail(400, { error: "Champs invalides", value });

        try {
            const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
            const ok = await bcrypt.compare(password, user ? user.passwordHash : DUMMY_HASH);
            if (!user || !ok) return fail(400, { error: "Utilisateur ou mot de passe incorrect" });

            const token = randomBytes(32).toString("hex");
            const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

            await prisma.session.create({ data: { id: token, userId: user.id, expiresAt } });

            cookies.set("session", token, {
                path: "/",
                httpOnly: true,
                sameSite: "lax",
                secure: process.env.NODE_ENV === "production",
                maxAge: 60 * 60 * 24 * 7
            });

		    redirect(303, `/${user.role.toLowerCase()}_profile`);
        } catch (error) { throw error; }
    }
};