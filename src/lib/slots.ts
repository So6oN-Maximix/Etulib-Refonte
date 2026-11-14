import { addDays } from "#lib/week";

const STEP = 30;

export type AvailabilityRange = { day: number; startMin: number; endMin: number };

export type Busy = { start: Date; end: Date };

export type DaySlots = {
	day: number;
	label: string;
	slots: { start: Date; time: string }[];
};

const pad = (n: number) => String(n).padStart(2, "0");

export function fromStoredDate(d: Date): Date { return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes()); }

function dayLabel(date: Date): string {
	const raw = date.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" });
	return raw.charAt(0).toUpperCase() + raw.slice(1);
}

export function buildSlots(
	ranges: AvailabilityRange[],
	durationMin: number,
	weekStart: Date,
	busy: Busy[] = [],
	now: Date = new Date()
): DaySlots[] {
	const byDay = new Map<number, DaySlots>();
	const sorted = [...ranges].sort((a, b) => a.day - b.day || a.startMin - b.startMin);
 
	for (const r of sorted) {
		const date = addDays(weekStart, r.day);
		for (let m = r.startMin; m + durationMin <= r.endMin; m += STEP) {
			const start = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, m);
			if (start <= now) continue;

			const end = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, m + durationMin);
			if (busy.some((b) => start < b.end && b.start < end)) continue;
 
			let entry = byDay.get(r.day);
			if (!entry) {
				entry = { day: r.day, label: dayLabel(date), slots: [] };
				byDay.set(r.day, entry);
			}
			entry.slots.push({ start, time: `${pad(Math.floor(m / 60))}:${pad(m % 60)}` });
		}
	}
	return [...byDay.values()];
}