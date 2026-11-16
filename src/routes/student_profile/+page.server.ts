import { error, fail } from "@sveltejs/kit";
import { prisma } from "#lib/server/prisma";
import type { PageServerLoad, Actions } from "./$types";
import { formatPhoneUX } from "#lib/utils";
import { summarizeTutors } from "#lib/studentTutors.ts";

const LEVELS = ["PRIMAIRE", "COLLEGE", "LYCEE", "SUP"] as const;
type Level = (typeof LEVELS)[number];

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user || locals.user.role !== "STUDENT") throw error(403, "Accès refusé");

    const [studentProfile, getLessons, getAllLessons] = await Promise.all([
        prisma.studentProfile.findUnique({
            where: { userId: locals.user.id },
            select: { phone: true, city: true, cityName: true, level: true }
        }),
        prisma.lesson.findMany({
            where: {
                studentId: locals.user.profileId!,
                startDate: { gte: new Date() }
            },
            select: {
                id: true,
                startDate: true,
                tutor: {
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
        }),
        prisma.lesson.findMany({
            where: { studentId: locals.user.profileId! },
            select: {
                tutorId: true,
                tutor: { select: { user: { select: { firstName: true, lastName: true } } } },
                course: { select: { subject: true } }
            }
        })
    ]);

    const createdDate = new Date(locals.user.createdAt);
    const formattedLessons = getLessons.map((lesson) => {
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

    if (!studentProfile) return {
        user: { ...locals.user, creationDate: createdDate.toLocaleDateString("fr-FR", { month: "long", year: "numeric" }) },
        student: { phone: "", city: "", cityName: "", level: "" },
        lessons: [],
        tutors: []
    }

    return {
        user: { ...locals.user, creationDate: createdDate.toLocaleDateString("fr-FR", { month: "long", year: "numeric" }) },
        student: { ...studentProfile, phone: formatPhoneUX(studentProfile.phone || "") },
        lessons: formattedLessons,
        tutors: summarizeTutors(getAllLessons)
    }
};

export const actions: Actions = {
    saveInfos: async ({ request, locals }) => {
        if (!locals.user || locals.user.role !== "STUDENT") return fail(403, { action: "exp", error: "Non autorisé" });

        const formData = await request.formData();

        const firstName = String(formData.get("firstName") ?? "").trim();
        const lastName = String(formData.get("lastName") ?? "").trim();
        const email = String(formData.get("email"));
        const phone = String(formData.get("phone") ?? "").trim();
        const city = String(formData.get("city") ?? "00000").trim();
        const cityName = String(formData.get("cityName") ?? "").trim();
        const level = String(formData.get("level"));

        let cleanPhone = phone.replace(/[\s.-]/g, "");
        if (/^0[1-9]\d{8}$/.test(phone)) cleanPhone = "+33" + phone.slice(1);
        const isValidPhone = cleanPhone === "" || /^(?:(?:\+|00)33|0)\s*[1-9](?:\s*\d{2}){4}$/.test(cleanPhone);

        if (!firstName || !lastName || !email) return fail(400, { action: "infos", error: "Champs invalides" });
        if (!LEVELS.includes(level as Level)) return fail(400, { action: "infos", error: "Niveau invalide" });
        if (!isValidPhone) return fail(400, { action: "infos", error: "Téléphone invalide" });
		if (!/^\S+@\S+\.\S+$/.test(email)) return fail(400, { error: "Adresse e-mail invalide" });

        try {
            await Promise.all([
                prisma.user.update({
                    where: { id: locals.user.id },
                    data: { email, firstName, lastName }
                }),
                prisma.studentProfile.update({
                    where: { userId: locals.user.id },
                    data: { phone: cleanPhone, city, cityName, level: level as Level }
                })
            ]);
            
            return { action: "infos", success: true };
        } catch (error) { throw error }
    }
};