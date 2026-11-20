import { error, fail } from "@sveltejs/kit";
import { prisma } from "#lib/server/prisma";
import type { PageServerLoad, Actions } from "./$types";
import { decryptMessage, encryptMessage } from "#lib/server/crypto.ts";
import { formatMsgDate } from "#lib/utils.ts";

async function loadMessages(convId: number) {
    const messages = await prisma.message.findMany({
        where: { conversationId: convId },
        select: { id: true, senderId: true, body: true, createdAt: true },
        orderBy: { createdAt: "asc" }
    });

    return messages.map((msg) => ({
        ...msg,
        body: decryptMessage(msg.body, convId),
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
            where: { studentId: { in: children.map((child) => child.id) } },
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
            where: { id: { in: childConversations.map((conv) => conv.tutorId) } },
            select: { id: true, user: { select: { firstName: true, lastName: true } } }
        });

        const tutorById = Object.fromEntries(tutorInfos.map((t) => [t.id, t]));
        const childNamesById = Object.fromEntries(children.map((child) => [child.id, child.user.firstName]));

        const entries = await Promise.all(childConversations.map(async (conv) => [conv.id, await loadMessages(conv.id)] as const));
        const messagesByConvId = Object.fromEntries(entries);

        return {
            conversations: childConversations.map((conv) => ({
                id: conv.id,
                lastMsg: buildLastMsg(conv.messages[0], conv.id),
                userId: conv.tutorId,
                userInfo: tutorById[conv.tutorId],
                childName: childNamesById[conv.studentId] ?? "",
                messages: messagesByConvId[conv.id] ?? [],
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
                select: { body: true, senderId: true, createdAt: true }
            }
        }
    });

    const infos = isTutor
        ? await prisma.studentProfile.findMany({
              where: { id: { in: getConversations.map((conv) => conv.studentId) } },
              select: { id: true, user: { select: { firstName: true, lastName: true } } }
          })
        : await prisma.tutorProfile.findMany({
              where: { id: { in: getConversations.map((conv) => conv.tutorId) } },
              select: { id: true, user: { select: { firstName: true, lastName: true } } }
          });

    const infoById = Object.fromEntries(infos.map((info) => [info.id, info]));

    const entries = await Promise.all(getConversations.map(async (conv) => [conv.id, await loadMessages(conv.id)] as const));
    const messagesByConvId = Object.fromEntries(entries);

    return {
        conversations: getConversations.map((conv) => {
            const otherId = isTutor ? conv.studentId : conv.tutorId;
            return {
                id: conv.id,
                lastMsg: buildLastMsg(conv.messages[0], conv.id),
                userId: otherId,
                userInfo: infoById[otherId],
                messages: messagesByConvId[conv.id] ?? [],
                readOnly: false,
                childName: ""
            };
        })
    };
};

export const actions: Actions = {
    sendMsg: async ({ request, locals }) => {
        const formData = await request.formData();

        const message = String(formData.get("message") ?? "").trim();
        const convId = Number(formData.get("convId") ?? 0);

        if (!convId || convId === 0) return fail(400, { error: "Conversation introuvable" });

        try {
            await prisma.message.create({
                data: {
                    conversationId: convId,
                    body: encryptMessage(message, convId),
                    senderId: locals.user?.profileId!
                }
            });
            return { success: true };
        } catch (error) { throw error }
    }
};