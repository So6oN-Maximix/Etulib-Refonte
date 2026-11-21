import { error } from "@sveltejs/kit";
import { prisma } from "#lib/server/prisma";
import { getLessonAccess } from "#lib/server/lessons";
import { readDecrypted } from "#lib/server/uploads";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ locals, url }) => {
    if (!locals.user) throw error(401, "Non connecté");

    const id = Number(url.searchParams.get("id"));
    if (!Number.isInteger(id) || id <= 0) throw error(400, "Document invalide");

    const attachment = await prisma.attachment.findUnique({
        where: { id },
        select: {
            filename: true,
            originalName: true,
            mimeType: true,
            lessonId: true,
            message: {
                select: {
                    conversationId: true,
                    conversation: {
                        select: {
                            tutorId: true,
                            studentId: true
                        }
                    }
                }
            }
        }
    });
    if (!attachment) throw error(404, "404-1: Document introuvable");

    let content: Buffer;

    if (attachment.lessonId != null) {
        if (!(await getLessonAccess(locals.user, attachment.lessonId))) throw error(404, "Document introuvable");
        try { content = await readDecrypted(attachment.filename, attachment.lessonId, "lessons"); }
        catch { throw error(500, "Impossible de lire ce document"); }
    } else if (attachment.message) {
        const { conversationId, conversation } = attachment.message;
        const { role, profileId } = locals.user;

        let hasAccess =
            (role === "TUTOR" && conversation.tutorId === profileId) ||
            (role === "STUDENT" && conversation.studentId === profileId);

        if (!hasAccess && role === "PARENT" && profileId) {
            const child = await prisma.studentProfile.findFirst({
                where: { id: conversation.studentId, parentId: profileId },
                select: { id: true }
            });
            hasAccess = Boolean(child);
        }

        if (!hasAccess) {
            console.log("DEBUG 404-2:", { role, profileId, conversation });
            throw error(404, "404-2: Document introuvable");
        }

        try { content = await readDecrypted(attachment.filename, conversationId, "messages"); }
        catch (err) {
            console.error("Erreur lecture pièce jointe message:", {
                err,
                filename: attachment.filename,
                conversationId
            });
            throw error(500, "Impossible de lire ce document");
        }
    } else {
        console.log("DEBUG 404-3:", attachment);
        throw error(404, "404-3: Document introuvable");
    }

    const asciiName = attachment.originalName.replace(/[^\x20-\x7e]/g, "_").replace(/["\\]/g, "_");

    return new Response(new Uint8Array(content), {
        headers: {
            "Content-Type": attachment.mimeType,
            "Content-Length": String(content.length),
            "Content-Disposition": `attachment; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(attachment.originalName)}`,
            "X-Content-Type-Options": "nosniff",
            "Cache-Control": "private, no-store"
        }
    });
};