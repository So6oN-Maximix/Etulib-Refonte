import { describe, it, expect } from "vitest";
import { slotToTime, timeToSlot, rangesToCells, cellsToRanges, parseRanges, timeToMinutes, minutesToTime } from "./planner";

describe("Conversions horaires du planner", () => {
	it("convertit correctement un index de slot en heure et inversement", () => {
		expect(slotToTime(0)).toBe("08:00");
		expect(slotToTime(3)).toBe("09:30");
		expect(timeToSlot("09:30")).toBe(3);
		expect(timeToSlot("invalide")).toBeNaN();
	});

	it("convertit les minutes en HH:MM et inversement", () => {
		expect(timeToMinutes("15:30")).toBe(930);
		expect(minutesToTime(930)).toBe("15:30");
	});
});

describe("Grille et fusion des plages (rangesToCells / cellsToRanges)", () => {
	it("fusionne deux créneaux contigus en une seule plage", () => {
		const ranges = [
			{ day: 0, start: "09:00", end: "10:00" },
			{ day: 0, start: "10:00", end: "11:30" }
		];
		const cells = rangesToCells(ranges);
		expect(cellsToRanges(cells)).toEqual([{ day: 0, start: "09:00", end: "11:30" }]);
	});
});

describe("parseRanges (validation serveur)", () => {
	it("valide et normalise un JSON correct", () => {
		const raw = JSON.stringify([{ day: 2, start: "14:00", end: "16:00" }]);
		expect(parseRanges(raw)).toEqual([{ day: 2, start: "14:00", end: "16:00" }]);
	});

	it("rejette un JSON malformé ou hors bornes", () => {
		expect(parseRanges("not-json")).toBeNull();
		expect(parseRanges(JSON.stringify([{ day: 7, start: "09:00", end: "10:00" }]))).toBeNull();
		expect(parseRanges(JSON.stringify([{ day: 0, start: "12:00", end: "10:00" }]))).toBeNull();
		expect(parseRanges(JSON.stringify([{ day: 0, start: "07:00", end: "09:00" }]))).toBeNull();
	});
});