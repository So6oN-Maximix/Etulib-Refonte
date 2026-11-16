import { describe, it, expect, vi } from "vitest";

vi.mock("$app/env/private", () => ({
	MESSAGE_KEY_V1: "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
	UPLOAD_DIR: "/tmp/etulib-tests"
}));

import { encryptMessage, decryptMessage, encryptFile, decryptFile } from "./crypto";
import { cleanFileName, detectType } from "./uploads";

describe("Chiffrement AES-256-GCM (crypto.ts)", () => {
	it("chiffre et déchiffre un message pour la même conversation", () => {
		const cipherText = encryptMessage("Bonjour, prêt pour le cours ?", 42);
		expect(cipherText.startsWith("v1:")).toBe(true);
		expect(decryptMessage(cipherText, 42)).toBe("Bonjour, prêt pour le cours ?");
	});

	it("échoue si l'ID de conversation (AAD) ne correspond pas", () => {
		const cipherText = encryptMessage("Secret", 42);
		expect(() => decryptMessage(cipherText, 99)).toThrow();
	});

	it("chiffre et déchiffre un buffer de fichier lié à un cours", () => {
		const content = Buffer.from("%PDF-1.4 contenu du devoir");
		const encrypted = encryptFile(content, 10);
		expect(decryptFile(encrypted, 10).equals(content)).toBe(true);
		expect(() => decryptFile(encrypted, 11)).toThrow();
	});
});

describe("Sécurité des uploads (uploads.ts)", () => {
	it("nettoie les tentatives de path traversal dans les noms de fichiers", () => {
		expect(cleanFileName("../../etc/passwd")).toBe(".._.._etc_passwd");
		expect(cleanFileName("   ")).toBe("document");
	});

	it("valide le type MIME via les magic bytes réels et non uniquement l'extension", () => {
		const validPdf = Buffer.from("%PDF-1.7\n...");
		const fakePdf = Buffer.from("MZ\x90\x00executable");

		expect(detectType(validPdf, "cours.pdf")).toBe("application/pdf");
		expect(detectType(fakePdf, "virus.pdf")).toBeNull();
	});
});