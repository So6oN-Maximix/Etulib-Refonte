export const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"] as const;
export const START = 8; // première heure affichée
export const END = 21; // dernière heure affichée
export const SLOTS = (END - START) * 2; // créneaux de 30 min

export type Range = { day: number; start: string; end: string };

export function slotToTime(s: number): string {
	const m = START * 60 + s * 30;
	return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

export function timeToSlot(t: string): number {
	const m = /^(\d{2}):(\d{2})$/.exec(t);
	if (!m) return NaN;
	return (Number(m[1]) * 60 + Number(m[2]) - START * 60) / 30;
}

export function rangesToCells(ranges: Range[]): boolean[] {
	const cells = Array<boolean>(7 * SLOTS).fill(false);
	for (const r of ranges) {
		for (let s = timeToSlot(r.start); s < timeToSlot(r.end); s++) {
			if (s >= 0 && s < SLOTS && r.day >= 0 && r.day < 7) cells[s * 7 + r.day] = true;
		}
	}
	return cells;
}

export function cellsToRanges(cells: boolean[]): Range[] {
	const out: Range[] = [];
	for (let d = 0; d < 7; d++) {
		let start: number | null = null;
		for (let s = 0; s <= SLOTS; s++) {
			const on = s < SLOTS && cells[s * 7 + d];
			if (on && start === null) start = s;
			if (!on && start !== null) {
				out.push({ day: d, start: slotToTime(start), end: slotToTime(s) });
				start = null;
			}
		}
	}
	return out;
}

export function parseRanges(raw: string): Range[] | null {
	let data: unknown;
	try {
		data = JSON.parse(raw);
	} catch {
		return null;
	}
	if (!Array.isArray(data) || data.length > 7 * SLOTS) return null;

	const cells = Array<boolean>(7 * SLOTS).fill(false);
	for (const r of data) {
		if (!r || typeof r !== "object") return null;
		const { day, start, end } = r as Record<string, unknown>;
		if (!Number.isInteger(day) || (day as number) < 0 || (day as number) > 6) return null;
		if (typeof start !== "string" || typeof end !== "string") return null;
		const s = timeToSlot(start);
		const e = timeToSlot(end);
		if (!Number.isInteger(s) || !Number.isInteger(e) || s < 0 || e > SLOTS || s >= e) return null;
		for (let i = s; i < e; i++) cells[i * 7 + (day as number)] = true;
	}
	return cellsToRanges(cells);
}

export function timeToMinutes(t: string): number {
	const [h, m] = t.split(":").map(Number);
	return h * 60 + m;
}
 
export function minutesToTime(min: number): string { return `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`; }