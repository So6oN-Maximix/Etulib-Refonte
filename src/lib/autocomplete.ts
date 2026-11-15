export type Option = { key: string; label: string; hint?: string };

export const norm = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

/* ---------- Villes : API publique des communes françaises ---------- */
export async function searchCities(q: string, signal: AbortSignal): Promise<Option[]> {
	const url = new URL("https://geo.api.gouv.fr/communes");
	if (/^\d{5}$/.test(q)) url.searchParams.set("codePostal", q);
	else if (/^\d/.test(q)) return [];
	else url.searchParams.set("nom", q);
	url.searchParams.set("fields", "code,nom,departement");
	url.searchParams.set("boost", "population");
	url.searchParams.set("limit", "6");

	const res = await fetch(url, { signal });
	if (!res.ok) return [];
	const cities: { code: string; nom: string; departement?: { code: string } }[] = await res.json();
	return cities.map((c) => ({
		key: c.code,
		label: c.nom,
		hint: c.departement ? `(${c.departement.code})` : undefined
	}));
}

/* ---------- Matières : liste locale, aucune requête réseau ---------- */
const SUBJECTS: { label: string; aliases?: string[] }[] = [
	{ label: "Mathématiques", aliases: ["maths", "math"] },
	{ label: "Physique-chimie", aliases: ["pc"] },
	{ label: "Anglais" },
	{ label: "Français" },
	{ label: "Histoire-géographie", aliases: ["histoire geo", "hg"] },
	{ label: "SVT", aliases: ["biologie", "sciences de la vie"] },
	{ label: "Philosophie", aliases: ["philo"] },
	{ label: "Espagnol" },
	{ label: "Allemand" },
	{ label: "Informatique", aliases: ["programmation", "python"] },
	{ label: "NSI", aliases: ["numérique et sciences informatiques"] },
	{ label: "Sciences économiques et sociales", aliases: ["ses"] },
	{ label: "Physique" },
	{ label: "Chimie" },
	{ label: "Italien" },
	{ label: "Latin" },
	{ label: "Grec ancien", aliases: ["grec"] },
	{ label: "Chinois" },
	{ label: "Arabe" },
	{ label: "Économie" },
	{ label: "Comptabilité", aliases: ["gestion"] },
	{ label: "Droit" },
	{ label: "Musique", aliases: ["solfège", "piano", "guitare"] },
	{ label: "Arts plastiques", aliases: ["dessin"] },
	{ label: "Français langue étrangère", aliases: ["fle"] }
];

export async function searchSubjects(q: string): Promise<Option[]> {
	const n = norm(q.trim());
	const found: { rank: number; label: string }[] = [];

	for (const s of SUBJECTS) {
		const names = [s.label, ...(s.aliases ?? [])].map(norm);
		let rank = -1;
		if (names.some(x => x.startsWith(n))) rank = 0;
		else if (names.some(x => x.split(/[\s-]+/).some(w => w.startsWith(n)))) rank = 1;
		if (rank >= 0) found.push({ rank, label: s.label });
	}

	return found
		.sort((a, b) => a.rank - b.rank)
		.slice(0, 6)
		.map((s) => ({ key: s.label, label: s.label }));
}