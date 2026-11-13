import { fail, redirect } from "@sveltejs/kit";
import bcrypt from "bcrypt";
import { prisma } from "#lib/server/prisma";
import type { Actions } from "./$types";

const ROLES = ["parent", "student", "tutor"] as const;
type Role = (typeof ROLES)[number];

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const data = await request.formData();

		const role = String(data.get("role") ?? "");
		const firstName = String(data.get("firstName") ?? "").trim();
		const lastName = String(data.get("lastName") ?? "").trim();
		const email = String(data.get("email") ?? "").trim().toLowerCase();
		const password = String(data.get("password") ?? "");
		const birthDateRaw = String(data.get("birthDate") ?? "");

		const values = { role, firstName, lastName, email, birthDate: birthDateRaw };

		if (!ROLES.includes(role as Role)) return fail(400, { error: "Rôle invalide", values });
		if (!firstName || !lastName) return fail(400, { error: "Prénom et nom obligatoires", values });
		if (!/^\S+@\S+\.\S+$/.test(email)) return fail(400, { error: "Adresse e-mail invalide", values });
		if (password.length < 8) return fail(400, { error: "Le mot de passe doit faire au moins 8 caractères", values });
		if (Buffer.byteLength(password) > 72) return fail(400, { error: "Le mot de passe est trop long (72 caractères max)", values });

		let birthDate: Date | null = null;
		if (role === "student") {
			birthDate = new Date(birthDateRaw);
			if (!birthDateRaw || Number.isNaN(birthDate.getTime())) return fail(400, { error: "Date de naissance invalide.", values });
		}

		const passwordHash = await bcrypt.hash(password, 12);

		try {
			const userAddedId = await prisma.user.create({
				data: {
					email,
					passwordHash,
					firstName,
					lastName,
					role: role.toUpperCase() as "PARENT" | "STUDENT" | "TUTOR",
					...(role.toUpperCase() === "TUTOR" && { tutor: { create: {} } }),
					...(role.toUpperCase() === "PARENT" && { parent: { create: {} } }),
					...(role.toUpperCase() === "STUDENT" && birthDate && { student: { create: { birthDate } } })
				},
				select: { id: true }
			});

            cookies.set("user_id", String(userAddedId.id), {
                path: "/",
                httpOnly: true,
                sameSite: "lax",
                secure: process.env.NODE_ENV === "production",
                maxAge: 60 * 60 * 24
            });
		} catch (error) {
			if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") return fail(400, { error: "Un compte existe déjà avec cet e-mail.", values });
			throw error;
		}

		redirect(303, `/${role.toLowerCase()}_profile`);
	}
};