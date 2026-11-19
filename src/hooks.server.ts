import { prisma } from "#lib/server/prisma";
import type { Handle } from "@sveltejs/kit/hooks";
import { resolveStudent } from "#lib/server/student.ts";

export const handle: Handle = async ({ event, resolve }) => {
    const userIdStr = event.cookies.get("user_id");
    event.locals.user = null;

    if (userIdStr) {
        const userId = Number(userIdStr);

        if (!Number.isNaN(userId)) {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: {
                    student: true,
                    parent: true,
                    tutor: true
                }
            });

            if (user) {
                let profileId = null;
                
                if (user.role === "PARENT") profileId = user.parent?.id;
                else if (user.role === "STUDENT") profileId = user.student?.id;
                else if (user.role === "TUTOR") profileId = user.tutor?.id;

                const { passwordHash, ...safeUser } = user;
                event.locals.user = { ...safeUser, profileId };
            }
        }
    }

    const url = event.url;
    const protectedRoutes = ["/parent_profile", "/student_profile", "/tutor_profile"];
    const isProtected = protectedRoutes.some(route => url.pathname.startsWith(route));

    if (isProtected && !event.locals.user) {
        return new Response(null, {
            status: 303,
            headers: { Location: "/login" }
        });
    }

    if (url.pathname.startsWith("/student_profile")) event.locals.student = await resolveStudent(event.locals, url.searchParams.get("id"));

    return await resolve(event);
};