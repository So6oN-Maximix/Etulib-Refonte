import { error, fail } from "@sveltejs/kit";
import { prisma } from "#lib/server/prisma";
import type { PageServerLoad, Actions } from "./$types";
import { formatPhoneUX } from "#lib/utils";
import { minutesToTime, parseRanges, timeToMinutes } from "#lib/planner";
import { summarizeStudent } from "#lib/studentTutors.ts";

const LEVELS = ["PRIMAIRE", "COLLEGE", "LYCEE", "SUP"] as const;
type Level = (typeof LEVELS)[number];
const MODES = ["TOUS", "EN_LIGNE", "DOMICILE"] as const;
type Mode = (typeof MODES)[number];

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user || locals.user.role !== "TUTOR") throw error(403, "Accès refusé");

    const [tutorProfile, tutorExp, tutorCourse, getAvailibilities, getAllLessons] = await Promise.all([
        prisma.tutorProfile.findUnique({
            where: { userId: locals.user.id },
            select: { id: true, phone: true, city: true, cityName: true, bio: true }
        }),
        prisma.experience.findMany({
            where: { tutorId: locals.user.profileId! },
            select: { id: true, title: true, location: true, startYear: true, endYear: true },
            orderBy: [{ endYear: { sort: "desc", nulls: "first" } }, { startYear: "desc" }]
        }),
        prisma.course.findMany({
            where: {tutorId: locals.user.profileId!},
            select: { id: true, title: true, subject: true, bio: true, level: true, hourlyRate: true, duration: true, mode: true}
        }),
        prisma.availibility.findMany({
            where: { tutorId: locals.user.profileId! },
            select: { id: true, day: true, startMin: true, endMin: true },
            orderBy: [{ day: "asc" }, { startMin: "asc" }]
        }),
        prisma.lesson.findMany({
            where: { tutorId: locals.user.profileId! },
            select: {
                id: true,
                studentId: true,
                startDate: true,
                student: {
                    select: {
                        user: {
                            select: {
                                firstName: true,
                                lastName: true
                            }
                        }
                    }
                },
                course: {
                    select: {
                        title: true,
                        subject: true,
                        duration: true,
                        mode: true
                    }
                }
            },
            orderBy: { startDate: "asc" }
        })
    ]);

    const createdDate = new Date(locals.user.createdAt);
    const allFormattedLessons = getAllLessons.map((lesson) => {
        const startDate = new Date(lesson.startDate);
        const endDate = new Date(startDate.getTime() + lesson.course.duration * 60_000);
        const dateParts = startDate
            .toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })
            .split(" ");

        return {
            ...lesson,
            startDate,
            endDate,
            dateParts
        };
    });
    const upcomingLessons = allFormattedLessons.filter(lesson => lesson.startDate >= new Date());

    if (!tutorProfile) return {
        user: { ...locals.user, creationDate: createdDate.toLocaleDateString("fr-FR", { month: "long", year: "numeric" }) },
        tutor: { id: 0, phone: "", city: "", cityName: "", bio: "" },
        exp: [],
        courses: [],
        availibilities: [],
        lessons: [],
        calendarLessons: [],
        students: [],
        subjects: []
    };

    return {
        user: { ...locals.user, creationDate: createdDate.toLocaleDateString("fr-FR", { month: "long", year: "numeric" }) },
        tutor: { ...tutorProfile, phone: formatPhoneUX(tutorProfile.phone || "") },
        exp: tutorExp,
        courses: tutorCourse,
        availibilities: getAvailibilities.map(availibility => {
            return {
                day: availibility.day,
                start: minutesToTime(availibility.startMin),
                end: minutesToTime(availibility.endMin)
            };
        }),
        lessons: upcomingLessons,
        calendarLessons: allFormattedLessons,
        students: summarizeStudent(getAllLessons),
        subjects: [...new Set(tutorCourse.map(course => course.subject))]
    };
};

