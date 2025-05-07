import React, { useEffect, useState } from "react";
import styles from "./Modal.module.css";
import { motion, AnimatePresence } from "framer-motion";

function getPlatformList(data) {
  // TMDB: data['watch/providers'] suele estar en data['watch/providers'] o data['watch_providers']
  // Pero en la API de detalle, hay que hacer otra petición a /movie/{id}/watch/providers
  // Aquí asumimos que data.watchProviders es un array de plataformas, si no, lo tratamos como vacío
  if (!data.watchProviders || !Array.isArray(data.watchProviders) || data.watchProviders.length === 0) {
    // Si no hay plataformas, comprobamos si el estreno es reciente (menos de 2 meses)
    if (data.release_date) {
      const release = new Date(data.release_date);
      const now = new Date();
      const diffMonths = (now.getFullYear() - release.getFullYear()) * 12 + (now.getMonth() - release.getMonth());
      if (diffMonths <= 2) {
        return <div className={styles.platformCine}>Aún en cines</div>;
      }
    }
    return <div className={styles.platformNone}>No disponible en ninguna plataforma</div>;
  }
  return (
    <ul className={styles.platformList}>
      {data.watchProviders.map((p, i) => (
        <li key={i} className={styles.platformItem}>
          {p.logo_path && <img src={`https://image.tmdb.org/t/p/w45${p.logo_path}`} alt={p.provider_name} className={styles.platformLogo} />}
          <span>{p.provider_name}</span>
        </li>
      ))}
    </ul>
  );
}

export default function Modal({ open, onClose, data }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        setIsAuthenticated(res.ok);
      } catch {
        setIsAuthenticated(false);
      }
    }
    async function checkFavourite() {
      if (!open || !data?.imdb_id) return;
      try {
        const res = await fetch("/api/user/favourites/getFavourites/");
        if (!res.ok) return;
        const favs = await res.json();
        let favList = Array.isArray(favs.favourites) ? favs.favourites : (favs.favourites?.content || []);
        setIsAdded(favList.some(f => f.external_id === data.imdb_id));
      } catch {
        setIsAdded(false);
      }
    }
    if (open) {
      checkAuth();
      checkFavourite();
    }
  }, [open, data]);

  function handleAddClick(e) {
    if (!isAuthenticated) {
      e.preventDefault();
      alert("Debes registrarte o iniciar sesión para añadir a tu videoclub.");
      return;
    }
    // Obtener el externalId de IMDb
    const externalId = data?.imdb_id;
    if (!externalId) {
      alert("No se pudo obtener el IMDb ID del contenido.");
      return;
    }
    fetch("/api/user/favourites/updateFavourites/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ add: [{ external_id: externalId }] }),
    })
      .then(res => {
        if (res.ok) {
          setIsAdded(true); // Cambia el estado antes del alert
          alert("Añadido a favoritos");
          // Enviar notificación
          fetch("/api/user/notifications", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: `${data.title || data.name} has been added to your videoclub` })
          });
        } else {
          alert("Error al añadir a favoritos");
        }
      })
      .catch(() => {
        alert("Error de red al añadir a favoritos");
      });
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={styles.modalBackdrop}
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className={styles.modalContentLarge}
            onClick={e => e.stopPropagation()}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div
              className={styles.modalPoster}
              style={{ backgroundImage: `url(https://image.tmdb.org/t/p/original${data?.backdrop_path || data?.poster_path})` }}
            >
              <div className={styles.modalBlur} />
              {data && (
                <img
                  className={styles.modalPosterImg}
                  src={`https://image.tmdb.org/t/p/w500${data.poster_path}`}
                  alt={data.title || data.name}
                />
              )}
            </div>
            <div className={styles.modalInfo}>
              <button className={styles.modalClose} onClick={onClose}>×</button>
              <h2 className={styles.modalTitle}>{data?.title || data?.name}</h2>
              {data?.tagline && <div className={styles.modalTagline}>{data.tagline}</div>}
              <div className={styles.modalGenres}>{data?.genres ? data.genres.map(g => g.name).join(", ") : ""}</div>
              <div className={styles.modalMeta}>
                <span>⭐ {data?.vote_average?.toFixed(1)}</span>
                {data?.runtime && <span>⏱ {data.runtime} min</span>}
                {data?.release_date && <span>📅 {data.release_date}</span>}
                {data?.number_of_seasons && <span>📺 {data.number_of_seasons} temporadas</span>}
              </div>
              <p className={styles.modalOverview}>{data?.overview}</p>
              <button
                className={
                  (isAdded ? styles.addedBtn : styles.addFavBtn) +
                  (isAuthenticated === false ? ' ' + styles.disabledBtn : '')
                }
                title="Add to videoclub"
                onClick={handleAddClick}
                disabled={isAdded}
              >
                {isAdded ? "Added" : "Add"}
              </button>
              {isAuthenticated === false && (
                <div className={styles.authWarningMsg}>
                  You must register or log in to add to your videoclub.
                </div>
              )}
            </div>
            <aside className={styles.modalAside}>
              <h3 className={styles.platformTitle}>Aviable on:</h3>
              {getPlatformList(data || {})}
            </aside>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
