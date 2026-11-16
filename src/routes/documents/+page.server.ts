import { error } from "@sveltejs/kit";
import { prisma } from "#lib/server/prisma";
import type { PageServerLoad } from "./$types";
import { groupBySubject } from "#lib/documents";

export const load: PageServerLoad = async ({ locals, url }) => {
    if (!locals.user || !["STUDENT", "TUTOR"].includes(locals.user.role)) throw error(403, "Accès refusé");

    const isTutor = locals.user.role === "TUTOR";
    const idString = url.searchParams.get(isTutor ? "studentId" : "tutorId");
    const otherId = Number(idString);
    if (!idString || Number.isNaN(otherId)) throw error(400, isTutor ? "Identifiant de l'élève manquant ou invalide." : "Identifiant du professeur manquant ou invalide.");

    const myProfileId = locals.user.profileId!;

    const [getAllAttachments, contact] = await Promise.all([
        prisma.lesson.findMany({
            where: isTutor ? { tutorId: myProfileId, studentId: otherId } : { tutorId: otherId, studentId: myProfileId },
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
        isTutor
            ? prisma.studentProfile
                .findUnique({ where: { id: otherId }, select: { user: { select: { id: true, firstName: true, lastName: true } } } })
                .then((profile) => profile?.user ?? null)
            : prisma.user.findFirst({
                where: { tutor: { id: otherId } },
                select: { id: true, firstName: true, lastName: true }
            })
    ]);

    if (getAllAttachments.length === 0 || !contact) throw error(404, "Aucun cours avec cette personne");

    const attachments = groupBySubject(getAllAttachments);
    const totalAttachments = attachments.reduce((total, subject) => total + subject.attachmentCount, 0);

    return {
        attachments,
        userId: locals.user.id,
        isTutor,
        contact,
        totalAttachments
    };
};