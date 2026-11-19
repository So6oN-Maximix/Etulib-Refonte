import { prisma } from "./prisma";

export async function getLessonAccess(user: NonNullable<App.Locals["user"]>, lessonId: number) {
    if (!user?.id || !Number.isInteger(lessonId)) return null;
    return prisma.lesson.findFirst({
        where: {
            id: lessonId,
            OR: [
                { tutor: { userId: user.id } },
                { student: { userId: user.id } },
                { student: { parent: { userId: user.id } } }
            ]
        },
        select: { id: true }
    });
}