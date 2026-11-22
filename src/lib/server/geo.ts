interface CommuneEntry {
    code: string;
    lat: number;
    lon: number;
}

let allCommunesCache: CommuneEntry[] | null = null;
const radiusCache = new Map<string, string[]>();

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function loadAllCommunes(): Promise<CommuneEntry[]> {
    if (allCommunesCache) return allCommunesCache;

    const res = await fetch("https://geo.api.gouv.fr/communes?fields=code,centre");
    if (!res.ok) return [];

    const data: { code: string; centre?: { coordinates?: [number, number] } }[] = await res.json();
    allCommunesCache = data
        .filter(c => Array.isArray(c.centre?.coordinates) && c.centre.coordinates.length >= 2)
        .map(c => ({
            code: c.code,
            lon: c.centre!.coordinates![0],
            lat: c.centre!.coordinates![1]
        }));

    return allCommunesCache;
}

export async function getNearbyCityCodes(inseeCode: string, radiusKm: number): Promise<string[]> {
    if (!inseeCode) return [];
    if (radiusKm <= 0) return [inseeCode];

    const cacheKey = `${inseeCode}:${radiusKm}`;
    const cached = radiusCache.get(cacheKey);
    if (cached) return cached;

    try {
        const communes = await loadAllCommunes();
        const origin = communes.find((c) => c.code === inseeCode);
        if (!origin) return [inseeCode];

        const codes = communes
            .filter(c => haversineKm(origin.lat, origin.lon, c.lat, c.lon) <= radiusKm)
            .map(c => c.code);

        if (!codes.includes(inseeCode)) codes.push(inseeCode);
        radiusCache.set(cacheKey, codes);
        return codes;
    } catch { return [inseeCode]; }
}