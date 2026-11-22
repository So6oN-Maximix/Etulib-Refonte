import { prisma } from "#lib/server/prisma";
import type { Handle } from "@sveltejs/kit/hooks";
import { resolveStudent } from "#lib/server/student.ts";

export const handle: Handle = async ({ event, resolve }) => {
    const token = event.cookies.get("session");
    event.locals.user = null;

    if (token) {
        const session = await prisma.session.findUnique({
            where: { id: token },
            include: {
                user: {
                    include: { student: true, parent: true, tutor: true }
                }
            }
        });

        if (session && session.expiresAt > new Date()) {
            const { user } = session;
            let profileId = null;
            if (user.role === "PARENT") profileId = user.parent?.id;
            else if (user.role === "STUDENT") profileId = user.student?.id;
            else if (user.role === "TUTOR") profileId = user.tutor?.id;

            const { passwordHash, ...safeUser } = user;
            event.locals.user = { ...safeUser, profileId };
        } else if (session) {
            await prisma.session.delete({ where: { id: token } });
            event.cookies.delete("session", { path: "/" });
        }
    }

    const url = event.url;
    const publicRoutes = ["/", "/login", "/signup", "/research", "/tutor"];
    const isPublic = publicRoutes.some(route => url.pathname === route || url.pathname.startsWith(`${route}/`));

    if (!isPublic && !event.locals.user) {
        return new Response(null, {
            status: 303,
            headers: { Location: "/" }
        });
    }

    if (url.pathname.startsWith("/student_profile")) event.locals.student = await resolveStudent(event.locals, url.searchParams.get("id"));

    return await resolve(event);
};