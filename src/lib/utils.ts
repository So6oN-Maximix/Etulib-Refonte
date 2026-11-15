export function formatPhoneUX(rawPhone: String) {
    const compact = rawPhone.replace("+33", "0");
    const numbers = compact.match(/.{1,2}/g) || [];
    return numbers.join(" ");
}

export function formatDuration(minutes: number) {
	if (minutes < 60) return `${minutes} min`;
	const h = Math.floor(minutes / 60), m = minutes % 60;
	return m ? `${h}h${String(m).padStart(2, "0")}` : `${h}h00`;
}

export function formatHours(minutes: number) { return `${Math.floor(minutes / 60).toString().padStart(2, "0")}:${(minutes % 60).toString().padStart(2, "0")}`; }

type Dispo = { day: number; startMin: number; endMin: number };
type BookedLesson = { startDate: Date; course: { duration: number } };

export function getNextAvailableSlot(dispos: Dispo[], lessons: BookedLesson[], minDuration = 30): string | null {
    if (dispos.length === 0) return null;

    const now = new Date();
    const bookedIntervals = lessons.map(l => ({
        start: l.startDate.getTime(),
        end: l.startDate.getTime() + l.course.duration * 60_000
    }));

    for (let offset = 0; offset < 14; offset++) {
        const candidateDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);
        const schemaDay = (candidateDay.getDay() + 6) % 7;

        const dayDispos = dispos
            .filter(d => d.day === schemaDay)
            .sort((a, b) => a.startMin - b.startMin);

        for (const dispo of dayDispos) {
            for (let min = dispo.startMin; min + minDuration <= dispo.endMin; min += 30) {
                const slotStart = new Date(
                    candidateDay.getFullYear(),
                    candidateDay.getMonth(),
                    candidateDay.getDate(),
                    Math.floor(min / 60),
                    min % 60
                );
                const slotEnd = slotStart.getTime() + minDuration * 60_000;

                if (slotStart.getTime() <= now.getTime() + 60 * 60_000) continue;

                const isBooked = bookedIntervals.some(
                    b => slotStart.getTime() < b.end && slotEnd > b.start
                );

                if (!isBooked) {
                    const dayStr = offset === 0
                        ? "Aujourd'hui"
                        : offset === 1
                            ? "Demain"
                            : slotStart.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" });

                    const timeStr = `${String(Math.floor(min / 60)).padStart(2, "0")}h${String(min % 60).padStart(2, "0")}`;
                    return `${dayStr} à ${timeStr}`;
                }
            }
        }
    }

    return null;
}