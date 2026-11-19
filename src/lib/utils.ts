export function sanitizeText(text: string) { return text.replace("é", "e").replace("è", "e").toLowerCase(); }

export function formatPhoneUX(rawPhone: string) {
    const compact = rawPhone.replace("+33", "0");
    const numbers = compact.match(/.{1,2}/g) || [];
    return numbers.join(" ");
}

export function formatPhoneGlobal(phone: string) {
    if (!phone) return null;
    let cleanPhone = phone.replace(/[\s.-]/g, "");
    if (/^0[1-9]\d{8}$/.test(phone)) cleanPhone = "+33" + phone.slice(1);
    const isValidPhone = cleanPhone === "" || /^(?:(?:\+|00)33|0)\s*[1-9](?:\s*\d{2}){4}$/.test(cleanPhone);
    return isValidPhone ? cleanPhone : null;
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

function startOfDay(date: Date | string | number): number {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
}

const MS_PER_DAY = 86_400_000;

export function formatMsgDate(dateInput: Date) {
    if (!dateInput) return "";

    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return "";

    const now = new Date();
    
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMsgDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    const diffInDays = Math.round((startOfDay(startOfToday) - startOfDay(startOfMsgDate)) / MS_PER_DAY);

    if (diffInDays === 0) { return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }); } 
    
    if (diffInDays > 0 && diffInDays < 7) {
        let dayStr = date.toLocaleDateString("fr-FR", { weekday: "short" });
        dayStr = dayStr.charAt(0).toUpperCase() + dayStr.slice(1);
        return dayStr.endsWith(".") ? dayStr : `${dayStr}.`;
    } 
    
    const sameYear = date.getFullYear() === now.getFullYear();
    return date.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        ...(sameYear ? {} : { year: "2-digit" })
    });
}