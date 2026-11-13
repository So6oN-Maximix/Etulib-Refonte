import { error, fail } from "@sveltejs/kit";
import { prisma } from "#lib/server/prisma";
import bcrypt from "bcrypt";
import type { PageServerLoad, Actions } from "./$types";
import { formatPhoneUX } from "#lib/utils";

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user || locals.user.role !== "PARENT") throw error(403, "Accès refusé");

    const [parentProfile, getChildrens] = await Promise.all([
        prisma.parentProfile.findUnique({
            where: { userId: locals.user.id },
            select: { phone: true, city: true }
        }),
        prisma.studentProfile.findMany({
            where: { parent: { userId: locals.user.id } },
            select: {
                id: true,
                level: true,
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true
                    }
                }
            }
        })
    ]);

    const createdDate = new Date(locals.user.createdAt);

    if (!parentProfile) return {
        user: { ...locals.user, creationDate: createdDate.toLocaleDateString("fr-FR", { month: "long", year: "numeric" }) },
        parent: { phone: "", city: "" },
        childrens: []
    };

    return {
        user: { ...locals.user, creationDate: createdDate.toLocaleDateString("fr-FR", { month: "long", year: "numeric" }) },
        parent: { ...parentProfile, phone: formatPhoneUX(parentProfile.phone || "") },
        childrens: getChildrens
    };
};

export const actions: Actions = {
    addChild: async ({ request, locals }) => {
        if (!locals.user || locals.user.role !== "PARENT") return fail(403, { error: "Non autorisé" });

        const formData = await request.formData();
        const firstName = String(formData.get("firstName") ?? "").trim();
        const level = String(formData.get("level") ?? "");
        const email = String(formData.get("email")).trim();
        const birthDateRaw = String(formData.get("birthDate") ?? "").trim();
        const password = String(formData.get("password") ?? "");

        const values = { firstName, level, email, birthDate: birthDateRaw };
        
        if (!firstName) return fail(400, { error: "Prénom obligatoire", values });
        if (!/^\S+@\S+\.\S+$/.test(email)) return fail(400, { error: "Adresse e-mail invalide", values });
        if (password.length < 8) return fail(400, { error: "Le mot de passe doit faire au moins 8 caractères", values });
        if (Buffer.byteLength(password) > 72) return fail(400, { error: "Le mot de passe est trop long (72 caractères max)", values });

        const birthDate = new Date(birthDateRaw);
        if (!birthDateRaw || Number.isNaN(birthDate.getTime())) return fail(400, { error: "Date de naissance invalide.", values });

        const passwordHash = await bcrypt.hash(password, 12);

        try {
            await prisma.user.create({
                data: {
                    email,
                    passwordHash,
                    firstName,
                    lastName: locals.user.lastName,
                    role: "STUDENT",
                    student: {
                        create: {
                            parentId: locals.user.profileId,
                            birthDate,
                            level: level.toUpperCase() as "PRIMAIRE" | "COLLEGE" | "LYCEE" | "SUP"
                        }
                    }
                }
            });
            return { success: true };
        } catch (error) {
            if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") return fail(400, { error: "Un compte existe déjà avec cet e-mail.", values });
            throw error;
        }
    }
};