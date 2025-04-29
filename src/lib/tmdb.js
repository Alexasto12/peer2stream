const BASE_URL = "https://api.themoviedb.org/3";
const api_key = process.env.TMDB_API_KEY;

export async function fetchFromTMDb(endpoint, params = {}) {
    const url = new URL(`${BASE_URL}${endpoint}`);

    // Añadir parámetros
    url.searchParams.set("api_key", api_key);
    for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, value);
    }

    const res = await fetch(url.href);
    if (!res.ok) throw new Error(`Error en TMDb: ${res.status}`);
    return res.json();
}