import { error } from "@sveltejs/kit";
import { prisma } from "#lib/server/prisma";
import type { PageServerLoad } from "./$types";
import { formatPhoneUX } from "#lib/utils";

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user || locals.user.role !== "STUDENT") throw error(403, "Accès refusé");

    const [studentProfile] = await Promise.all([
        prisma.studentProfile.findUnique({
            where: { userId: locals.user.id },
            select: { phone: true, city: true, level: true }
        })
    ]);

    const createdDate = new Date(locals.user.createdAt);

    if (!studentProfile) return {
        user: { ...locals.user, creationDate: createdDate.toLocaleDateString("fr-FR", { month: "long", year: "numeric" }) },
        student: { phone: "", city: "", level: "" }
    }

    return {
        user: { ...locals.user, creationDate: createdDate.toLocaleDateString("fr-FR", { month: "long", year: "numeric" }) },
        student: { ...studentProfile, phone: formatPhoneUX(studentProfile.phone || "") }
    }
};