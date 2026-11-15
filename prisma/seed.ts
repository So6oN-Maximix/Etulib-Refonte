// Remplit la base avec des professeurs de test (profil, cours, disponibilités, expériences).
//
//   npm i -D tsx
//   npx tsx prisma/seed.ts        # 30 profs par défaut
//   npx tsx prisma/seed.ts 60     # 60 profs
//
// Relançable à volonté : les anciens profs de test (e-mail en @seed.etulib.test) sont d'abord supprimés.
// Mot de passe de tous les comptes de test : 123456789

import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { generateTutors, EMAIL_DOMAIN } from "./seedData";

const prisma = new PrismaClient();

async function main() {
    if (process.env.NODE_ENV === "production") throw new Error("Seed refusé en production.");

    const count = Number(process.argv[2] ?? 30);
    if (!Number.isInteger(count) || count < 1 || count > 500) throw new Error("Nombre de profs invalide (1 à 500).");

    const old = await prisma.user.findMany({
        where: { email: { endsWith: EMAIL_DOMAIN } },
        select: { id: true, tutor: { select: { id: true } } }
    });
    if (old.length > 0) {
        const tutorIds = old.flatMap((u) => (u.tutor ? [u.tutor.id] : []));
        await prisma.$transaction([
            prisma.lesson.deleteMany({ where: { tutorId: { in: tutorIds } } }),
            prisma.course.deleteMany({ where: { tutorId: { in: tutorIds } } }),
            prisma.availibility.deleteMany({ where: { tutorId: { in: tutorIds } } }),
            prisma.experience.deleteMany({ where: { tutorId: { in: tutorIds } } }),
            prisma.tutorProfile.deleteMany({ where: { id: { in: tutorIds } } }),
            prisma.user.deleteMany({ where: { id: { in: old.map((u) => u.id) } } })
        ]);
        console.log(`${old.length} ancien(s) prof(s) de test supprimé(s).`);
    }

    const passwordHash = await bcrypt.hash("123456789", 10);

    for (const t of generateTutors(count)) {
        const user = await prisma.user.create({
            data: {
                email: t.email,
                passwordHash,
                firstName: t.firstName,
                lastName: t.lastName,
                role: "TUTOR",
                createdAt: t.createdAt,
                tutor: { create: { phone: t.phone, city: t.city, bio: t.bio } }
            },
            select: { tutor: { select: { id: true } } }
        });
        const tutorId = user.tutor!.id;

        await prisma.$transaction([
            prisma.course.createMany({ data: t.courses.map(c => ({ ...c, tutorId })) }),
            prisma.availibility.createMany({ data: t.availabilities.map(a => ({ ...a, tutorId })) }),
            prisma.experience.createMany({ data: t.experiences.map(e => ({ ...e, tutorId })) })
        ]);
    }

    console.log(`${count} profs créés. Mot de passe : 123456789`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());