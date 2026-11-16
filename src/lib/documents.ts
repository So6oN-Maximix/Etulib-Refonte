export function groupBySubject<A extends {id: number, originalName: String, size: number, createdAt: Date, mimeType: String, user: { id: number, firstName: String, lastName: String }}>(lessons: { course: { subject: string, duration: number }; theme: string | null; attachments: A[], startDate: Date }[]) {
    const groups = new Map<string, { theme: string | null; attachments: A[], startDate: String[], rawStartDate: Date, endDate: Date, longDate: String }[]>();

    for (const lesson of lessons) {
        const list = groups.get(lesson.course.subject) ?? [];
        const formattedDateSplit = lesson.startDate.toLocaleDateString("fr-FR", { day: "numeric", month: "short" }).split(" ");
        const formattedLongDate = lesson.startDate.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
        const endDate = new Date(lesson.startDate.getTime() + lesson.course.duration * 60_000);
        list.push({
            theme: lesson.theme,
            attachments: lesson.attachments.map(attachment => {
                const nameSplit = attachment.originalName.split(".");
                const mimeType = nameSplit[nameSplit.length - 1].slice(0, 4);
                return { ...attachment, mimeType }
            }),
            startDate: formattedDateSplit,
            rawStartDate: lesson.startDate,
            endDate,
            longDate: formattedLongDate
        });
        groups.set(lesson.course.subject, list);
    }

    return [...groups].map(([subject, lessons]) => ({
        subject,
        attachmentCount: lessons.reduce((total, lesson) => total + lesson.attachments.length, 0),
        lessons
    }));
}