import { error, fail, redirect } from "@sveltejs/kit";
import { prisma } from "#lib/server/prisma";
import type { PageServerLoad, Actions } from "./$types";

export const load: PageServerLoad = async ({ url }) => {
    const idString = url.searchParams.get("id");

    const id = Number(idString);
    if (!idString || Number.isNaN(id)) throw error(400, "Identifiant du professeur manquant ou invalide.");

    const [tutorUserProfile, tutorBio, tutorCourse, tutorExp, getAvailibilities, getTakenLessons] = await Promise.all([
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
        }),
        prisma.lesson.findMany({
            where: { tutorId: id },
            select: { id: true, courseId: true, startDate: true},
            orderBy: { startDate: "asc"}
        })
    ]);

    if (!tutorUserProfile) throw error(400, "Professeur introuvable");
    
    const createdDate = new Date(tutorUserProfile.createdAt);

    return {
        user: { ...tutorUserProfile, creationDate: createdDate.toLocaleDateString("fr-FR", { month: "long", year: "numeric" }) },
        bio: tutorBio ? tutorBio.bio : "",
        courses: tutorCourse,
        exp: tutorExp,
        availibilities: getAvailibilities,
        takenLessons: getTakenLessons
    };
};

export const actions: Actions = {
    reserve: async ({ request, locals, cookies }) => {
        if (!locals.user || !["PARENT", "STUDENT"].includes(locals.user.role)) return fail(403, { action: "reserve", error: "Non autorisé" });

        const formData = await request.formData();

        const id = Number(formData.get("courseId") ?? 0);
        const date = String(formData.get("date") ?? "").trim();
        const startMin = Number(formData.get("startMin") ?? 0);
        
        const startDate = (new Date(date));
        startDate.setMinutes(startMin);

        if (startDate < new Date()) return fail(400, { action: "reserve", error: "Ce créneau est déjà passé" });
        if (!Number.isInteger(id) || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isInteger(startMin) || startMin % 30 !== 0) return fail(400, { action: "reserve", error: "Créneau invalide" });
        if (id === 0) return fail(400, { action: "reserve", error: "Identifiant du cours invalide"});

        try {
            const course = await prisma.course.findUnique({
                where: { id },
                select: { id: true, tutorId: true, duration: true, subject: true }
            });
            if (!course) return fail(404, { action: "reserve", error: "Cours introuvable." });

            const weekday = (new Date(`${date}T00:00:00Z`).getUTCDay() + 6) % 7;
            const available = await prisma.availibility.findFirst({
                where: {
                    tutorId: course.tutorId,
                    day: weekday,
                    startMin: { lte: startMin },
                    endMin: { gte: startMin + course.duration }
                }
            });
            if (!available) return fail(400, { action: "reserve", error: "Ce créneau n'est plus disponible" });

            const taken = await prisma.lesson.findFirst({
                where: {
                    tutorId: course.tutorId,
                    courseId: id,
                    startDate
                }
            });
            if (taken) return fail(400, { action: "reserve", error: "Ce cours est déjà réservé à cette heure" });

            const [ , tutorInfos] = await Promise.all([
                await prisma.lesson.create({
                    data: {
                        studentId: locals.user.profileId!,
                        tutorId: course.tutorId,
                        courseId: id,
                        startDate
                    }
                }),
                await prisma.user.findFirst({
                    where: { tutor: { id: course.tutorId } },
                    select: { firstName: true, lastName: true }
                })
            ]);
            
            cookies.set("flash", JSON.stringify({ tutor: tutorInfos, subject: course.subject, startDate, duration: course.duration }), { path: "/reserve_success", maxAge: 10 });
            redirect(303, "/reserve_success");
        } catch (error) { throw error };
    }
};