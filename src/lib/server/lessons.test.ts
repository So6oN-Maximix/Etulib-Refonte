import { beforeEach, describe, expect, it, vi } from "vitest";

const findFirst = vi.hoisted(() => vi.fn());
vi.mock("./prisma", () => ({ prisma: { lesson: { findFirst } } }));

import { getLessonAccess } from "./lessons";

type User = Parameters<typeof getLessonAccess>[0];
const makeUser = (id?: number | null) => ({ id }) as unknown as User;

beforeEach(() => {
    findFirst.mockReset();
    findFirst.mockResolvedValue({ id: 3 });
});

describe("getLessonAccess", () => {
    it("autorise l'élève du cours", async () => {
        expect(await getLessonAccess(makeUser(7), 3)).toEqual({ id: 3 });
        expect(findFirst).toHaveBeenCalledWith(expect.objectContaining({
            where: expect.objectContaining({
                id: 3,
                OR: expect.arrayContaining([{ student: { userId: 7 } }])
            })
        }));
    });

    it("autorise le tuteur du cours", async () => {
        expect(await getLessonAccess(makeUser(7), 3)).toEqual({ id: 3 });
        expect(findFirst).toHaveBeenCalledWith(expect.objectContaining({
            where: expect.objectContaining({
                id: 3,
                OR: expect.arrayContaining([{ tutor: { userId: 7 } }])
            })
        }));
    });

    it("autorise le parent de l'élève du cours", async () => {
        expect(await getLessonAccess(makeUser(7), 3)).toEqual({ id: 3 });
        expect(findFirst).toHaveBeenCalledWith(expect.objectContaining({
            where: expect.objectContaining({
                id: 3,
                OR: expect.arrayContaining([{ student: { parent: { userId: 7 } } }])
            })
        }));
    });

    it("ne compare jamais l'identifiant d'un utilisateur à un champ direct studentId ou tutorId", async () => {
        await getLessonAccess(makeUser(5), 3);
        const where = findFirst.mock.calls[0][0].where;
        expect(where).not.toHaveProperty("studentId");
        expect(where).not.toHaveProperty("tutorId");
    });

    it("refuse quand le cours n'appartient pas à la personne", async () => {
        findFirst.mockResolvedValue(null);
        expect(await getLessonAccess(makeUser(7), 3)).toBeNull();
    });

    it.each([undefined])("refuse quand l'identifiant utilisateur est absent (%s), sans interroger la base", async (id) => {
        expect(await getLessonAccess(makeUser(id), 3)).toBeNull();
        expect(findFirst).not.toHaveBeenCalled();
    });

    it.each([NaN, 1.5, Infinity])("refuse un identifiant de cours invalide (%s)", async (id) => {
        expect(await getLessonAccess(makeUser(7), id)).toBeNull();
        expect(findFirst).not.toHaveBeenCalled();
    });

    it("retourne null si l'identifiant est non numérique / hors périmètre entier", async () => {
        expect(await getLessonAccess(makeUser(7), Number.NaN)).toBeNull();
        expect(findFirst).not.toHaveBeenCalled();
    });
});