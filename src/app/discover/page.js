'use client'

import Card from "@/app/components/card/Card";
import { useEffect, useState } from "react";
import React from "react";

export default function DiscoverPage() {
  // Estado para endpoint y parámetros
  const [endpoint, setEndpoint] = useState("/trending/all/week");
  const [params, setParams] = useState({});
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const [contentCount, setContentCount] = useState(20);

  // Filtros avanzados
  const [sortBy, setSortBy] = useState("popularity.desc");
  const [genre, setGenre] = useState("");
  const [genres, setGenres] = useState([]);
  const [provider, setProvider] = useState("");
  const [providers, setProviders] = useState([]);

  // Cargar géneros y plataformas según tipo
  useEffect(() => {

    // Géneros principales personalizados
    const mainGenres = [
      { id: "", name: "Todos" },
      { id: 35, name: "Comedia" },
      { id: 28, name: "Acción" },
      { id: 16, name: "Animación" },
      { id: 18, name: "Drama" },
      { id: 27, name: "Terror" },
      { id: 10749, name: "Romance" },
      { id: 53, name: "Thriller" },
      { id: 878, name: "Ciencia ficción" },
      { id: 99, name: "Documental" },
      { id: 14, name: "Fantasía" },
      { id: 36, name: "Historia" },
      { id: 10402, name: "Música" },
    ];

    setGenres(mainGenres);

    const type = endpoint.includes("tv") ? "tv" : "movie";
    fetch(`https://api.themoviedb.org/3/watch/providers/${type}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&language=es&watch_region=ES`)
      .then(res => res.json())
      .then(data => {
        const allowedProviders = [
          "Netflix",
          "Amazon Prime Video",
          "Disney Plus",
          "Crunchyroll",
          "Movistar Plus",
          "HBO Max",
          "Apple TV Plus"
        ];
        const filtered = (data.results || []).filter(p =>
          allowedProviders.includes(p.provider_name)
        );
        setProviders(filtered);
      });
  }, [endpoint]);

  // Actualizar params cuando cambian los filtros
  useEffect(() => {
    // Si el provider es vacío ("Todos"), incluir todos los IDs de los permitidos
    let providerParam = provider;
    let watchRegionParam = provider ? "ES" : undefined;

    if (provider === "") {
      // IDs de los proveedores permitidos
      providerParam = providers.map(p => p.provider_id).join("|");
      watchRegionParam = providers.length > 0 ? "ES" : undefined;
    }

    setParams({
      sort_by: sortBy,
      with_genres: genre,
      with_watch_providers: providerParam,
      watch_region: watchRegionParam
    });
  }, [sortBy, genre, provider, providers]);

  useEffect(() => {
    const BASE_URL = "https://api.themoviedb.org/3";
    const query = new URLSearchParams({
      ...params,
      api_key: process.env.NEXT_PUBLIC_TMDB_API_KEY
    }).toString();

    fetch(`${BASE_URL}${endpoint}?${query}`)
      .then(res => res.json())
      .then(data => setResults(data.results || []))
      .catch(() => setError("Error al cargar resultados"));
  }, [endpoint, params]);

  const dateYear = function (date) {
    let year = new Date(date)
    return year.getFullYear()
  }

  return (
    <main style={{ paddingLeft: "220px", padding: "2rem" }}>
      <h1>Discover</h1>
      <p>Descubre nuevas películas y series recomendadas para ti.</p>

      {error && <div style={{ color: "red" }}>{error}</div>}

      <form
        style={{
          display: "flex",
          gap: "1rem",
          alignItems: "center",
          margin: "2rem 0 1.5rem 0",
          background: "#18181b",
          padding: "1rem 1.5rem",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          maxWidth: "600px"
        }}
        onSubmit={e => e.preventDefault()}
      >
        <label style={{ color: "#fff" }}>
          Tipo:
          <select
            value={endpoint}
            onChange={e => setEndpoint(e.target.value)}
            style={{
              marginLeft: "0.5rem",
              padding: "0.3rem 0.7rem",
              borderRadius: "6px",
              border: "1px solid #333",
              background: "#23232b",
              color: "#fff"
            }}
          >
            <option value="/trending/all/week">Todos</option>
            <option value="/discover/movie">Películas</option>
            <option value="/discover/tv">Series</option>
          </select>
        </label>
        <label style={{ color: "#fff" }}>
          Ordenar por:
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            style={{
              marginLeft: "0.5rem",
              padding: "0.3rem 0.7rem",
              borderRadius: "6px",
              border: "1px solid #333",
              background: "#23232b",
              color: "#fff"
            }}
          >
            <option value="popularity.desc">Popularidad ↓</option>
            <option value="popularity.asc">Popularidad ↑</option>
            <option value="release_date.desc">Fecha ↓</option>
            <option value="release_date.asc">Fecha ↑</option>
            <option value="vote_average.desc">Puntuación ↓</option>
            <option value="vote_average.asc">Puntuación ↑</option>
          </select>
        </label>
        <label style={{ color: "#fff" }}>
        </label>
        <label style={{ color: "#fff" }}>
          Género:
          <select
            value={genre}
            onChange={e => setGenre(e.target.value)}
            style={{
              marginLeft: "0.5rem",
              padding: "0.3rem 0.7rem",
              borderRadius: "6px",
              border: "1px solid #333",
              background: "#23232b",
              color: "#fff"
            }}
          >
            <option value="">Todos</option>
            {genres.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </label>
        <label style={{ color: "#fff" }}>
          Plataforma:
          <select
            value={provider}
            onChange={e => setProvider(e.target.value)}
            style={{
              marginLeft: "0.5rem",
              padding: "0.3rem 0.7rem",
              borderRadius: "6px",
              border: "1px solid #333",
              background: "#23232b",
              color: "#fff"
            }}
          >
            <option value="">Todas</option>
            {providers.map(p => (
              <option key={p.provider_id} value={p.provider_id}>{p.provider_name}</option>
            ))}
          </select>
        </label>
      </form>

      <div className="flex flex-wrap gap-6 justify-start items-start mt-8">
        {results.slice(0, contentCount).map((item, idx) => (
          <Card
            key={idx}
            id={item.id}
            type={item.media_type || (endpoint.includes("movie") ? "movie" : "tv")}
            image={item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : "/file.svg"}
            title={item.title || item.name}
            release_date={item.release_date || item.first_air_date ? dateYear(item.release_date || item.first_air_date) : ""}
          />
        ))}
      </div>
    </main>
  );
}
