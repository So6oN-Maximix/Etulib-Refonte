import { beforeEach, describe, expect, it, vi } from "vitest";

const findFirst = vi.hoisted(() => vi.fn());
const findMany = vi.hoisted(() => vi.fn());
vi.mock("./prisma", () => ({ prisma: { studentProfile: { findFirst, findMany } } }));

import { resolveStudent } from "./student";

const makeLocals = (user: unknown) => ({ user }) as unknown as App.Locals;
const parent = makeLocals({ id: 10, role: "PARENT", profileId: 1 });
const child = (id: number) => ({ id, user: { id: 100 + id, firstName: "Jules", lastName: "Barbier", email: "j@x.fr", role: "STUDENT", createdAt: new Date() } });

beforeEach(() => {
    findFirst.mockReset();
    findMany.mockReset();
});

describe("resolveStudent", () => {
    it("refuse un visiteur non connecté (401)", async () => {
        await expect(resolveStudent(makeLocals(null), "2")).rejects.toMatchObject({ status: 401 });
    });

    it("renvoie son propre profil à un élève, sans interroger la base ni lire l'URL", async () => {
        const locals = makeLocals({ id: 20, role: "STUDENT", profileId: 4 });
        const result = await resolveStudent(locals, "99");

        expect(result.profileId).toBe(4);
        expect(findFirst).not.toHaveBeenCalled();
        expect(findMany).not.toHaveBeenCalled();
    });

    it("refuse un tuteur (403)", async () => {
        await expect(resolveStudent(makeLocals({ id: 30, role: "TUTOR", profileId: 6 }), "2")).rejects.toMatchObject({ status: 403 });
    });

    describe("parent", () => {
        it("accepte son propre enfant", async () => {
            findFirst.mockResolvedValue(child(2));
            const result = await resolveStudent(parent, "2");

            expect(result.profileId).toBe(2);
            expect(result.user.firstName).toBe("Jules");
            expect(findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 2, parentId: 1 } }));
        });

        it("refuse l'enfant d'un autre parent (403)", async () => {
            findFirst.mockResolvedValue(null);
            await expect(resolveStudent(parent, "2")).rejects.toMatchObject({ status: 403 });
        });

        it("prend l'enfant unique quand aucun identifiant n'est donné", async () => {
            findMany.mockResolvedValue([{ id: 9 }]);
            findFirst.mockResolvedValue(child(9));
            const result = await resolveStudent(parent, null);

            expect(result.profileId).toBe(9);
            expect(findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { parentId: 1 } }));
            expect(findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 9, parentId: 1 } }));
        });

        it("refuse (400) quand aucun identifiant n'est donné et qu'il y a plusieurs enfants", async () => {
            findMany.mockResolvedValue([{ id: 1 }, { id: 2 }]);
            await expect(resolveStudent(parent, null)).rejects.toMatchObject({ status: 400 });
            expect(findFirst).not.toHaveBeenCalled();
        });

        it("refuse (400) un parent sans enfant", async () => {
            findMany.mockResolvedValue([]);
            await expect(resolveStudent(parent, null)).rejects.toMatchObject({ status: 400 });
        });

        it.each(["", "abc", "0", "-3", "1.5"])("ne cherche pas l'enfant « %s » mais retombe sur le choix par défaut", async (rawId) => {
            findMany.mockResolvedValue([{ id: 1 }, { id: 2 }]);
            await expect(resolveStudent(parent, rawId)).rejects.toMatchObject({ status: 400 });
            expect(findFirst).not.toHaveBeenCalled();
        });

        it("filtre toujours par parent, même avec l'identifiant d'un autre enfant", async () => {
            findFirst.mockResolvedValue(null);
            await resolveStudent(parent, "42").catch(() => undefined);
            expect(findFirst.mock.calls[0][0].where).toEqual({ id: 42, parentId: 1 });
        });
    });
});