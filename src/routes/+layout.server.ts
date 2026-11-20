import { prisma } from '#lib/server/prisma.ts';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
    if (!locals.user || !locals.user.profileId || !["STUDENT", "TUTOR"].includes(locals.user.role)) {
        return {
            user: locals.user,
            unreadMessagesCount: 0
        };
    }

    const unreadMessagesCount = await prisma.message.count({
        where: {
            isRead: false,
            senderId: { notIn: [0, locals.user.id] },
            conversation: locals.user.role === "TUTOR"
                ? { tutorId: locals.user.profileId }
                : { studentId: locals.user.profileId }
        }
    });

    return {
        user: locals.user,
        unread: unreadMessagesCount
    };
};