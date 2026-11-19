import { mkdtemp, readFile, readdir, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

const env = vi.hoisted(() => ({ MESSAGE_KEY_V1: "ab".repeat(32), UPLOAD_DIR: "" }));
vi.mock("$env/dynamic/private", () => ({ env }));
vi.mock("$app/env/private", () => env);

import { MAX_FILE_SIZE, MAX_FILES_PER_UPLOAD, cleanFileName, detectType, readDecrypted, removeStored, saveEncrypted } from "./uploads";

const PDF = Buffer.from("%PDF-1.7\n%contenu");
const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0]);
const JPEG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0]);
const DOC = Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1, 0, 0]);
const DOCX = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0, 0]);
const DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

describe("limites", () => {
    it("fixe 10 Mo et 10 fichiers par envoi", () => {
        expect(MAX_FILE_SIZE).toBe(10 * 1024 * 1024);
        expect(MAX_FILES_PER_UPLOAD).toBe(10);
    });
});

describe("detectType", () => {
    it.each([
        [PDF, "cours.pdf", "application/pdf"],
        [PNG, "schema.png", "image/png"],
        [JPEG, "photo.jpg", "image/jpeg"],
        [JPEG, "photo.jpeg", "image/jpeg"],
        [DOC, "devoir.doc", "application/msword"],
        [DOCX, "devoir.docx", DOCX_MIME]
    ])("reconnaît %#", (content, name, mime) => {
        expect(detectType(content, name)).toBe(mime);
    });

    it("ignore la casse de l'extension", () => {
        expect(detectType(PDF, "COURS.PDF")).toBe("application/pdf");
    });

    it("refuse un contenu qui ne correspond pas à l'extension", () => {
        expect(detectType(PDF, "image.png")).toBeNull();
        expect(detectType(PNG, "cours.pdf")).toBeNull();
    });

    it("refuse un exécutable renommé", () => {
        expect(detectType(Buffer.from("MZ\x90\x00"), "virus.pdf")).toBeNull();
    });

    it("refuse une extension non autorisée", () => {
        expect(detectType(PDF, "archive.exe")).toBeNull();
        expect(detectType(PDF, "cours.pdf.exe")).toBeNull();
    });

    it("refuse un fichier sans extension ou vide", () => {
        expect(detectType(PDF, "document")).toBeNull();
        expect(detectType(Buffer.alloc(0), "vide.pdf")).toBeNull();
    });
});

describe("cleanFileName", () => {
    it("remplace les séparateurs de chemin", () => {
        const cleaned = cleanFileName("../../etc/passwd");
        expect(cleaned).not.toMatch(/[\\/]/);
        expect(cleanFileName("a\\b.pdf")).toBe("a_b.pdf");
    });

    it("remplace les caractères de contrôle", () => {
        expect(cleanFileName("a\u0000b\nc.pdf")).toBe("a_b_c.pdf");
    });

    it("retire les espaces autour du nom", () => {
        expect(cleanFileName("  cours.pdf  ")).toBe("cours.pdf");
    });

    it("garde les accents", () => {
        expect(cleanFileName("Cours été.pdf")).toBe("Cours été.pdf");
    });

    it("renvoie « document » pour un nom vide", () => {
        expect(cleanFileName("")).toBe("document");
        expect(cleanFileName("   ")).toBe("document");
    });

    it("limite à 120 caractères en gardant la fin (l'extension)", () => {
        const cleaned = cleanFileName("a".repeat(300) + ".pdf");
        expect(cleaned).toHaveLength(120);
        expect(cleaned.endsWith(".pdf")).toBe(true);
    });
});

describe("stockage chiffré", () => {
    let dir = "";

    beforeAll(async () => {
        dir = await mkdtemp(join(tmpdir(), "etulib-uploads-"));
        env.UPLOAD_DIR = dir;
        process.env.UPLOAD_DIR = dir;
    });

    afterAll(async () => {
        await rm(dir, { recursive: true, force: true });
    });

    const lessonsDir = () => join(dir, "lessons");

    it("enregistre un fichier .enc et le relit à l'identique", async () => {
        const content = Buffer.from("contenu secret du cours");
        const filename = await saveEncrypted(content, 1);

        expect(filename).toMatch(/^[0-9a-f-]{36}\.enc$/);
        expect((await readDecrypted(filename, 1)).equals(content)).toBe(true);
    });

    it("n'écrit pas le contenu en clair sur le disque", async () => {
        const content = Buffer.from("texte parfaitement lisible");
        const filename = await saveEncrypted(content, 2);
        const onDisk = await readFile(join(lessonsDir(), filename));

        expect(onDisk.includes(content)).toBe(false);
    });

    it("donne un nom différent à chaque envoi", async () => {
        const a = await saveEncrypted(Buffer.from("x"), 1);
        const b = await saveEncrypted(Buffer.from("x"), 1);
        expect(a).not.toBe(b);
    });

    it("refuse de relire un fichier avec un autre cours", async () => {
        const filename = await saveEncrypted(Buffer.from("x"), 1);
        await expect(readDecrypted(filename, 2)).rejects.toThrow();
    });

    it.skipIf(process.platform === "win32")("restreint les droits du fichier à son propriétaire", async () => {
        const filename = await saveEncrypted(Buffer.from("x"), 1);
        const { mode } = await stat(join(lessonsDir(), filename));
        expect(mode & 0o777).toBe(0o600);
    });

    it("ne sort pas du dossier d'envoi", async () => {
        await expect(readDecrypted("../../secret.enc", 1)).rejects.toThrow();
    });

    it("supprime un fichier, sans erreur s'il n'existe plus", async () => {
        const filename = await saveEncrypted(Buffer.from("x"), 1);
        await removeStored(filename);

        expect(await readdir(lessonsDir())).not.toContain(filename);
        await expect(removeStored(filename)).resolves.toBeUndefined();
    });
});