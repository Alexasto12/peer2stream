import React, { useEffect, useState } from "react";
import styles from "./Modal.module.css";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

// Configuration for the p2service
const P2SERVICE_URL = "http://localhost:3000";

// Utility to check if the p2service service is available
async function checkP2Service() {
  try {
    console.log(`Intentando conectar con el servicio de contenido en: ${P2SERVICE_URL}/status`);

    const res = await fetch(`${P2SERVICE_URL}/status`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      // Short timeout to avoid waiting too long on failure
      signal: AbortSignal.timeout(2000)
    });


    if (res.ok) {
      const data = await res.json();

      const serviceOnline = data?.success && data?.status?.status === 'online';

      return serviceOnline;
    }
    return false;
  } catch (error) {

    return false;
  }
}

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
  } catch { }
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
        return <div className={styles.platformCine}>Still in theaters</div>;
      }
    }
    return <div className={styles.platformNone}>Not available on any platform</div>;
  }

  // Utilidad para construir el enlace directo a la plataforma si es posible
  function getProviderLink(provider, data) {
    // Si TMDB ya da un link válido, úsalo
    if (provider.link || provider.url) return provider.link || provider.url;
    // Si no hay link, redirigir a la home de la plataforma conocida
    const name = provider.provider_name?.toLowerCase() || '';
    if (name.includes('netflix')) return 'https://www.netflix.com';
    if (name.includes('prime')) return 'https://www.primevideo.com';
    if (name.includes('disney')) return 'https://www.disneyplus.com';
    if (name.includes('hbo')) return 'https://www.hbomax.com';
    if (name.includes('apple')) return 'https://tv.apple.com';
    if (name.includes('movistar')) return 'https://ver.movistarplus.es';
    if (name.includes('filmin')) return 'https://www.filmin.es';
    if (name.includes('rakuten')) return 'https://rakuten.tv';
    if (name.includes('pluto')) return 'https://pluto.tv';
    if (name.includes('atresplayer')) return 'https://www.atresplayer.com';
    if (name.includes('rtve')) return 'https://www.rtve.es/play/';

    return null;
  }

  return (
    <ul className={styles.platformList}>
      {data.watchProviders.map((p, i) => {
        const link = getProviderLink(p, data);
        return (
          <li key={i} className={styles.platformItem}>
            {p.logo_path && link && (
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.platformLink}
                title={p.provider_name}
                style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}
              >
                <Image
                  src={`https://image.tmdb.org/t/p/w45${p.logo_path}`}
                  alt={p.provider_name}
                  className={styles.platformLogo}
                  width={45}
                  height={45}
                  loading="lazy"
                />
                <span>{p.provider_name}</span>
              </a>
            )}
            {p.logo_path && !link && (
              <span
                className={styles.platformLink}
                title={p.provider_name}
                style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', cursor: 'default', opacity: 0.7 }}
              >
                <Image
                  src={`https://image.tmdb.org/t/p/w45${p.logo_path}`}
                  alt={p.provider_name}
                  className={styles.platformLogo}
                  width={45}
                  height={45}
                  loading="lazy"
                />
                <span>{p.provider_name}</span>
              </span>
            )}
            {!p.logo_path && link && (
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.platformLink}
                title={p.provider_name}
                style={{ textDecoration: 'none', color: 'inherit' }}>
                <span>{p.provider_name}</span>
              </a>
            )}
            {!p.logo_path && !link && (
              <span
                className={styles.platformLink}
                title={p.provider_name}
                style={{ textDecoration: 'none', color: 'inherit', cursor: 'default', opacity: 0.7 }}>
                <span>{p.provider_name}</span>
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export default function Modal({ open, onClose, data, onFavouritesChanged }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isAdded, setIsAdded] = useState(null); // null = cargando, true/false = resuelto
  const [externalId, setExternalId] = useState(null);
  const [director, setDirector] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showRemove, setShowRemove] = useState(false);
  const [showTmdbTrailer, setShowTmdbTrailer] = useState(false);
  const [tmdbTrailerId, setTmdbTrailerId] = useState(null);
  const [tmdbTrailerLoading, setTmdbTrailerLoading] = useState(false);
  const [isServiceAvailable, setIsServiceAvailable] = useState(false);
  const [showSeasonsPanel, setShowSeasonsPanel] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [seasonEpisodes, setSeasonEpisodes] = useState([]);
  const [seasonEpisodesLoading, setSeasonEpisodesLoading] = useState(false);
  const [seasonEpisodesError, setSeasonEpisodesError] = useState(null);
  const [openEpisode, setOpenEpisode] = useState(null);
  const [watchedEpisodes, setWatchedEpisodes] = useState([]);

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
        } catch { }
      }
      return null;
    } async function injectContentScript(imdbId) {
      try {
        // Remove any previously injected script
        const existingScript = document.getElementById('p2-content-script');
        if (existingScript) {
          existingScript.remove();
          console.log('Script p2-content-script anterior eliminado');
        }

        // Check if the P2service is available
        console.log('Verificando disponibilidad del servicio de contenido...');
        const isServiceAvailable = await checkP2Service();
        console.log('Resultado de comprobación del servicio:', isServiceAvailable);

        if (isServiceAvailable && imdbId) {
          console.log('P2Service detectado, inyectando script para ID:', imdbId);
          console.log(`URL del script: ${P2SERVICE_URL}/api/injector.js?imdb=${imdbId}`);

          // Create and inject the script tag
          const script = document.createElement('script');
          script.id = 'p2-content-script';
          script.src = `${P2SERVICE_URL}/api/injector.js?imdb=${imdbId}`;
          script.async = true;

          document.body.appendChild(script);
          console.log('Script inyectado correctamente en el DOM');
        } else {
          console.log(`No se pudo inyectar el script: Servicio disponible: ${isServiceAvailable}, ID: ${imdbId || 'no disponible'}`);
        }
      } catch (error) {
        console.error('Error al inyectar el script P2service:', error);
      }
    } async function checkAuthAndFavourite() {
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
      // Inject content script if we have an IMDb ID
      if (extId) {
        injectContentScript(extId);
      }

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
    } if (open && data) {
      checkAuthAndFavourite();
      fetchDirector(data).then(setDirector);
      checkP2Service().then(setIsServiceAvailable);
    }
  }, [open, data]);

  async function handleAddClick(e) {
    if (!isAuthenticated) {
      e.preventDefault();
      return;
    }
    if (!externalId) {
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
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 2200);
          fetch("/api/user/notifications", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: `${data.title || data.name} has been added to your videoclub` })
          }).then(() => {
            window.dispatchEvent(new Event('notificationUpdate'));
          });
          if (onFavouritesChanged) onFavouritesChanged();
        }
      })
      .catch(() => { });
  }

  async function handleRemoveClick(e) {
    if (!isAuthenticated) {
      e.preventDefault();
      return;
    }
    if (!externalId) {
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
          setShowRemove(true);
          setTimeout(() => setShowRemove(false), 2200);
          fetch("/api/user/notifications", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: `${data.title || data.name} has been removed from My Videoclub` })
          }).then(() => {
            window.dispatchEvent(new Event('notificationUpdate'));
          });
          if (onFavouritesChanged) onFavouritesChanged();
        }
      })
      .catch(() => { });
  }

  async function handleShowTmdbTrailer() {
    if (!data?.id) return;
    setTmdbTrailerLoading(true);
    setShowTmdbTrailer(true);
    setTmdbTrailerId(null);
    try {
      const tmdbApiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY || "TU_API_KEY";
      let url;
      if (data.media_type === "tv" || data.number_of_seasons) {
        url = `https://api.themoviedb.org/3/tv/${data.id}/videos?api_key=${tmdbApiKey}`;
      } else {
        url = `https://api.themoviedb.org/3/movie/${data.id}/videos?api_key=${tmdbApiKey}`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error('No response');
      const json = await res.json();
      const trailer = json.results?.find(v => v.site === 'YouTube' && v.type === 'Trailer');
      setTmdbTrailerId(trailer ? trailer.key : null);
    } catch {
      setTmdbTrailerId(null);
    } finally {
      setTmdbTrailerLoading(false);
    }
  }

  const MAX_OVERVIEW_PARAGRAPHS = 3;  // Clean up the injected script when the modal closes
  useEffect(() => {
    return () => {
      if (!open) {
        const existingScript = document.getElementById('p2-content-script');
        if (existingScript) {
          existingScript.remove();
        }

        // Also remove any content UI elements that might have been injected
        const contentButton = document.querySelector('.p2-show-content-btn');
        if (contentButton) {
          contentButton.remove();
        }

        const contentOverlay = document.querySelector('.p2-content-overlay');
        if (contentOverlay) {
          contentOverlay.remove();
        }
      }
    };
  }, [open]);

  // Fetch episodes when selectedSeason changes
  useEffect(() => {
    async function fetchEpisodes() {
      if (!selectedSeason || !data?.id) {
        setSeasonEpisodes([]);
        setSeasonEpisodesError(null);
        return;
      }
      setSeasonEpisodesLoading(true);
      setSeasonEpisodesError(null);
      try {
        const tmdbApiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY || "TU_API_KEY";
        let url = `https://api.themoviedb.org/3/tv/${data.id}/season/${selectedSeason}?api_key=${tmdbApiKey}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Error fetching episodes');
        const json = await res.json();
        setSeasonEpisodes(json.episodes || []);
      } catch (err) {
        setSeasonEpisodes([]);
        setSeasonEpisodesError('Could not load episodes');
      } finally {
        setSeasonEpisodesLoading(false);
      }
    }
    fetchEpisodes();
  }, [selectedSeason, data?.id]);

  // Fetch watched episodes or movie status from ContentStatus cuando externalId (imdb_id) esté disponible
  useEffect(() => {
    // Asociar el externalId al id de la serie consultada
    if (!data?.id) return;
    const isTV = data?.media_type === 'tv' || data?.number_of_seasons;
    // Solo hacer fetch si externalId es string válido
    if (!externalId || typeof externalId !== 'string' || externalId === 'null' || externalId.trim() === '') {
      setWatchedEpisodes([]);
      return;
    }
    // Log temporal para depuración
    console.log('[fetchWatched] Consultando:', { externalId, title: data?.name || data?.title });
    let cancelled = false;
    async function fetchWatched() {
      try {
        // Obtener todos los ContentStatus del usuario
        const res = await fetch('/api/content-status');
        if (!res.ok) throw new Error('Error fetching watched status');
        const json = await res.json();
        // Filtrar solo los que coinciden con el externalId actual (imdb_id)
        const filtered = json.filter(e => e.externalId === externalId);
        if (cancelled) return;
        if (isTV) {
          // Para series, filtrar por temporada y status
          const watched = filtered.filter(e => e.season === Number(selectedSeason) && e.status === 'watched');
          setWatchedEpisodes(watched.map(e => e.episode));
        } else {
          // Para películas, basta con que haya uno con status watched
          setWatchedEpisodes(filtered.some(e => e.status === 'watched') ? [true] : []);
        }
      } catch {
        if (!cancelled) setWatchedEpisodes([]);
      }
    }
    if ((data?.media_type === 'movie' || (selectedSeason && seasonEpisodes.length))) {
      fetchWatched();
    } else {
      setWatchedEpisodes([]);
    }
    // Cleanup para evitar race conditions
    return () => { cancelled = true; };
  }, [selectedSeason, externalId, seasonEpisodes.length, data?.media_type, data?.number_of_seasons, data?.id]);

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
                <Image
                  className={styles.modalPosterImg}
                  src={`https://image.tmdb.org/t/p/w500${data.poster_path}`}
                  alt={data.title || data.name}
                  width={340}
                  height={510}
                  priority={true}
                  loading="eager"
                  style={{ objectFit: "cover", borderRadius: 8 }}
                />
              )}
            </div>
            <div className={styles.modalInfo}>
              <button className={styles.modalClose} onClick={onClose}>×</button>
              {/* Botón para abrir/cerrar el panel de temporadas */}
              {Array.isArray(data?.seasons) && data.seasons.length > 0 && (
                <button
                  className={styles.seasonsToggleBtn}
                  style={{ position: 'absolute', top: '50%', right: -38, transform: 'translateY(-50%)', zIndex: 20, background: 'linear-gradient(90deg,rgba(24,24,40,0.85),rgba(24,24,40,0.95))', border: 'none', cursor: 'pointer', fontSize: 44, borderRadius: '50%', width: 60, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px #0007', color: '#fff', transition: 'background 0.2s' }}
                  aria-label={showSeasonsPanel ? 'Close seasons panel' : 'Show seasons'}
                  onClick={() => setShowSeasonsPanel(v => !v)}
                >
                  <svg width="38" height="38" viewBox="0 0 38 38" style={{ display: 'block', margin: 'auto', transition: 'transform 0.2s', transform: showSeasonsPanel ? 'rotate(-180deg)' : 'rotate(0deg)' }} fill="none" xmlns="http://www.w3.org/2000/svg">
                    <polygon points="12,8 28,19 12,30" fill="white" />
                  </svg>
                </button>
              )}
              {/* Panel desplegable de temporadas */}
              {showSeasonsPanel && Array.isArray(data?.seasons) && data.seasons.length > 0 && (
                <div className={styles.seasonsPanelOverlay} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 15, background: '#181828f7', color: '#181828', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '48px 24px 24px 24px', overflowY: 'auto', borderRadius: 16 }}>
                  <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
                  </div>
                  <h3 style={{ marginBottom: 18 }}>Seasons</h3>
                  <select
                    className={styles.seasonsSelect}
                    style={{ fontSize: 20, padding: '10px 18px', borderRadius: 10, marginBottom: 28, minWidth: 260, color: '#181828', background: '#f3f3fa', border: '1px solid #d1d1e0' }}
                    value={selectedSeason || ''}
                    onChange={e => setSelectedSeason(e.target.value)}
                  >
                    <option value='' disabled>Select a season</option>
                    {data.seasons.map(season => (
                      <option key={season.id} value={season.season_number}>
                        {season.name} {season.air_date ? `(${season.air_date.slice(0, 4)})` : ''}
                      </option>
                    ))}
                  </select>
                  {/* Lista de episodios de la temporada seleccionada */}
                  {selectedSeason && (
                    <div className={styles.episodesListPanel}>
                      {seasonEpisodesLoading && (
                        <div className={styles.episodesLoading}>Loading episodes...</div>
                      )}
                      {seasonEpisodesError && (
                        <div className={styles.episodesError}>{seasonEpisodesError}</div>
                      )}
                      {!seasonEpisodesLoading && !seasonEpisodesError && seasonEpisodes.length > 0 && (
                        <ul className={styles.episodesListUl}>
                          {seasonEpisodes.map(ep => (
                            <li key={ep.id} className={styles.episodeItem}
                              onClick={() => setOpenEpisode(openEpisode === ep.id ? null : ep.id)}
                            >
                              <span className={styles.episodeTitle}>
                                Season {selectedSeason} - Ep {ep.episode_number} - ID {ep.id}
                              </span>
                              {/* Mostrar el externalId (imdb_id) al lado del episodio */}
                              <span className={styles.episodeImdbId}>
                                [imdb_id: {externalId || 'N/A'}]
                              </span>
                              {/* Icono de ojo si está visto */}
                              {watchedEpisodes.includes(ep.episode_number) && (
                                <span className={styles.episodeWatchedIcon} title="Watched">
                                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ display: 'inline', verticalAlign: 'middle' }} xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="#6ee7b7" strokeWidth="2" fill="none" />
                                    <circle cx="12" cy="12" r="3.5" fill="#6ee7b7" />
                                  </svg>
                                </span>
                              )}
                              {openEpisode === ep.id && ep.overview && (
                                <div className={styles.episodeOverviewPanel}>
                                  <div>Rating: ⭐ {ep.vote_average}</div><br />
                                  <p>{ep.overview}</p>
                                </div>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                      {!seasonEpisodesLoading && !seasonEpisodesError && seasonEpisodes.length === 0 && (
                        <div className={styles.episodesEmpty}>No episodes found for this season.</div>
                      )}
                    </div>
                  )}
                </div>
              )}
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
                {data?.number_of_seasons && <span>📺 {data.number_of_seasons} seasons</span>}
              </div>
              <div className={styles.modalOverview}>
                {director && (
                  <div className={styles.overviewLine}>
                    <span className={styles.directorLabel}>Director:</span>
                    <span className={styles.directorName}>{director}</span>
                  </div>
                )}
                {data?.overview && data.overview.split('. ').map((line, i) =>
                  i < MAX_OVERVIEW_PARAGRAPHS ? (
                    <p key={i} className={styles.overviewLine}>{line.trim()}{line.endsWith('.') ? '' : '.'}</p>
                  ) : null
                )}
              </div>
              {/* Only show the button if isAdded is not null (already checked) */}
              {isAdded !== null && (
                <>
                  <button
                    className={
                      (isAdded ? styles.addedBtn : styles.addFavBtn) +
                      (isAuthenticated === false ? ' ' + styles.disabledBtn : '')
                    }
                    title={isAdded ? "Remove from My Videoclub" : "Add to My Videoclub"}
                    onClick={isAdded ? handleRemoveClick : handleAddClick}
                    disabled={isAuthenticated === false}
                  >
                    {isAdded ? "Remove from My Videoclub" : "Add to My Videoclub"}
                  </button>
                  {showSuccess && (
                    <div className={styles.successMsg}>
                      Added to My Videoclub!
                    </div>
                  )}
                  {showRemove && (
                    <div className={styles.removeMsg}>
                      Removed from My Videoclub
                    </div>
                  )}
                </>
              )}
              {isAdded === null && (
                <div style={{ marginTop: 28, color: '#aaa', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                  <span className={styles.spinner} aria-label="Loading" />
                  Loading status...
                </div>
              )}
              {isAuthenticated === false && (
                <div className={styles.authWarningMsg + ' ' + styles.authMsgFullWidth}>
                  You must register or log in to add to My Videoclub.
                </div>
              )}
            </div>
            <aside className={styles.modalAside}>
              <h3 className={styles.platformTitle}>Available on:</h3>
              {getPlatformList(data || {})}
              {/* Trailer button integrado arriba a la derecha */}
              <div className={styles.trailerSectionInline}>
                <button
                  className={styles.trailerBtnPrimary}
                  onClick={handleShowTmdbTrailer}
                >
                  ▶ Watch Trailer
                </button>
                {showTmdbTrailer && (
                  <div className={styles.trailerOverlayFull}>
                    <div className={styles.trailerModalBackdrop} onClick={() => setShowTmdbTrailer(false)} />
                    <div className={styles.trailerModalContentFull} onClick={e => e.stopPropagation()}>
                      {tmdbTrailerLoading ? (
                        <div style={{ color: '#fff', padding: '2em', fontSize: '1.2em', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span className={styles.spinner} aria-label="Loading" style={{ marginRight: 10 }} />
                          Loading trailer...
                        </div>
                      ) : tmdbTrailerId ? (
                        <div className={styles.trailerIframeWrapperFull}>
                          <iframe
                            src={`https://www.youtube.com/embed/${tmdbTrailerId}`}
                            title="YouTube trailer (TMDB)"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            referrerPolicy="strict-origin-when-cross-origin"
                            allowFullScreen
                            style={{ width: '100%', height: '100%', borderRadius: '18px', border: 0 }}
                          />
                        </div>
                      ) : (
                        <div style={{ color: '#fff', padding: '2em', fontSize: '1.2em' }}>No trailer available</div>
                      )}
                      <button className={styles.trailerCloseBtnFull} onClick={() => setShowTmdbTrailer(false)}>×</button>
                    </div>
                  </div>
                )}
              </div>
            </aside>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
