import { createCipheriv, createDecipheriv, hkdfSync, randomBytes } from "node:crypto";
import { MESSAGE_KEY_V1 } from "$app/env/private";

const MESSAGE_VERSION = "v1";

let masterKey: Buffer | undefined;
function getMasterKey(): Buffer {
    if (!masterKey) {
        if (!/^[0-9a-f]{64}$/i.test(MESSAGE_KEY_V1 ?? "")) throw new Error("MESSAGE_KEY_V1 manquante ou invalide dans le .env");
        masterKey = Buffer.from(MESSAGE_KEY_V1, "hex");
    }
    return masterKey;
}

/* ---------- Messages : même format que l'ancien crypto.js ("v1:iv:tag:données") ---------- */

export function encryptMessage(plain: string, conversationId: number | string): string {
    const iv = randomBytes(12);
    const cipher = createCipheriv("aes-256-gcm", getMasterKey(), iv);
    cipher.setAAD(Buffer.from(String(conversationId)));
    const data = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
    return [MESSAGE_VERSION, iv.toString("base64"), cipher.getAuthTag().toString("base64"), data.toString("base64")].join(":");
}

export function decryptMessage(stored: string, conversationId: number | string): string {
    const [version, iv, tag, data] = stored.split(":");
    if (version !== MESSAGE_VERSION) throw new Error("Version de clé inconnue");
    const decipher = createDecipheriv("aes-256-gcm", getMasterKey(), Buffer.from(iv, "base64"));
    decipher.setAAD(Buffer.from(String(conversationId)));
    decipher.setAuthTag(Buffer.from(tag, "base64"));
    return Buffer.concat([decipher.update(Buffer.from(data, "base64")), decipher.final()]).toString("utf8");
}

/* ---------- Fichiers : AES-256-GCM avec une clé dérivée de MESSAGE_KEY_V1 ---------- */

let fileKey: Buffer | undefined;
function getFileKey(): Buffer {
    fileKey ??= Buffer.from(hkdfSync("sha256", getMasterKey(), Buffer.alloc(0), "etulib:lesson-files:v1", 32));
    return fileKey;
}

const FILE_VERSION = 1;
const HEADER = 1 + 12 + 16;

export function encryptFile(plain: Buffer, lessonId: number): Buffer {
    const iv = randomBytes(12);
    const cipher = createCipheriv("aes-256-gcm", getFileKey(), iv);
    cipher.setAAD(Buffer.from(`lesson:${lessonId}`));
    const data = Buffer.concat([cipher.update(plain), cipher.final()]);
    return Buffer.concat([Buffer.from([FILE_VERSION]), iv, cipher.getAuthTag(), data]);
}

export function decryptFile(stored: Buffer, lessonId: number): Buffer {
    if (stored.length < HEADER || stored[0] !== FILE_VERSION) throw new Error("Fichier chiffré invalide ou version inconnue");
    const decipher = createDecipheriv("aes-256-gcm", getFileKey(), stored.subarray(1, 13));
    decipher.setAAD(Buffer.from(`lesson:${lessonId}`));
    decipher.setAuthTag(stored.subarray(13, HEADER));
    return Buffer.concat([decipher.update(stored.subarray(HEADER)), decipher.final()]);
}