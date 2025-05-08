import React, { useEffect, useState } from "react";
import styles from "./Modal.module.css";
import { motion, AnimatePresence } from "framer-motion";

// Utilidad para obtener el director desde los créditos de TMDB
async function fetchDirector(data) {
  if (!data) return null;
  let tmdbApiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY || "TU_API_KEY";
  let url = null;
  if (data.media_type === "tv" || data.number_of_seasons) {
    url = `https://api.themoviedb.org/3/tv/${data.id}/credits?api_key=${tmdbApiKey}`;
  } else {
    url = `https://api.themoviedb.org/3/movie/${data.id}/credits?api_key=${tmdbApiKey}`;
  }
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const credits = await res.json();
    if (credits.crew) {
      const director = credits.crew.find(c => c.job === "Director");
      return director ? director.name : null;
    }
  } catch {}
  return null;
}

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
  const [isAdded, setIsAdded] = useState(null); // null = cargando, true/false = resuelto
  const [externalId, setExternalId] = useState(null);
  const [director, setDirector] = useState(null);

  useEffect(() => {
    async function fetchExternalId() {
      if (!data) return null;
      if (data.imdb_id) return data.imdb_id;
      if (data.media_type === "tv" || data.number_of_seasons) {
        try {
          const tmdbApiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY || "TU_API_KEY";
          const res = await fetch(`https://api.themoviedb.org/3/tv/${data.id}/external_ids?api_key=${tmdbApiKey}`);
          if (res.ok) {
            const ext = await res.json();
            return ext.imdb_id;
          }
        } catch {}
      }
      return null;
    }

    async function checkAuthAndFavourite() {
      setIsAdded(null);
      setExternalId(null);
      try {
        const res = await fetch("/api/auth/me");
        setIsAuthenticated(res.ok);
      } catch {
        setIsAuthenticated(false);
      }
      const extId = await fetchExternalId();
      setExternalId(extId);
      if (!open || !extId) {
        setIsAdded(false);
        return;
      }
      try {
        const res = await fetch("/api/user/favourites/getFavourites/");
        if (!res.ok) {
          setIsAdded(false);
          return;
        }
        const favs = await res.json();
        let favList = Array.isArray(favs.favourites) ? favs.favourites : (favs.favourites?.content || []);
        setIsAdded(favList.some(f => f.external_id === extId));
      } catch {
        setIsAdded(false);
      }
    }
    if (open && data) {
      checkAuthAndFavourite();
      fetchDirector(data).then(setDirector);
    }
  }, [open, data]);

  async function handleAddClick(e) {
    if (!isAuthenticated) {
      e.preventDefault();
      alert("Debes registrarte o iniciar sesión para añadir a tu videoclub.");
      return;
    }
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
          setIsAdded(true);
          alert("Añadido a favoritos");
          fetch("/api/user/notifications", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: `${data.title || data.name} has been added to your videoclub` })
          }).then(() => {
            window.dispatchEvent(new Event('notificationUpdate'));
          });
        } else {
          alert("Error al añadir a favoritos");
        }
      })
      .catch(() => {
        alert("Error de red al añadir a favoritos");
      });
  }

  async function handleRemoveClick(e) {
    if (!isAuthenticated) {
      e.preventDefault();
      alert("Debes registrarte o iniciar sesión para eliminar de tu videoclub.");
      return;
    }
    if (!externalId) {
      alert("No se pudo obtener el IMDb ID del contenido.");
      return;
    }
    fetch("/api/user/favourites/updateFavourites/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ remove: [{ external_id: externalId }] }),
    })
      .then(res => {
        if (res.ok) {
          setIsAdded(false);
          alert("Eliminado de tu videoclub");
          fetch("/api/user/notifications", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: `${data.title || data.name} has been removed from My Videoclub` })
          }).then(() => {
            window.dispatchEvent(new Event('notificationUpdate'));
          });
        } else {
          alert("Error al eliminar de favoritos");
        }
      })
      .catch(() => {
        alert("Error de red al eliminar de favoritos");
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
              <div className={styles.modalGenres}>
                {data?.genres && data.genres.map(g => (
                  <span key={g.id} className={styles.genreBadge}>{g.name}</span>
                ))}
              </div>
              <div className={styles.modalMeta}>
                <span>⭐ {data?.vote_average?.toFixed(1)}</span>
                {data?.runtime && <span>⏱ {data.runtime} min</span>}
                {data?.release_date && <span>📅 {data.release_date}</span>}
                {data?.number_of_seasons && <span>📺 {data.number_of_seasons} temporadas</span>}
              </div>
              <div className={styles.modalOverview}>
                {director && (
                  <div className={styles.overviewLine}>
                    <span className={styles.directorLabel}>Director:</span>
                    <span className={styles.directorName}>{director}</span>
                  </div>
                )}
                {data?.overview && data.overview.split('. ').map((line, i) => (
                  <div key={i} className={styles.overviewLine}>{line.trim()}{line.endsWith('.') ? '' : '.'}</div>
                ))}
              </div>
              {/* Solo mostrar el botón si isAdded no es null (ya se comprobó) */}
              {isAdded !== null && (
                <button
                  className={
                    (isAdded ? styles.addedBtn : styles.addFavBtn) +
                    (isAuthenticated === false ? ' ' + styles.disabledBtn : '')
                  }
                  title={isAdded ? "Remove from My Videoclub" : "Add to videoclub"}
                  onClick={isAdded ? handleRemoveClick : handleAddClick}
                  disabled={isAuthenticated === false}
                >
                  {isAdded ? "Remove from My Videoclub" : "Add"}
                </button>
              )}
              {isAdded === null && (
                <div style={{marginTop: 28, color: '#aaa'}}>Cargando estado...</div>
              )}
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
