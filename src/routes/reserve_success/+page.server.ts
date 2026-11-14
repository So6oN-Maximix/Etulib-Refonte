import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ cookies }) => {
    const raw = cookies.get("flash");
    let flash = null;
    if (raw) {
        flash = JSON.parse(raw);
        cookies.delete("flash", { path: "/mon-espace" });
    }
    return { flash };
};