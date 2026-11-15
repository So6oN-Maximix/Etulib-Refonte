import { error, fail } from "@sveltejs/kit";
import { prisma } from "#lib/server/prisma";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, url }) => {
    if (!locals.user || !["STUDENT", "TUTOR"].includes(locals.user.role)) throw error(403, "Accès refusé");

    const idString = url.searchParams.get("id");

    const LessonId = Number(idString);
    if (!idString || Number.isNaN(LessonId)) throw error(400, "Identifiant du cours manquant ou invalide");

    const [LessonInfos] = await Promise.all([
        prisma.lesson.findUnique({
            where: { id: LessonId },
            select: {
                startDate: true,
                course: true,
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
                tutor: {
                    select: {
                        id: true,
                        user: {
                            select: {
                                firstName: true,
                                lastName: true
                            }
                        }
                    }
                }
            }
        })
    ]);

    if (!LessonInfos) throw error(400, "Lesson introuvable");

    const startDate = new Date(LessonInfos.startDate);
    const endDate = new Date(startDate.getTime() + LessonInfos.course.duration * 60_000);
    const textStartDate = startDate.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })

    return {
        lesson: { ...LessonInfos, startDate, endDate, textStartDate }
    }
};