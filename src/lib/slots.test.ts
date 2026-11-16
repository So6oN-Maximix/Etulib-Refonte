import { describe, it, expect } from "vitest";
import { buildSlots, fromStoredDate } from "./slots";

describe("fromStoredDate", () => {
	it("reconstruit une date locale à partir des composantes UTC", () => {
		const utc = new Date(Date.UTC(2026, 10, 16, 14, 30));
		const local = fromStoredDate(utc);
		expect(local.getFullYear()).toBe(2026);
		expect(local.getMonth()).toBe(10);
		expect(local.getDate()).toBe(16);
		expect(local.getHours()).toBe(14);
		expect(local.getMinutes()).toBe(30);
	});
});

describe("buildSlots", () => {
	const weekStart = new Date(2026, 10, 16);
	const now = new Date(2026, 10, 16, 8, 0);

	it("génère les créneaux disponibles par pas de 30 minutes", () => {
		const availabilities = [{ day: 0, startMin: 600, endMin: 720 }];
		const result = buildSlots(availabilities, 60, weekStart, [], now);

		expect(result).toHaveLength(1);
		expect(result[0].slots.map((s) => s.time)).toEqual(["10:00", "10:30", "11:00"]);
	});

	it("exclut les créneaux qui chevauchent un cours déjà réservé (busy)", () => {
		const availabilities = [{ day: 0, startMin: 600, endMin: 720 }];
		const busy = [
			{
				start: new Date(2026, 10, 16, 10, 30),
				end: new Date(2026, 10, 16, 11, 30)
			}
		];
		const result = buildSlots(availabilities, 60, weekStart, busy, now);
		expect(result).toHaveLength(0);
	});
});