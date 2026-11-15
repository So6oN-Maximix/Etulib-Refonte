// Génération des profs de test : aucune dépendance, aucun accès à la base.
// Le même "seed" donne toujours les mêmes profs, ce qui rend les tests reproductibles.

export type Level = "PRIMAIRE" | "COLLEGE" | "LYCEE" | "SUP";
export type Mode = "TOUS" | "EN_LIGNE" | "DOMICILE";

export type SeedTutor = {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    city: string;
    bio: string;
    createdAt: Date;
    courses: { title: string; subject: string; bio: string; level: Level; hourlyRate: number; duration: number; mode: Mode }[];
    availabilities: { day: number; startMin: number; endMin: number }[];
    experiences: { title: string; location: string; startYear: number; endYear: number | null }[];
};

export const EMAIL_DOMAIN = "@seed.etulib.test";

const FIRST_NAMES = ["Camille", "Lucas", "Léa", "Hugo", "Manon", "Louis", "Chloé", "Nathan", "Inès", "Arthur", "Sarah", "Jules", "Emma", "Maxime", "Jade", "Théo", "Clara", "Antoine", "Zoé", "Raphaël"];
const LAST_NAMES = ["Martin", "Bernard", "Dubois", "Thomas", "Robert", "Richard", "Petit", "Durand", "Leroy", "Moreau", "Simon", "Laurent", "Lefebvre", "Michel", "Garcia", "David", "Bertrand", "Roux", "Vincent", "Fournier"];
const CITIES = [
    { name: "Saint-Étienne", code: "42218" },
    { name: "Lyon", code: "69123" },
    { name: "Grenoble", code: "38185" },
    { name: "Clermont-Ferrand", code: "63113" },
    { name: "Saint-Chamond", code: "42207" },
    { name: "Firminy", code: "42095" },
    { name: "Roanne", code: "42187" },
    { name: "Villeurbanne", code: "69266" },
    { name: "Valence", code: "26362" },
    { name: "Annecy", code: "74010" }
];

const SUBJECTS: { subject: string; levels: Level[] }[] = [
    { subject: "Mathématiques", levels: ["PRIMAIRE", "COLLEGE", "LYCEE", "SUP"] },
    { subject: "Physique-chimie", levels: ["COLLEGE", "LYCEE", "SUP"] },
    { subject: "Anglais", levels: ["PRIMAIRE", "COLLEGE", "LYCEE", "SUP"] },
    { subject: "Français", levels: ["PRIMAIRE", "COLLEGE", "LYCEE"] },
    { subject: "Histoire-géographie", levels: ["COLLEGE", "LYCEE"] },
    { subject: "SVT", levels: ["COLLEGE", "LYCEE"] },
    { subject: "Philosophie", levels: ["LYCEE", "SUP"] },
    { subject: "Espagnol", levels: ["COLLEGE", "LYCEE"] },
    { subject: "Allemand", levels: ["COLLEGE", "LYCEE"] },
    { subject: "Informatique", levels: ["LYCEE", "SUP"] },
    { subject: "NSI", levels: ["LYCEE"] },
    { subject: "Sciences économiques et sociales", levels: ["LYCEE"] },
    { subject: "Chimie", levels: ["LYCEE", "SUP"] },
    { subject: "Latin", levels: ["COLLEGE", "LYCEE"] },
    { subject: "Musique", levels: ["PRIMAIRE", "COLLEGE"] }
];

const LEVEL_LABEL: Record<Level, string> = { PRIMAIRE: "primaire", COLLEGE: "collège", LYCEE: "lycée", SUP: "supérieur" };
const RATE_RANGE: Record<Level, [number, number]> = { PRIMAIRE: [15, 22], COLLEGE: [18, 28], LYCEE: [22, 40], SUP: [28, 55] };
const DURATIONS = [30, 60, 60, 90, 120];
const MODES: Mode[] = ["TOUS", "TOUS", "EN_LIGNE", "DOMICILE"];

const EXPERIENCES = [
    { title: "Professeur particulier indépendant", location: "Particuliers" },
    { title: "Assistant d'éducation", location: "Collège Jean Moulin" },
    { title: "Animateur de soutien scolaire", location: "Association Réussite Scolaire" },
    { title: "Tuteur en mathématiques", location: "Université Jean Monnet" },
    { title: "Intervenant en lycée", location: "Lycée Albert Camus" },
    { title: "Moniteur d'études", location: "Mines Saint-Étienne" }
];

function makeRng(seed: number) {
    let a = seed >>> 0;
    return () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

export function generateTutors(count: number, seed = 42, now: Date = new Date()): SeedTutor[] {
    const rng = makeRng(seed);
    const int = (min: number, max: number) => min + Math.floor(rng() * (max - min + 1));
    const pick = <T>(list: readonly T[]): T => list[int(0, list.length - 1)];
    const shuffle = <T>(list: readonly T[]): T[] => {
        const a = [...list];
        for (let i = a.length - 1; i > 0; i--) {
            const j = int(0, i);
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    };
    const slug = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");

    const tutors: SeedTutor[] = [];

    for (let i = 0; i < count; i++) {
        const firstName = FIRST_NAMES[i % FIRST_NAMES.length];
        const lastName = LAST_NAMES[(i * 7 + Math.floor(i / FIRST_NAMES.length)) % LAST_NAMES.length];

        const courses = shuffle(SUBJECTS).slice(0, int(1, 3)).map(({ subject, levels }) => {
            const level = pick(levels);
            const [minRate, maxRate] = RATE_RANGE[level];
            const title = pick([
                `Cours de ${subject} (${LEVEL_LABEL[level]})`,
                `Soutien en ${subject} – ${LEVEL_LABEL[level]}`,
                `${subject} : remise à niveau et méthode`
            ]);
            return {
                title,
                subject,
                bio: `Séances de ${subject} adaptées au niveau ${LEVEL_LABEL[level]} : points de cours, exercices corrigés et conseils de méthode.`,
                level,
                hourlyRate: int(minRate, maxRate),
                duration: pick(DURATIONS),
                mode: pick(MODES)
            };
        });

        const availabilities: SeedTutor["availabilities"] = [];
        for (const day of shuffle([0, 1, 2, 3, 4, 5, 6]).slice(0, int(3, 6)).sort((a, b) => a - b)) {
            let cursor = 480 + 30 * int(0, 8);
            for (let k = int(1, 2); k > 0; k--) {
                const end = Math.min(cursor + 30 * int(2, 8), 1260);
                if (end - cursor < 60) break;
                availabilities.push({ day, startMin: cursor, endMin: end });
                cursor = end + 30 * int(1, 6);
                if (cursor > 1200) break;
            }
        }

        const years = int(1, 12);
        const experiences = shuffle(EXPERIENCES).slice(0, int(1, 3)).map((e) => {
            const startYear = int(2010, 2022);
            return { ...e, startYear, endYear: rng() < 0.4 ? null : int(startYear, 2025) };
        });

        tutors.push({
            email: `${slug(firstName)}.${slug(lastName)}${i + 1}${EMAIL_DOMAIN}`,
            firstName,
            lastName,
            phone: `+33${pick([6, 7])}${String(int(0, 99999999)).padStart(8, "0")}`,
            city: pick(CITIES).code,
            bio: `${years} an${years > 1 ? "s" : ""} d'expérience. Spécialité ${courses[0].subject.toLowerCase()}, pédagogie patiente et progressive, avec un suivi régulier des progrès.`,
            createdAt: new Date(now.getTime() - int(30, 700) * 24 * 60 * 60 * 1000),
            courses,
            availabilities,
            experiences
        });
    }
    return tutors;
}