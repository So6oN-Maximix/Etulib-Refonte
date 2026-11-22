import { error, fail } from "@sveltejs/kit";
import { prisma } from "#lib/server/prisma";
import type { PageServerLoad, Actions } from "./$types";
import { decryptMessage, encryptMessage } from "#lib/server/crypto";
import { formatMsgDate } from "#lib/utils";
import { MAX_FILE_SIZE, MAX_FILES_PER_UPLOAD, cleanFileName, detectType, removeStored, saveEncrypted } from "#lib/server/uploads";

async function loadMessages(convId: number) {
    const messages = await prisma.message.findMany({
        where: { conversationId: convId },
        select: {
            id: true,
            senderId: true,
            body: true,
            isRead: true,
            createdAt: true,
            attachments: {
                select: {
                    id: true,
                    originalName: true,
                    filename: true,
                    mimeType: true,
                    size: true
                }
            }
        },
        orderBy: { createdAt: "asc" }
    });

    return messages.map(msg => ({
        ...msg,
        body: msg.body ? decryptMessage(msg.body, convId) : "",
        sendTime: formatMsgDate(msg.createdAt)
    }));
}

function buildLastMsg(
    latest: { body: string; senderId: number; createdAt: Date } | undefined,
    convId: number
) {
    if (!latest) return null;
    return {
        ...latest,
        body: decryptMessage(latest.body, convId),
        sendTime: formatMsgDate(latest.createdAt)
    };
}

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user || !["STUDENT", "TUTOR", "PARENT"].includes(locals.user.role)) { throw error(403, "Rôle non autorisé"); }

    const profileId = locals.user.profileId;
    if (!profileId) { return { conversations: [] }; }

    if (locals.user.role === "PARENT") {
        const children = await prisma.studentProfile.findMany({
            where: { parentId: profileId },
            select: { id: true, user: { select: { firstName: true } } }
        });

        const childConversations = await prisma.conversation.findMany({
            where: { studentId: { in: children.map(child => child.id) } },
            select: {
                id: true,
                tutorId: true,
                studentId: true,
                messages: {
                    take: 1,
                    orderBy: { createdAt: "desc" },
                    select: { body: true, senderId: true, createdAt: true }
                }
            }
        });

        const tutorInfos = await prisma.tutorProfile.findMany({
            where: { id: { in: childConversations.map(conv => conv.tutorId) } },
            select: { id: true, user: { select: { firstName: true, lastName: true } } }
        });

        const tutorById = Object.fromEntries(tutorInfos.map(t => [t.id, t]));
        const childNamesById = Object.fromEntries(children.map(child => [child.id, child.user.firstName]));

        const entries = await Promise.all(childConversations.map(async conv => [conv.id, await loadMessages(conv.id)] as const));
        const messagesByConvId = Object.fromEntries(entries);

        return {
            conversations: childConversations.map(conv => ({
                id: conv.id,
                lastMsg: buildLastMsg(conv.messages[0], conv.id),
                userId: conv.tutorId,
                userInfo: tutorById[conv.tutorId],
                userType: "Professeur",
                childName: childNamesById[conv.studentId] ?? "",
                messages: messagesByConvId[conv.id] ?? [],
                unread: 0,
                readOnly: true
            }))
        };
    }

    const isTutor = locals.user.role === "TUTOR";

    const getConversations = await prisma.conversation.findMany({
        where: isTutor ? { tutorId: profileId } : { studentId: profileId },
        select: {
            id: true,
            studentId: isTutor,
            tutorId: !isTutor,
            messages: {
                take: 1,
                orderBy: { createdAt: "desc" },
                select: { body: true, senderId: true, isRead: true, createdAt: true }
            }
        }
    });

    const infos = isTutor
        ? await prisma.studentProfile.findMany({
              where: { id: { in: getConversations.map(conv => conv.studentId) } },
              select: { id: true, user: { select: { firstName: true, lastName: true } } }
          })
        : await prisma.tutorProfile.findMany({
              where: { id: { in: getConversations.map(conv => conv.tutorId) } },
              select: { id: true, user: { select: { firstName: true, lastName: true } } }
          });

    const infoById = Object.fromEntries(infos.map(info => [info.id, info]));

    const entries = await Promise.all(getConversations.map(async conv => [conv.id, await loadMessages(conv.id)] as const));
    const messagesByConvId = Object.fromEntries(entries);

    return {
        conversations: getConversations.map(conv => {
            const otherId = isTutor ? conv.studentId : conv.tutorId;
            const convMessages = messagesByConvId[conv.id] ?? [];
            const unreadCount = convMessages.filter(msg => !msg.isRead && ![0, locals.user?.profileId].includes(msg.senderId)).length;
            return {
                id: conv.id,
                lastMsg: buildLastMsg(conv.messages[0], conv.id),
                userId: otherId,
                userInfo: infoById[otherId],
                userType: isTutor ? "Eleve" : "Professeur",
                messages: convMessages,
                unread: unreadCount,
                readOnly: false,
                childName: ""
            };
        })
    };
};

