type LessonRow = {
    tutorId: number;
    tutor: { user: { firstName: string; lastName: string } };
    course: { subject: string };
};

export function summarizeTutors(lessons: LessonRow[]) {
    const byTutor = new Map<number, { tutorId: number; firstName: string; lastName: string; subjects: Set<string>; lessonCount: number }>();

    for (const lesson of lessons) {
        const entry = byTutor.get(lesson.tutorId) ?? {
            tutorId: lesson.tutorId,
            firstName: lesson.tutor.user.firstName,
            lastName: lesson.tutor.user.lastName,
            subjects: new Set<string>(),
            lessonCount: 0
        };
        entry.lessonCount++;
        entry.subjects.add(lesson.course.subject);
        byTutor.set(lesson.tutorId, entry);
    }

    return [...byTutor.values()]
        .map((t) => ({ ...t, subjects: [...t.subjects] }))
        .sort((a, b) => b.lessonCount - a.lessonCount);
}