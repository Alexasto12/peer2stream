"use client"

import React, { useEffect, useState } from "react";
import Card from "@/app/components/card/Card";
import CustomSelect from "../components/customSelect/CustomSelect";
import styles from "./videoclub.module.css";

export default function VideoclubPage() {
  const [isLogged, setIsLogged] = useState(null); // null: loading, false: not logged, true: logged
  const [favourites, setFavourites] = useState(null); // null: loading, []: loaded
  const [cards, setCards] = useState([]);
  const [loadingCards, setLoadingCards] = useState(false);
  const [movieMeta, setMovieMeta] = useState([]); // Nuevo estado para títulos y fechas
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("title"); // "title" o "date"
  const [selectedIds, setSelectedIds] = useState([]); // selector de card para eliminarlas

  const dateYear = function (date) {
    let year = new Date(date)
    return year.getFullYear()
  }

  // funcion para alternas la seleccion
  const toggleSelect = (external_id) => {
    setSelectedIds(prev =>
      prev.includes(external_id)
        ? prev.filter(id => id !== external_id)
        : [...prev, external_id]
    );
  };

  // Opciones para el select
  const sortOptions = [
    { value: "title", label: "Título" },
    { value: "date", label: "Fecha" }
  ];

  // --- FUNCION PARA OBTENER FAVORITOS Y ACTUALIZAR ESTADOS ---
  const fetchFavourites = () => {
    fetch("/api/user/favourites/getFavourites/")
      .then(res => {
        if (res.status === 401) {
          setIsLogged(false);
          return null;
        }
        setIsLogged(true);
        return res.json();
      })
      .then(data => {
        let favs = [];
        if (data && data.favourites) {
          if (Array.isArray(data.favourites)) {
            favs = data.favourites;
          } else if (Array.isArray(data.favourites.content)) {
            favs = data.favourites.content;
          }
        }
        setFavourites(favs);
      })
      .catch(() => setFavourites([]));
  };

  // --- useEffect para cargar favoritos al montar ---
  useEffect(() => {
    fetchFavourites();
  }, []);

  // --- useEffect para actualizar cards y movieMeta cuando cambian los favoritos ---
  useEffect(() => {
    if (!favourites || favourites.length === 0) {
      setCards([]);
      setMovieMeta([]);
      return;
    }
    setLoadingCards(true);
    const fetchAll = async () => {
      const promises = favourites.map(fav => {
        return fetch(`https://api.themoviedb.org/3/find/${fav.external_id}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&external_source=imdb_id`)
          .then(res => res.json())
          .then(data => {
            if (data.movie_results && data.movie_results.length > 0) {
              return { ...data.movie_results[0], type: "movie", external_id: fav.external_id };
            } else if (data.tv_results && data.tv_results.length > 0) {
              return { ...data.tv_results[0], type: "tv", external_id: fav.external_id };
            } else {
              return null;
            }
          });
      });
      const results = (await Promise.all(promises)).filter(Boolean);
      setCards(results);
      const meta = results.map(item => ({
        title: item.title || item.name || "",
        date: item.release_date || item.first_air_date || "",
        type: item.type || "",
        id: item.id,
        external_id: item.external_id
      }));
      setMovieMeta(meta);
      setLoadingCards(false);
    };
    fetchAll();
  }, [favourites]);

  // --- FILTRO Y ORDEN SIEMPRE SOBRE movieMeta Y cards ---
  const filteredMeta = movieMeta
    .filter(item => item.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === "title") {
        return a.title.localeCompare(b.title);
      } else if (sort === "date") {
        return (b.date || "").localeCompare(a.date || "");
      }
      return 0;
    });
  const filteredCards = filteredMeta.map(meta => cards.find(card => card.id === meta.id)).filter(Boolean);

  // --- ELIMINAR SELECCIONADOS Y REFRESCAR ---
  const handleDeleteSelected = async () => {
    const toRemove = selectedIds.map(external_id => ({ external_id }));
    await fetch("/api/user/favourites/updateFavourites/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ add: [], remove: toRemove })
    });
    setSelectedIds([]);
    fetchFavourites(); // Refresca favoritos y, por efecto, cards y movieMeta
  };

  useEffect(() => {
    // console.log("selectedIds changed:", selectedIds);
  }, [selectedIds]);

  if (isLogged === null) {
    return <main style={{ paddingLeft: "220px", padding: "2rem" }}><p>Cargando...</p></main>;
  }
  if (!isLogged) {
    return <main style={{ paddingLeft: "220px", padding: "2rem" }}><h1>Videoclub</h1><p>Debes iniciar sesión para ver tu videoclub.</p></main>;
  }
  if (favourites === null) {
    return <main style={{ paddingLeft: "220px", padding: "2rem" }}><h1>Videoclub</h1><p>Cargando tus contenidos guardados...</p></main>;
  }
  if (favourites.length === 0) {
    return <main style={{ paddingLeft: "220px", padding: "2rem" }}><h1>Videoclub</h1><p>No tienes ningún contenido guardado en favoritos.</p></main>;
  }

  return (
    <div className={styles.mainVideoclub}>
      <h1 className={styles.title}>Videoclub</h1>
      <p className={styles.subtitle}>Aquí puedes ver y gestionar tu colección de contenidos.</p>
      <div className={styles.controls}>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por título..."
          className={styles.searchBar}
        />
        <CustomSelect options={sortOptions} value={sort} onChange={setSort} />

        {selectedIds.length > 0 && (
          <button
            className={styles.deleteBtn}
            onClick={handleDeleteSelected}
          >
            Borrar seleccionados
          </button>
        )}

      </div>
      {loadingCards ? (
        <div className={styles.loadingMsg}>Cargando tus favoritos...</div>
      ) : (
        <div className={styles.cardsGrid}>
          {filteredCards.map(card => (
            <div
              key={card.external_id}
              className={`${styles.cardWrapper} ${selectedIds.includes(card.external_id) ? styles.selectedCard : ""}`}
              onClick={() => toggleSelect(card.external_id)}
            >
              <Card
                id={card.id}
                type={card.title ? "movie" : "tv"}
                image={card.poster_path ? `https://image.tmdb.org/t/p/w500${card.poster_path}` : "/file.svg"}
                title={card.title || card.name}
                release_date={dateYear(card.release_date) || dateYear(card.first_air_date)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
