import { error } from "@sveltejs/kit";
import { prisma } from "#lib/server/prisma";
import type { PageServerLoad } from "./$types";
import { formatPhoneUX } from "#lib/utils";
import { summarizeTutors } from "#lib/studentTutors.ts";

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user || locals.user.role !== "STUDENT") throw error(403, "Accès refusé");

    const [studentProfile, getLessons, getAllLessons] = await Promise.all([
        prisma.studentProfile.findUnique({
            where: { userId: locals.user.id },
            select: { phone: true, city: true, level: true }
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
        student: { phone: "", city: "", level: "" },
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