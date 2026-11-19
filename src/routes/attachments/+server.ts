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
        select: { filename: true, originalName: true, mimeType: true, lessonId: true }
    });
    if (!attachment || attachment.lessonId == null) throw error(404, "Document introuvable");
    const lessonId: number = attachment.lessonId;
    if (!attachment || !(await getLessonAccess(locals.user, lessonId))) throw error(404, "Document introuvable");

    let content: Buffer;
    try { content = await readDecrypted(attachment.filename, lessonId); }
    catch { throw error(500, "Impossible de lire ce document"); }

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