import { randomUUID } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { UPLOAD_DIR } from "$app/env/private";
import { decryptFile, encryptFile } from "./crypto";

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 Mo
export const MAX_FILES_PER_UPLOAD = 10;

const DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const bytes = (...b: number[]) => Buffer.from(b);

const TYPES = [
    { mime: "application/pdf", exts: [".pdf"], test: (b: Buffer) => b.subarray(0, 5).toString("latin1") === "%PDF-" },
    { mime: "image/png", exts: [".png"], test: (b: Buffer) => b.subarray(0, 8).equals(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) },
    { mime: "image/jpeg", exts: [".jpg", ".jpeg"], test: (b: Buffer) => b.subarray(0, 3).equals(bytes(0xff, 0xd8, 0xff)) },
    { mime: "application/msword", exts: [".doc"], test: (b: Buffer) => b.subarray(0, 8).equals(bytes(0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1)) },
    { mime: DOCX, exts: [".docx"], test: (b: Buffer) => b.subarray(0, 4).equals(bytes(0x50, 0x4b, 0x03, 0x04)) }
];

export function detectType(content: Buffer, fileName: string): string | null {
    const ext = fileName.slice(fileName.lastIndexOf(".")).toLowerCase();
    return TYPES.find((t) => t.exts.includes(ext) && t.test(content))?.mime ?? null;
}

export function cleanFileName(name: string): string { return name.replace(/[\\/\u0000-\u001f]/g, "_").trim().slice(-120) || "document"; }

const uploadDir = () => join(UPLOAD_DIR || join(process.cwd(), "uploads"), "lessons");

export async function saveEncrypted(content: Buffer, lessonId: number): Promise<string> {
    const filename = `${randomUUID()}.enc`;
    await mkdir(uploadDir(), { recursive: true });
    await writeFile(join(uploadDir(), filename), encryptFile(content, lessonId), { flag: "wx", mode: 0o600 });
    return filename;
}

export async function readDecrypted(filename: string, lessonId: number): Promise<Buffer> {
    return decryptFile(await readFile(join(uploadDir(), basename(filename))), lessonId);
}

export async function removeStored(filename: string): Promise<void> {
    await rm(join(uploadDir(), basename(filename)), { force: true });
}