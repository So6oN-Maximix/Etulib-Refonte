import { error } from "@sveltejs/kit";
import { prisma } from "#lib/server/prisma";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ url }) => {
    const idString = url.searchParams.get("id");

    const id = Number(idString);
    if (!idString || Number.isNaN(id)) throw error(400, "Identifiant du professeur manquant ou invalide.");

    const [tutorUserProfile, tutorBio, tutorCourse, tutorExp, getAvailibilities] = await Promise.all([
        prisma.user.findFirst({
            where: { tutor: { id } },
            select: { firstName: true, lastName: true, createdAt: true }
        }),
        prisma.tutorProfile.findUnique({
            where: { id },
            select: { bio: true }
        }),
        prisma.course.findMany({
            where: { tutorId: id },
            select: { id: true, title: true, subject: true, bio: true, level: true, hourlyRate: true, duration: true, mode: true}
        }),
        prisma.experience.findMany({
            where: { tutorId: id },
            select: { id: true, title: true, location: true, startYear: true, endYear: true },
            orderBy: [{ endYear: { sort: "desc", nulls: "first" } }, { startYear: "desc" }]
        }),
        prisma.availibility.findMany({
            where: { tutorId: id },
            select: { id: true, day: true, startMin: true, endMin: true },
            orderBy: [{ day: "asc" }, { startMin: "asc" }]
        })
    ]);

    if (!tutorUserProfile) throw error(400, "Professeur introuvable");
    
    const createdDate = new Date(tutorUserProfile.createdAt);

    return {
        user: { ...tutorUserProfile, creationDate: createdDate.toLocaleDateString("fr-FR", { month: "long", year: "numeric" }) },
        bio: tutorBio ? tutorBio.bio : "",
        courses: tutorCourse,
        exp: tutorExp,
        availibilities: getAvailibilities
    };
};