export const actions: Actions = {
    sendMsg: async ({ request, locals }) => {
        if (!locals.user || !locals.user.profileId || locals.user.role === "PARENT") return fail(403, { message: "Non autorisé" });
        const formData = await request.formData();
        const convId = Number(formData.get("convId"));
        const text = String(formData.get("message") ?? "").trim();
        const files = formData.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);

        if (!text && files.length === 0) return fail(400, { message: "Message vide" });
        if (!convId || convId === 0) return fail(400, { error: "Conversation introuvable" });
        if (files.length > MAX_FILES_PER_UPLOAD) return fail(400, { message: "Trop de fichiers" });

        const savedAttachments: {
            originalName: string;
            filename: string;
            mimeType: string;
            size: number;
            user: { connect: { id: number } };
        }[] = [];

        try {
            for (const file of files) {
                if (file.size > MAX_FILE_SIZE) { throw new Error("Fichier trop volumineux"); }
                const buffer = Buffer.from(await file.arrayBuffer());
                const mimeType = detectType(buffer, file.name);
                if (!mimeType) { throw new Error("Type de fichier non autorisé"); }

                const filename = await saveEncrypted(buffer, convId, "messages");
                savedAttachments.push({
                    originalName: cleanFileName(file.name),
                    filename,
                    mimeType,
                    size: buffer.length,
                    user: { connect: { id: locals.user.id } }
                });
            }

            const conv = await prisma.conversation.findFirst({
                where: {
                    id: convId,
                    OR: [{ tutorId: locals.user.profileId }, { studentId: locals.user.profileId }]
                },
                select: { id: true }
            });
            if (!conv) return fail(403, { message: "Conversation introuvable" });

            await prisma.message.create({
                data: {
                    conversationId: convId,
                    body: text ? encryptMessage(text, convId) : "",
                    senderId: locals.user.profileId,
                    attachments: savedAttachments.length > 0 ? { create: savedAttachments } : undefined
                }
            });

            return { success: true };
        } catch (err) {
            await Promise.all(savedAttachments.map(att => removeStored(att.filename, "messages")));
            return fail(400, { message: err instanceof Error ? err.message : "Erreur lors de l'envoi" });
        }
    },
    markAsRead: async ({ request, locals }) => {
        if (!locals.user || locals.user.role === "PARENT") return { success: true };

        const formData = await request.formData();
        const convId = Number(formData.get("convId"));
        if (!convId) return fail(400, { message: "ID invalide" });

        try {
            await prisma.message.updateMany({
                where: {
                    conversationId: convId,
                    isRead: false,
                    senderId: { notIn: [0, locals.user.profileId!] }
                },
                data: { isRead: true }
            });
        } catch (error) { throw error }
    }
};