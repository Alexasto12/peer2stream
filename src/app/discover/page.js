'use client'

import Card from "@/app/components/card/Card";
import { useEffect, useState, useRef, useCallback } from "react";
import React from "react";
import styles from "./discover.module.css";
import { motion } from 'framer-motion';
import CustomSelect from "@/app/components/customSelect/CustomSelect";
import SearchBar from "../components/searchBar/SearchBar";
import Modal from "@/app/components/modal/Modal";

export default function DiscoverPage() {

  // Estado para endpoint y parámetros
  const [endpoint, setEndpoint] = useState("/trending/all/week");
  const [params, setParams] = useState({});
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef(null);

  // Filtros avanzados
  const [sortBy, setSortBy] = useState("popularity");
  const [orderDirection, setOrderDirection] = useState("desc");
  const [genre, setGenre] = useState("");
  const [genres, setGenres] = useState([]);
  const [provider, setProvider] = useState("");
  const [providers, setProviders] = useState([]);

  // Mapeo de motes para simplificar nombres largos de proveedores
  const providerNicknames = {
    "Netflix": "Netflix",
    "Amazon Prime Video": "Prime",
    "Disney Plus": "Disney",
    "Crunchyroll": "Crunchyroll",
    "Movistar Plus+": "Movistar",
    "Max": "HBO",
    "Apple TV+": "Apple TV"
  };

  // Estado para búsqueda
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchMode, setSearchMode] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const debounceTimeout = useRef();

  // Estado para el modal y la película seleccionada
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);

  // Nueva función para búsqueda con debounce y sugerencias
  const handleSearchInput = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setSearchMode(!!value);
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    if (!value.trim()) {
      setSuggestions([]);
      setResults([]);
      setSearchMode(false);
      return;
    }
    debounceTimeout.current = setTimeout(async () => {
      setIsSearching(true);
      const BASE_URL = "https://api.themoviedb.org/3";
      const query = new URLSearchParams({
        api_key: process.env.NEXT_PUBLIC_TMDB_API_KEY,
        query: value
      }).toString();
      const res = await fetch(`${BASE_URL}/search/multi?${query}`);
      const data = await res.json();
      // Filtrar para ignorar personas (actores/actrices) y resultados sin imagen
      const filteredResults = (data.results || []).filter(item => item.media_type !== 'person' && item.poster_path);
      setSuggestions(filteredResults.slice(0, 5));
      setResults(filteredResults);
      setIsSearching(false);
    }, 800);
  };

  // Al hacer click en una sugerencia, se rellena el input y se muestran los resultados completos
  const handleSuggestionClick = (item) => {
    setSearchQuery(item.title || item.name);
    setSuggestions([]);
    setResults([item]);
    setSearchMode(true);
  };

  // Handler para abrir el modal y cargar info detallada y proveedores
  const handleFaviconClick = async ({ id, type }) => {
    setModalOpen(true);
    setModalData(null); // Mostrar loading
    const BASE_URL = "https://api.themoviedb.org/3";
    const endpoint = type === 'movie' ? 'movie' : 'tv';
    const query = new URLSearchParams({ api_key: process.env.NEXT_PUBLIC_TMDB_API_KEY }).toString();
    // 1. Obtener detalles
    const res = await fetch(`${BASE_URL}/${endpoint}/${id}?${query}`);
    const data = await res.json();
    // 2. Obtener proveedores
    let providers = [];
    try {
      const provRes = await fetch(`${BASE_URL}/${endpoint}/${id}/watch/providers?${query}`);
      const provData = await provRes.json();
      // España (ES) por defecto
      if (provData.results && provData.results.ES && provData.results.ES.flatrate) {
        // Filtrar plataformas principales y evitar redundancias
        const mainPlatforms = [
          "Netflix",
          "Amazon Prime",
          "Prime Video",
          "Disney+",
          "HBO",
          "Apple TV+",
          "Movistar+",
          "Filmin",
          "SkyShowtime",
          "Crunchyroll"
        ];
        const nicknameMap = {
          "Netflix": "Netflix",
          "Amazon Prime Video": "Prime Video",
          "Amazon Prime": "Prime Video",
          "Prime Video": "Prime Video",
          "Disney Plus": "Disney+",
          "Disney+": "Disney+",
          "HBO Max": "HBO",
          "Max": "HBO",
          "HBO": "HBO",
          "Apple TV+": "Apple TV+",
          "Movistar Plus+": "Movistar+",
          "Movistar+": "Movistar+",
          "Filmin": "Filmin",
          "SkyShowtime": "SkyShowtime",
          "Crunchyroll": "Crunchyroll"
        };
        const unique = {};
        provData.results.ES.flatrate.forEach(p => {
          // Normalizar nombre para evitar duplicados y aplicar mote
          let name = p.provider_name;
          if (name.toLowerCase().includes("netflix")) name = "Netflix";
          if (name.toLowerCase().includes("amazon")) name = "Prime Video";
          if (name.toLowerCase().includes("disney")) name = "Disney+";
          if (name.toLowerCase().includes("hbo") || name.toLowerCase().includes("max")) name = "HBO";
          if (name.toLowerCase().includes("apple")) name = "Apple TV+";
          if (name.toLowerCase().includes("movistar")) name = "Movistar+";
          if (name.toLowerCase().includes("filmin")) name = "Filmin";
          if (name.toLowerCase().includes("skyshowtime")) name = "SkyShowtime";
          if (name.toLowerCase().includes("crunchyroll")) name = "Crunchyroll";
          const nickname = nicknameMap[name] || name;
          if (mainPlatforms.includes(nickname) && !unique[nickname]) {
            unique[nickname] = { ...p, provider_name: nickname };
          }
        });
        providers = Object.values(unique);
      }
    } catch {}
    data.watchProviders = providers;
    setModalData(data);
  };

  // Cargar géneros y plataformas según tipo
  useEffect(() => {

    // Géneros principales personalizados
    const mainGenres = [
      { id: 35, name: "Comedy" },
      { id: 28, name: "Action" },
      { id: 16, name: "Animation" },
      { id: 18, name: "Drama" },
      { id: 27, name: "Horror" },
      { id: 10749, name: "Romance" },
      { id: 53, name: "Thriller" },
      { id: 878, name: "Science Fiction" },
      { id: 99, name: "Documentary" },
      { id: 14, name: "Fantasy" },
      { id: 36, name: "History" },
      { id: 10402, name: "Music" },
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
          "Movistar Plus+",
          "Max",
          "Apple TV+"
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
      .then(data => {
        const filtered = (data.results || []).filter(item => item.poster_path);
        setResults(filtered);
      })
      .catch(() => setError("Error loading results"));
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

  // Reset page/results cuando cambian endpoint o filtros
  useEffect(() => {
    setResults([]);
    setPage(1);
    setHasMore(true);
  }, [endpoint, sortBy, orderDirection, genre, provider, searchMode]);

  // Cargar más resultados (scroll infinito)
  useEffect(() => {
    // Solo si no estamos en modo búsqueda
    if (searchMode) return;

    // Solo para discover o trending
    if (
      endpoint !== "/trending/all/week" &&
      endpoint !== "/discover/movie" &&
      endpoint !== "/discover/tv"
    ) return;

    const BASE_URL = "https://api.themoviedb.org/3";
    const query = new URLSearchParams({
      ...params,
      api_key: process.env.NEXT_PUBLIC_TMDB_API_KEY,
      page
    }).toString();

    fetch(`${BASE_URL}${endpoint}?${query}`)
      .then(res => res.json())
      .then(data => {
        setResults(prev => page === 1 ? (data.results || []) : [...prev, ...(data.results || [])]);
        setHasMore(data.page < data.total_pages);
      })
      .catch(() => setError("Error al cargar resultados"));
  }, [endpoint, params, page, searchMode]);

  // IntersectionObserver igual que antes
  const handleObserver = useCallback((entries) => {
    const target = entries[0];
    if (target.isIntersecting && hasMore) {
      setPage(prev => prev + 1);
    }
  }, [hasMore]);

  useEffect(() => {
    if (searchMode) return;
    const option = { root: null, rootMargin: "20px", threshold: 1.0 };
    const observer = new IntersectionObserver(handleObserver, option);
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [handleObserver, searchMode, results]);

  return (
    <div className={`${styles.mainDiscover} ${styles.mainDiscoverScrollable}`}>
      {/* Minimalist centered search bar, always visible */}
      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        setResults={setResults}
        setIsSearching={setIsSearching}
        setSearchMode={setSearchMode}
        suggestions={suggestions}
        setSuggestions={setSuggestions}
        handleSuggestionClick={handleSuggestionClick}
      />
      {/* Modal para info de película/serie */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} data={modalData} />

      {/* Modern minimalist filter bar */}
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 70, damping: 18 }}
        className="w-full flex flex-wrap gap-4 justify-center items-center mb-5"
        style={{ minHeight: 80 }}
      >
        {/* Type selector: SIEMPRE visible */}
        <motion.div
          layout
          transition={{ type: 'spring', stiffness: 70, damping: 18 }}
          className="bg-[#140e9a] rounded-full px-6 py-3 flex items-center shadow-sm border border-gray-800"
        >
          <CustomSelect
            id="type-select"
            label="Type"
            value={endpoint}
            onChange={setEndpoint}
            options={[
              { value: "/trending/all/week", label: "All" },
              { value: "/discover/movie", label: "Movies" },
              { value: "/discover/tv", label: "Series" },
            ]}
            className="min-w-[150px]"
          />
        </motion.div>
        {/* Contenedor de filtros condicionales con ancho fijo */}
        <motion.div layout className="flex gap-4 min-h-[64px]" >
          {showFilters && (
            <>
              <motion.div
                key="genre"
                layout
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ type: 'spring', stiffness: 70, damping: 18, delay: 0.05 }}
                className="bg-[#140e9a] rounded-full px-6 py-3 flex items-center shadow-sm border border-gray-800"
              >
                <CustomSelect
                  id="genre-select"
                  label="Genre"
                  value={genre}
                  onChange={setGenre}
                  options={[{ value: "", label: "All" }, ...genres.map(g => ({ value: g.id, label: g.name }))]}
                  className="min-w-[120px]"
                />
              </motion.div>
              <motion.div
                key="platform"
                layout
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ type: 'spring', stiffness: 70, damping: 18, delay: 0.1 }}
                className="bg-[#140e9a] rounded-full px-6 py-3 flex items-center shadow-sm border border-gray-800"
              >
                <CustomSelect
                  id="platform-select"
                  label="Platform"
                  value={provider}
                  onChange={setProvider}
                  options={[{ value: "", label: "All" }, ...providers.map(p => ({ value: p.provider_id, label: providerNicknames[p.provider_name] || p.provider_name }))]}
                  className="min-w-[120px]"
                />
              </motion.div>
              <motion.div
                key="order"
                layout
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ type: 'spring', stiffness: 70, damping: 18, delay: 0.15 }}
                className="bg-[#140e9a] rounded-full px-6 py-3 flex items-center shadow-sm border border-gray-800"
              >
                <CustomSelect
                  id="order-select"
                  label="Order"
                  value={sortBy}
                  onChange={setSortBy}
                  options={[
                    { value: "popularity", label: "Popularity" },
                    { value: "release_date", label: "Date" },
                    { value: "vote_average", label: "Rating" },
                  ]}
                  className="min-w-[120px]"
                />
                <button
                  type="button"
                  className="ml-3 w-10 h-10 flex items-center justify-center rounded-full border border-gray-700 bg-[#18181b] hover:bg-[#23232b] transition-transform focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={() => setOrderDirection(orderDirection === 'desc' ? 'asc' : 'desc')}
                  aria-label={orderDirection === 'desc' ? 'Descending order' : 'Ascending order'}
                >
                  <span style={{ display: 'inline-block', transform: orderDirection === 'desc' ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.2s', fontSize: '1.4rem', color: '#fff' }}>▼</span>
                </button>
              </motion.div>
            </>
          )}
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 justify-start items-stretch mt-8">
        {results.filter(item => item.poster_path).map((item, idx) => (
          <Card
            key={idx}
            id={item.id}
            type={item.media_type || (endpoint.includes("movie") ? "movie" : "tv")}
            image={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
            title={item.title || item.name}
            release_date={item.release_date || item.first_air_date ? dateYear(item.release_date || item.first_air_date) : ""}
            className="!h-[420px] !w-full"
            onFaviconClick={handleFaviconClick}
          />
        ))}
      </div>
      {(endpoint === "/trending/all/week" ||
        endpoint === "/discover/movie" ||
        endpoint === "/discover/tv") && hasMore && (
        <div ref={loaderRef} style={{ height: 40, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <span style={{ color: "#fff" }}>Cargando más...</span>
        </div>
      )}
    </div>
  );
}