export const actions: Actions = {
    addExp: async ({ request, locals}) => {
        if (!locals.user || locals.user.role !== "TUTOR") return fail(403, { action: "exp", error: "Non autorisé" });

        const formData = await request.formData();

        const title = String(formData.get("title") ?? "").trim();
        const location = String(formData.get("location") ?? "").trim();
        const startYear = Number(formData.get("startYear") ?? 1900);
        const endYear = formData.get("endYear") ? Number(formData.get("endYear") ?? 1900) : null;

        const values = { title, location, startYear, endYear };

        if (!title || !location || !startYear) return fail(400, { action: "exp", error: "Chams incomplets" });
        if (endYear && endYear < startYear) return fail(400, { action: "exp", error: "L'année de fin doit être ultérieure à l'année de début", values });

        try {
            await prisma.experience.create({
                data: {
                    tutorId: locals.user.profileId!,
                    title,
                    location,
                    startYear,
                    endYear
                }
            });
            return { action: "exp", success: true };
        } catch (error) { throw error; }
    },
    editExp: async ({ request, locals }) => {
        if (!locals.user || locals.user.role !== "TUTOR") return fail(403, { action: "exp", error: "Non autorisé" });

        const formData = await request.formData();

        const id = Number(formData.get("id") ?? 0);
        const title = String(formData.get("title") ?? "").trim();
        const location = String(formData.get("location") ?? "").trim();
        const startYear = Number(formData.get("startYear") ?? 1900);
        const endYear = formData.get("endYear") ? Number(formData.get("endYear") ?? 1900) : null;

        const values = { title, location, startYear, endYear };

        if (!title || !location || !startYear) return fail(400, { action: "exp", error: "Chams incomplets" });
        if (id === 0) return fail(400, { action: "exp", error: "Erreur de lecture de l'identifiant" });
        if (endYear && endYear < startYear) return fail(400, { action: "exp", error: "L'année de fin doit être ultérieure à l'année de début", values });
        
        try {
            await prisma.experience.update({
                where: { id },
                data: {
                    title,
                    location,
                    startYear,
                    endYear
                }
            });
            return { action: "exp", success: true };
        } catch (error) { throw error; }
    },
    addCourse: async ({ request, locals }) => {
        if (!locals.user || locals.user.role !== "TUTOR") return fail(403, { action: "course", error: "Non autorisé" });

        const formData = await request.formData();

        const title = String(formData.get("title") ?? "").trim();
        const subject = String(formData.get("subject") ?? "").trim();
        const level = String(formData.get("level") ?? "");
        const bio = String(formData.get("bio") ?? "").trim();
        const hourlyRate = Number(formData.get("hourlyRate") ?? 0);
        const duration = Number(formData.get("duration") ?? 30);
        const mode = String(formData.get("mode") ?? "");

        const values = { title, subject, level, bio, hourlyRate, duration, mode };

        if (!title || !subject || !level || !hourlyRate || !duration || !mode) return fail(400, { action: "course", error: "Champs invalides", values });
        if (!LEVELS.includes(level as Level)) return fail(400, { action: "course", error: "Niveau invalide", values });
        if (!MODES.includes(mode as Mode)) return fail(400, { action: "course", error: "Mode invalide", values });

        try {
            await prisma.course.create({
                data: {
                    tutorId: locals.user.profileId!,
                    title,
                    subject,
                    level: level as "PRIMAIRE" | "COLLEGE" | "LYCEE" | "SUP",
                    bio,
                    hourlyRate,
                    duration,
                    mode: mode as "TOUS" | "EN_LIGNE" | "DOMICILE"
                }
            });
            return { action: "course", success: true};
        } catch (error) { throw error; }
    },
    editCourse: async ({ request, locals }) => {
        if (!locals.user || locals.user.role !== "TUTOR") return fail(403, { action: "course", error: "Non autorisé" });

        const formData = await request.formData();

        const id = Number(formData.get("id") ?? 0);
        const title = String(formData.get("title") ?? "").trim();
        const subject = String(formData.get("subject") ?? "").trim();
        const level = String(formData.get("level") ?? "");
        const bio = String(formData.get("bio") ?? "").trim();
        const hourlyRate = Number(formData.get("hourlyRate") ?? 0);
        const duration = Number(formData.get("duration") ?? 30);
        const mode = String(formData.get("mode") ?? "");

        const values = { title, subject, level, bio, hourlyRate, duration, mode };

        if (!title || !subject || !level || !hourlyRate || !duration || !mode) return fail(400, { action: "course", error: "Champs invalides", values });
        if (id === 0) return fail(400, { action: "exp", error: "Erreur de lecture de l'identifiant" });
        if (!LEVELS.includes(level as Level)) return fail(400, { action: "course", error: "Niveau invalide", values });
        if (!MODES.includes(mode as Mode)) return fail(400, { action: "course", error: "Mode invalide", values });
        
        try {
            await prisma.course.update({
                where: { id },
                data: {
                    tutorId: locals.user.profileId!,
                    title,
                    subject,
                    level: level as "PRIMAIRE" | "COLLEGE" | "LYCEE" | "SUP",
                    bio,
                    hourlyRate,
                    duration,
                    mode: mode as "TOUS" | "EN_LIGNE" | "DOMICILE"
                }
            });
            return { action: "course", success: true};
        } catch (error) { throw error; }
    },
    saveBio: async ({ request, locals }) => {
        if (!locals.user || locals.user.role !== "TUTOR") return fail(403, { action: "course", error: "Non autorisé" });

        const formData = await request.formData();
        const bio = String(formData.get("bio") ?? "").trim();

        try {
            await prisma.tutorProfile.update({
                where: { userId: locals.user.id },
                data: { bio }
            });
            return { action: "bio", success: true };
        } catch (error) { throw error; }
    },
    saveAvailability: async ({ request, locals }) => {
        if (!locals.user || locals.user.role !== "TUTOR") return fail(403, { action: "planner", error: "Non autorisé"});

        const tutorId = locals.user.profileId!;
        const data = await request.formData();
        const ranges = parseRanges(String(data.get("planner") ?? "[]"));
        if (!ranges) return fail(400, { action: "planner", error: "Disponibilités invalides." });
    
        await prisma.$transaction([
            prisma.availibility.deleteMany({ where: { tutorId } }),
            prisma.availibility.createMany({
                data: ranges.map((r) => ({
                    tutorId,
                    day: r.day,
                    startMin: timeToMinutes(r.start),
                    endMin: timeToMinutes(r.end)
                }))
            })
        ]);
    
        return { success: true };
    }
};