import type { PageServerLoad } from "./$types";
import { prisma } from "#lib/server/prisma";
import { searchSubjects } from "#lib/autocomplete";
import { getNextAvailableSlot } from "#lib/utils";

const PAGE_SIZE = 10;

export const load: PageServerLoad = async ({ url }) => {
    const course = (url.searchParams.get("course") ?? "").trim().slice(0, 100);
    const location = (url.searchParams.get("location") ?? "").trim().slice(0, 10);
    const cityName = (url.searchParams.get("cityName") ?? "").trim().slice(0, 100);

    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);

    const profiles = await prisma.tutorProfile.findMany({
        where: location ? { city: location } : {},
        select: { id: true, userId: true, bio: true }
    });

    let subjectFilter = {};
    if (course) {
        const knownSubjects = (await searchSubjects(course)).map(s => s.label);
        subjectFilter = {
            OR: [{ subject: { contains: course, mode: "insensitive" as const } }, { subject: { in: knownSubjects } }]
        };
    }
    const courses = await prisma.course.findMany({
        where: { tutorId: { in: profiles.map(p => p.id) }, ...subjectFilter },
        select: { tutorId: true, subject: true, hourlyRate: true, duration: true, mode: true }
    });

    const coursesByTutor = new Map<number, typeof courses>();
    for (const c of courses) coursesByTutor.set(c.tutorId, [...(coursesByTutor.get(c.tutorId) ?? []), c]);
    const matching = profiles.filter(p => coursesByTutor.has(p.id));

    const users = await prisma.user.findMany({
        where: { id: { in: matching.map(p => p.userId) } },
        select: { id: true, firstName: true, lastName: true }
    });
    const userById = new Map(users.map(u => [u.id, u]));

    const tutorIds = matching.map(p => p.id);
    const [allDispos, upcomingLessons] = await Promise.all([
        prisma.availibility.findMany({
            where: { tutorId: { in: tutorIds } },
            select: { tutorId: true, day: true, startMin: true, endMin: true }
        }),
        prisma.lesson.findMany({
            where: {
                tutorId: { in: tutorIds },
                startDate: { gte: new Date() }
            },
            select: {
                tutorId: true,
                startDate: true,
                course: { select: { duration: true } }
            }
        })
    ]);

    // Groupement par tuteur
    const disposByTutor = new Map<number, typeof allDispos>();
    for (const d of allDispos) {
        disposByTutor.set(d.tutorId, [...(disposByTutor.get(d.tutorId) ?? []), d]);
    }

    const lessonsByTutor = new Map<number, typeof upcomingLessons>();
    for (const l of upcomingLessons) {
        lessonsByTutor.set(l.tutorId, [...(lessonsByTutor.get(l.tutorId) ?? []), l]);
    }

    const allTutors = matching
        .flatMap((p) => {
            const user = userById.get(p.userId);
            const tutorCourses = coursesByTutor.get(p.id);
            if (!user || !tutorCourses) return [];

            const modes = new Set<string>();
            for (const c of tutorCourses) {
                if (c.mode === "TOUS") { modes.add("EN_LIGNE"); modes.add("DOMICILE"); }
                else modes.add(c.mode);
            }

            const tutorDispos = disposByTutor.get(p.id) ?? [];
            const tutorLessons = lessonsByTutor.get(p.id) ?? [];
            const minCourseDuration = Math.min(...tutorCourses.map(c => c.duration));
            const nextAvailability = getNextAvailableSlot(tutorDispos, tutorLessons, minCourseDuration);

            return [{
                id: p.id,
                firstName: user.firstName,
                lastName: user.lastName,
                bio: p.bio ?? "",
                subjects: [...new Set(tutorCourses.map(c => c.subject))],
                modes: [...modes],
                courseCount: tutorCourses.length,
                minRate: Math.min(...tutorCourses.map(c => Number(c.hourlyRate))),
                nextAvailability
            }];
        })
        .sort((a, b) => a.minRate - b.minRate)
    
    const total = allTutors.length;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);

    const start = (currentPage - 1) * PAGE_SIZE;
    const tutors = allTutors.slice(start, start + PAGE_SIZE);

    return {
        query: { course, location, cityName },
        total: matching.length,
        tutors,pagination: {
            currentPage,
            totalPages
        }
    };
};