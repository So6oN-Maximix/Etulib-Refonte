import { addDays, toISODate } from "#lib/week";

type CalendarLesson = {
    id: number;
    startDate: Date;
    endDate: Date;
    course: { subject: string; title: string; duration: number };
    student: { user: { firstName: string; lastName: string } };
};

const minutes = (date: Date) => date.getHours() * 60 + date.getMinutes();

export function buildWeek<L extends CalendarLesson>(lessons: L[], weekStart: Date, rowPx = 48, today = new Date()) {
    const weekEnd = addDays(weekStart, 7);
    const inWeek = lessons.filter((l) => l.startDate >= weekStart && l.startDate < weekEnd);

    const firstHour = Math.min(8, ...inWeek.map((l) => Math.floor(minutes(l.startDate) / 60)));
    const lastHour = Math.max(21, ...inWeek.map((l) => Math.ceil(minutes(l.endDate) / 60)));

    const days = Array.from({ length: 7 }, (_, i) => {
        const date = addDays(weekStart, i);
        const iso = toISODate(date);
        return {
            iso,
            label: date.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" }),
            today: iso === toISODate(today),
            lessons: inWeek
                .filter((l) => toISODate(l.startDate) === iso)
                .map((l) => ({
                    ...l,
                    top: ((minutes(l.startDate) - firstHour * 60) / 60) * rowPx,
                    height: (l.course.duration / 60) * rowPx
                }))
        };
    });

    return {
        days,
        hours: Array.from({ length: lastHour - firstHour }, (_, i) => firstHour + i),
        bodyHeight: (lastHour - firstHour) * rowPx,
        count: inWeek.length
    };
}