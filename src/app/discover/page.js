'use client'

import Card from "@/app/components/card/Card";
import { useEffect, useState } from "react";
import React from "react";
import styles from "./discover.module.css";

export default function DiscoverPage() {

  // Estado para endpoint y parámetros
  const [endpoint, setEndpoint] = useState("/trending/all/week");
  const [params, setParams] = useState({});
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const [contentCount, setContentCount] = useState(20);

  // Filtros avanzados
  const [sortBy, setSortBy] = useState("popularity");
  const [orderDirection, setOrderDirection] = useState("desc");
  const [genre, setGenre] = useState("");
  const [genres, setGenres] = useState([]);
  const [provider, setProvider] = useState("");
  const [providers, setProviders] = useState([]);

  // Estado para búsqueda
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchMode, setSearchMode] = useState(false);

  // Cargar géneros y plataformas según tipo
  useEffect(() => {

    // Géneros principales personalizados
    const mainGenres = [
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

  // Cambia sortBy cuando cambia el campo o la dirección
  useEffect(() => {
    setParams(prev => ({
      ...prev,
      sort_by: `${sortBy}.${orderDirection}`
    }));
  }, [sortBy, orderDirection]);

  useEffect(() => {
    if (searchMode) return; // No refrescar discover si estamos en modo búsqueda
    const BASE_URL = "https://api.themoviedb.org/3";
    const query = new URLSearchParams({
      ...params,
      api_key: process.env.NEXT_PUBLIC_TMDB_API_KEY
    }).toString();
    fetch(`${BASE_URL}${endpoint}?${query}`)
      .then(res => res.json())
      .then(data => setResults(data.results || []))
      .catch(() => setError("Error al cargar resultados"));
  }, [endpoint, params, searchMode]);

  const dateYear = function (date) {
    let year = new Date(date)
    return year.getFullYear()
  }

  const showFilters = endpoint === "/discover/movie" || endpoint === "/discover/tv";

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchMode(true);
    const BASE_URL = "https://api.themoviedb.org/3";
    const query = new URLSearchParams({
      api_key: process.env.NEXT_PUBLIC_TMDB_API_KEY,
      query: searchQuery
    }).toString();
    const res = await fetch(`${BASE_URL}/search/multi?${query}`);
    const data = await res.json();
    setResults(data.results || []);
    setIsSearching(false);
  };

  return (
    <div className={styles.mainDiscover}>
      <h1>Discover</h1>
      <p>Descubre nuevas películas y series recomendadas para ti.</p>

      {error && <div style={{ color: "red" }}>{error}</div>}

      <form className={styles.discoverForm} onSubmit={e => e.preventDefault()}>
        <label className={styles.discoverLabel}>
          Tipo:
          <select
            value={endpoint}
            onChange={e => setEndpoint(e.target.value)}
            className={styles.discoverSelect}
          >
            <option value="/trending/all/week">Todos</option>
            <option value="/discover/movie">Películas</option>
            <option value="/discover/tv">Series</option>
          </select>
        </label>
        {showFilters && (
          <>
            <div className={styles.orderButtonWrapper}>
              <label className={styles.discoverLabel} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Ordenar por:
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className={styles.discoverSelect}
                  style={{ minWidth: '120px' }}
                >
                  <option value="popularity">Popularidad</option>
                  <option value="release_date">Fecha</option>
                  <option value="vote_average">Puntuación</option>
                </select>
                <button
                  type="button"
                  className={styles.orderButton}
                  onClick={() => setOrderDirection(orderDirection === 'desc' ? 'asc' : 'desc')}
                  aria-label={orderDirection === 'desc' ? 'Orden descendente' : 'Orden ascendente'}
                >
                  {orderDirection === 'desc' ? '↓' : '↑'}
                </button>
              </label>
            </div>
            <label className={styles.discoverLabel}>
              Género:
              <select
                value={genre}
                onChange={e => setGenre(e.target.value)}
                className={styles.discoverSelect}
              >
                <option value="">Todos</option>
                {genres.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </label>
            <label className={styles.discoverLabel}>
              Plataforma:
              <select
                value={provider}
                onChange={e => setProvider(e.target.value)}
                className={styles.discoverSelect}
              >
                <option value="">Todas</option>
                {providers.map(p => (
                  <option key={p.provider_id} value={p.provider_id}>{p.provider_name}</option>
                ))}
              </select>
            </label>
          </>
        )}
      </form>

      <form onSubmit={handleSearch} className={styles.searchBar}>
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Buscar películas o series..."
          className={styles.searchInput}
        />
        <button type="submit" className={styles.searchButton}>Buscar</button>
        <button
          type="button"
          className={styles.resetButton}
          onClick={() => {
            setSearchQuery("");
            setEndpoint("/trending/all/week");
            setSearchMode(false);
          }}
        >
          Restablecer
        </button>
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
    </div>
  );
}
