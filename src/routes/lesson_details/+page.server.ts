import { error, fail } from "@sveltejs/kit";
import { prisma } from "#lib/server/prisma";
import type { PageServerLoad, Actions } from "./$types";
import { getLessonAccess } from "#lib/server/lessons.ts";
import { MAX_FILE_SIZE, MAX_FILES_PER_UPLOAD, cleanFileName, detectType, removeStored, saveEncrypted } from "#lib/server/uploads";

export const load: PageServerLoad = async ({ locals, url }) => {
    if (!locals.user || !["STUDENT", "TUTOR"].includes(locals.user.role)) throw error(403, "Accès refusé");

    const idString = url.searchParams.get("id");

    const LessonId = Number(idString);
    if (!idString || Number.isNaN(LessonId)) throw error(400, "Identifiant du cours manquant ou invalide");

    if (!(await getLessonAccess(locals.user, LessonId))) throw error(403, "Accès refusé");

    const myId = locals.user.id;

    const [LessonInfos, getAttachments] = await Promise.all([
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
        }),
        prisma.attachment.findMany({
            where: { lessonId: LessonId },
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                originalName: true,
                size: true,
                createdAt: true,
                userId: true,
                user: { select: { firstName: true } }
            }
        })
    ]);

    if (!LessonInfos) throw error(400, "Lesson introuvable");

    const startDate = new Date(LessonInfos.startDate);
    const endDate = new Date(startDate.getTime() + LessonInfos.course.duration * 60_000);
    const textStartDate = startDate.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })

    return {
        lesson: { ...LessonInfos, startDate, endDate, textStartDate },
        files: getAttachments.map(({ userId, user, ...file }) => ({
            ...file,
            mine: userId === myId,
            sender: userId === myId ? "vous" : user.firstName
        }))
    }
};

async function authorize(locals: App.Locals, url: URL) {
    const lessonId = Number(url.searchParams.get("id"));
    if (!locals.user || !(await getLessonAccess(locals.user, lessonId))) return null;
    return { user: locals.user, lessonId };
}

export const actions: Actions = {
    uploadFile: async ({ request, locals, url }) => {
        const auth = await authorize(locals, url);
        if (!auth) return fail(403, { action: "upload", error: "Accès refusé" });

        const files = (await request.formData()).getAll("document").filter((f): f is File => f instanceof File && f.size > 0);
        if (files.length === 0) return fail(400, { action: "upload", error: "Aucun fichier reçu" });
        if (files.length > MAX_FILES_PER_UPLOAD) return fail(400, { action: "upload", error: `${MAX_FILES_PER_UPLOAD} fichiers maximum à la fois` });

        const errors: string[] = [];
        for (const file of files) {
            const name = cleanFileName(file.name);
            if (file.size > MAX_FILE_SIZE) {
                errors.push(`${name} : fichier trop lourd (10 Mo maximum)`);
                continue;
            }

            const content = Buffer.from(await file.arrayBuffer());
            const mimeType = detectType(content, name);
            if (!mimeType) {
                errors.push(`${name} : format non accepté (PDF, images ou documents Word)`);
                continue;
            }

            const filename = await saveEncrypted(content, auth.lessonId);
            try {
                await prisma.attachment.create({
                    data: { originalName: name, filename, mimeType, size: content.length, userId: auth.user.id, lessonId: auth.lessonId }
                });
            } catch (error) {
                await removeStored(filename);
                throw error;
            }
        }

        if (errors.length > 0) return fail(400, { action: "upload", error: errors.join(" · ") });
        return { action: "upload", success: true };
    },

    deleteFile: async ({ request, locals, url }) => {
        const auth = await authorize(locals, url);
        if (!auth) return fail(403, { action: "delete", error: "Accès refusé" });

        const id = Number((await request.formData()).get("id"));
        if (!Number.isInteger(id)) return fail(400, { action: "delete", error: "Document invalide" });

        const attachment = await prisma.attachment.findFirst({
            where: { id, lessonId: auth.lessonId, userId: auth.user.id },
            select: { id: true, filename: true }
        });
        if (!attachment) return fail(404, { action: "delete", error: "Document introuvable" });

        await prisma.attachment.delete({ where: { id: attachment.id } });
        await removeStored(attachment.filename);
        return { action: "delete", success: true };
    }
};