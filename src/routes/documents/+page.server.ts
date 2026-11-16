import { error } from "@sveltejs/kit";
import { prisma } from "#lib/server/prisma";
import type { PageServerLoad } from "./$types";
import { groupBySubject } from "#lib/documents";

export const load: PageServerLoad = async ({ locals, url }) => {
    if (!locals.user || !["STUDENT", "TUTOR"].includes(locals.user.role)) throw error(403, "Accès refusé");

    const idString = url.searchParams.get("id");
    const tutorId = Number(idString);
    if (!idString || Number.isNaN(tutorId)) throw error(400, "Identifiant du professeur manquant ou invalide.");

    const [getAllAttachments, getTutorInfos] = await Promise.all([
        prisma.lesson.findMany({
            where: { tutorId, studentId: locals.user.profileId! },
            select: {
                course: { select: { subject: true, duration: true } },
                attachments: {
                    select: {
                        id: true,
                        originalName: true,
                        size: true,
                        createdAt: true,
                        mimeType: true,
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true
                            }
                        }
                    },
                    orderBy: { createdAt: "desc" }
                },
                theme: true,
                startDate: true
            },
            orderBy: { startDate: "desc" }
        }),
        prisma.user.findFirst({
            where: { tutor: { id: tutorId } },
            select: {
                id: true,
                firstName: true,
                lastName: true
            }
        })
    ]);

    if (!getAllAttachments) return {
        attachments: [],
        userId: locals.user.id,
        tutor: getTutorInfos,
        totalAttachments: 0
    };

    const attachments = groupBySubject(getAllAttachments)
    let totalAttachments = 0
    attachments.forEach(attachment => totalAttachments += attachment.attachmentCount);

    return {
        attachments,
        userId: locals.user.id,
        tutor: getTutorInfos,
        totalAttachments
    };
};
