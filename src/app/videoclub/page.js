"use client"

import React, { useEffect, useState } from "react";
import Card from "@/app/components/card/Card";
import styles from "./videoclub.module.css";

export default function VideoclubPage() {
  const [isLogged, setIsLogged] = useState(null); // null: loading, false: not logged, true: logged
  const [favourites, setFavourites] = useState(null); // null: loading, []: loaded
  const [cards, setCards] = useState([]);
  const [loadingCards, setLoadingCards] = useState(false);
  const [movieMeta, setMovieMeta] = useState([]); // Nuevo estado para títulos y fechas

  const dateYear = function (date) {
    let year = new Date(date)
    return year.getFullYear()
  }

  useEffect(() => {
    // Llamar a la API sin Authorization, la cookie se recoge en el backend
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
  }, []);

  // Buscar detalles de TMDB para los favoritos (usando IMDB id)
  useEffect(() => {
    if (!favourites || favourites.length === 0) {
      setCards([]);
      setMovieMeta([]); // Limpiar movieMeta si no hay favoritos
      return;
    }
    setLoadingCards(true);
    const fetchAll = async () => {
      const promises = favourites.map(fav => {
        return fetch(`https://api.themoviedb.org/3/find/${fav.external_id}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&external_source=imdb_id`)
          .then(res => res.json())
          .then(data => {
            // Puede estar en movie_results o tv_results
            if (data.movie_results && data.movie_results.length > 0) {
              return { ...data.movie_results[0], type: "movie" };
            } else if (data.tv_results && data.tv_results.length > 0) {
              return { ...data.tv_results[0], type: "tv" };
            } else {
              return null;
            }
          });
      });
      const results = (await Promise.all(promises)).filter(Boolean);
      setCards(results);
      // Crear array auxiliar con título y fecha
      const meta = results.map(item => ({
        title: item.title || item.name || "",
        date: item.release_date || item.first_air_date || "",
        type: item.type || "",
        id: item.id
      }));
      setMovieMeta(meta);
      setLoadingCards(false);
    };
    fetchAll();
  }, [favourites]);

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
      <h1>Videoclub</h1>
      <p>Aquí puedes ver y gestionar tu colección de contenidos.</p>
      {loadingCards ? (
        <div className={styles.loadingMsg}>Cargando tus favoritos...</div>
      ) : (
        <div className={styles.cardsGrid}>
          {cards.map((item, idx) => (
            <Card
              key={item.id || idx}
              id={item.id}
              type={item.title ? "movie" : "tv"}
              image={item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : "/file.svg"}
              title={item.title || item.name}
              release_date={dateYear(item.release_date) || dateYear(item.first_air_date)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
