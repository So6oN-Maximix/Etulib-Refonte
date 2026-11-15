type LessonStudentRow = {
    tutorId: number;
    tutor: { user: { firstName: string; lastName: string } };
    course: { subject: string };
};
type LessonTutorRow = {
    studentId: number;
    student: { user: { firstName: string; lastName: string } };
    course: { subject: string };
};

export function summarizeTutors(lessons: LessonStudentRow[]) {
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

export function summarizeStudent(lessons: LessonTutorRow[]) {
    const byStudent = new Map<number, { studentId: number; firstName: string; lastName: string; subjects: Set<string>; lessonCount: number }>();

    for (const lesson of lessons) {
        const entry = byStudent.get(lesson.studentId) ?? {
            studentId: lesson.studentId,
            firstName: lesson.student.user.firstName,
            lastName: lesson.student.user.lastName,
            subjects: new Set<string>(),
            lessonCount: 0
        };
        entry.lessonCount++;
        entry.subjects.add(lesson.course.subject);
        byStudent.set(lesson.studentId, entry);
    }

    return [...byStudent.values()]
        .map((t) => ({ ...t, subjects: [...t.subjects] }))
        .sort((a, b) => b.lessonCount - a.lessonCount);
}