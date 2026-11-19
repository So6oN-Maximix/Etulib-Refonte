import { error } from "@sveltejs/kit";
import { prisma } from "./prisma";

export async function resolveStudent(locals: App.Locals, rawId: string | null) {
    const user = locals.user;
    if (!user) throw error(401, "Non connecté");

    if (user.role === "STUDENT") return { user, profileId: user.profileId! };

    if (user.role === "PARENT") {
        let id = rawId ? Number(rawId) : NaN;
        if (!Number.isInteger(id) || id <= 0) {
            const children = await prisma.studentProfile.findMany({
                where: { parentId: user.profileId! },
                select: { id: true },
                take: 2
            });
            if (children.length !== 1) throw error(400, "Enfant non précisé");
            id = children[0].id;
        }

        const child = await prisma.studentProfile.findFirst({
            where: { id, parentId: user.profileId! },
            select: {
                id: true,
                user: { select: { id: true, firstName: true, lastName: true, email: true, role: true, createdAt: true } }
            }
        });
        if (!child) throw error(403, "Enfant non rattaché à ce compte");

        return { user: child.user, profileId: child.id };
    }

    throw error(403, "Accès refusé");
}