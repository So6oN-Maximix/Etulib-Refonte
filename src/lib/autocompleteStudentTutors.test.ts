import { describe, it, expect } from "vitest";
import { norm, searchSubjects } from "./autocomplete";
import { summarizeTutors } from "./studentTutors";

describe("Autocomplete (matières)", () => {
	it("normalise les accents et la casse", () => {
		expect(norm("Mathématiques")).toBe("mathematiques");
		expect(norm("ÉCONOMIE")).toBe("economie");
	});

	it("trouve une matière via ses alias et respecte la priorité de préfixe", async () => {
		const resMaths = await searchSubjects("maths");
		expect(resMaths[0]?.label).toBe("Mathématiques");

		const resPhilo = await searchSubjects("philo");
		expect(resPhilo[0]?.label).toBe("Philosophie");
	});
});

describe("Agrégation tuteurs / élèves", () => {
	it("regroupe les cours par tuteur, dédoublonne les matières et trie par nombre de cours", () => {
		const lessons = [
			{ tutorId: 1, tutor: { user: { firstName: "Camille", lastName: "Martin" } }, course: { subject: "Maths" } },
			{ tutorId: 2, tutor: { user: { firstName: "Yanis", lastName: "Ben" } }, course: { subject: "Anglais" } },
			{ tutorId: 2, tutor: { user: { firstName: "Yanis", lastName: "Ben" } }, course: { subject: "Anglais" } },
			{ tutorId: 2, tutor: { user: { firstName: "Yanis", lastName: "Ben" } }, course: { subject: "Espagnol" } }
		];

		const summary = summarizeTutors(lessons);
		expect(summary).toHaveLength(2);
		expect(summary[0]).toEqual({
			tutorId: 2,
			firstName: "Yanis",
			lastName: "Ben",
			subjects: ["Anglais", "Espagnol"],
			lessonCount: 3
		});
	});
});