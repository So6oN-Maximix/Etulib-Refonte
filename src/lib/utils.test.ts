import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { formatPhoneUX, formatDuration, formatHours, getNextAvailableSlot } from "./utils";

describe("formatPhoneUX", () => {
	it("formate un numéro français classique en paires", () => {
		expect(formatPhoneUX("0612345678")).toBe("06 12 34 56 78");
	});

	it("convertit l'indicatif +33 en 0", () => {
		expect(formatPhoneUX("+33612345678")).toBe("06 12 34 56 78");
	});

	it("retourne une chaîne vide si l'entrée est vide", () => {
		expect(formatPhoneUX("")).toBe("");
	});
});

describe("formatDuration & formatHours", () => {
	it("formate les durées inférieures à 1h en minutes", () => {
		expect(formatDuration(45)).toBe("45 min");
	});

	it("formate les heures piles et avec minutes", () => {
		expect(formatDuration(60)).toBe("1h00");
		expect(formatDuration(90)).toBe("1h30");
		expect(formatHours(570)).toBe("09:30");
	});
});

describe("getNextAvailableSlot", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date(2026, 10, 16, 10, 0, 0));
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("retourne null si le tuteur n'a aucune disponibilité", () => {
		expect(getNextAvailableSlot([], [])).toBeNull();
	});

	it("respecte la marge de 1h minimum pour un créneau aujourd'hui", () => {
		const dispos = [{ day: 0, startMin: 600, endMin: 840 }];
		expect(getNextAvailableSlot(dispos, [], 60)).toBe("Aujourd'hui à 11h30");
	});

	it("saute les créneaux qui chevauchent un cours déjà réservé", () => {
		const dispos = [{ day: 0, startMin: 840, endMin: 1020 }];
		const lessons = [
			{ startDate: new Date(2026, 10, 16, 14, 0), course: { duration: 60 } }
		];
		expect(getNextAvailableSlot(dispos, lessons, 60)).toBe("Aujourd'hui à 15h00");
	});

	it("passe au lendemain si plus aucun créneau n'est libre aujourd'hui", () => {
		const dispos = [{ day: 1, startMin: 540, endMin: 660 }];
		expect(getNextAvailableSlot(dispos, [], 60)).toBe("Demain à 09h00");
	});
});