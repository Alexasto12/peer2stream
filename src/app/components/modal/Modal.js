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
  const [contentStatusList, setContentStatusList] = useState([]); // Nuevo estado para todos los ContentStatus
  const [hasAutoOpenedEpisodeThisSession, setHasAutoOpenedEpisodeThisSession] = useState(false);

  // Move injectContentScript outside of fetchExternalId
  async function injectContentScript(imdbId, episodeData = null) {
    try {
      // Eliminar cualquier script previo
      const existingScript = document.getElementById('p2-content-script');
      if (existingScript) {
        existingScript.remove();
      }
      
      // Forzar la eliminación de cualquier botón existente
      const existingButton = document.querySelector('.p2-show-content-btn');
      if (existingButton) {
        existingButton.remove();
      }
      
      // Eliminar cualquier overlay existente
      const existingOverlay = document.querySelector('.p2-content-overlay');
      if (existingOverlay) {
        existingOverlay.remove();
      }

      // Check if the P2service is available
      const isServiceAvailable = await checkP2Service();

      if (isServiceAvailable && imdbId) {
        // Determine content type and build URL with appropriate parameters
        const isTV = data?.media_type === 'tv' || data?.number_of_seasons;
        let scriptURL = `${P2SERVICE_URL}/api/injector.js?imdb=${imdbId}&contentType=${isTV ? 'tv' : 'movie'}`;
        
        // Add episode data parameters if available
        if (isTV && episodeData) {
          scriptURL += `&episodeId=${episodeData.id}`;
          scriptURL += `&seasonNumber=${episodeData.season_number}`;
          scriptURL += `&episodeNumber=${episodeData.episode_number}`;
          
          if (episodeData.name) {
            scriptURL += `&episodeTitle=${encodeURIComponent(episodeData.name)}`;
          }
          
          // Asegurar que se pasa el nombre de la serie (data.name o data.title)
          const seriesName = data?.name || data?.title || '';
          if (seriesName) {
            scriptURL += `&seriesName=${encodeURIComponent(seriesName)}`;
            console.log(`Serie: ${seriesName}`);
          }
          
          console.log(`Injecting content script with episode: S${episodeData.season_number}E${episodeData.episode_number} - ${episodeData.name}`);
        }

        // Delay slightly to ensure DOM has updated
        setTimeout(() => {
          // Create and inject the script tag
          const script = document.createElement('script');
          script.id = 'p2-content-script';
          script.src = scriptURL;
          script.async = true;
          document.body.appendChild(script);
        }, 100);
      }
    } catch (error) {
      console.error('Error al inyectar el script P2service:', error);
    }
  }

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
      
      // For movies, inject content script immediately
      // For TV shows, only inject basic script without episode data (will be updated when episode is selected)
      const isTV = data?.media_type === 'tv' || data?.number_of_seasons;
      if (extId && !isTV) {
        injectContentScript(extId);
      } else if (extId && isTV) {
        // For TV shows, pass null as episodeData to make the "Select Episode First" button appear
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
    }
    
    if (open && data) {
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
      if (selectedSeason === null || selectedSeason === undefined || !data?.id) {
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

  // Fetch watched episodes o movie status y ContentStatus cuando externalId (imdb_id) esté disponible
  useEffect(() => {
    if (!data?.id) return;
    const isTV = data?.media_type === 'tv' || data?.number_of_seasons;
    if (!externalId || typeof externalId !== 'string' || externalId === 'null' || externalId.trim() === '') {
      setWatchedEpisodes([]);
      setContentStatusList([]);
      return;
    }
    let cancelled = false;
    async function fetchWatched() {
      try {
        const res = await fetch('/api/content-status');
        if (!res.ok) throw new Error('Error fetching watched status');
        const json = await res.json();
        setContentStatusList(json); // Guardar la lista completa
        const filtered = json.filter(e => e.externalId === externalId);
        if (cancelled) return;
        if (isTV) {
          const watched = filtered.filter(e => e.season === Number(selectedSeason) && e.status === 'watched');
          setWatchedEpisodes(watched.map(e => e.episode));
        } else {
          setWatchedEpisodes(filtered.some(e => e.status === 'watched') ? [true] : []);
        }
      } catch {
        if (!cancelled) {
          setWatchedEpisodes([]);
          setContentStatusList([]);
        }
      }
    }
    if ((data?.media_type === 'movie' || (typeof selectedSeason === 'number' && seasonEpisodes.length))) {
      fetchWatched();
    } else {
      setWatchedEpisodes([]);
      setContentStatusList([]);
    }
    // Cleanup para evitar race conditions
    return () => { cancelled = true; };
  }, [selectedSeason, externalId, seasonEpisodes.length, data?.media_type, data?.number_of_seasons, data?.id]);

  // Automatically open the first pending episode in the first available season
  useEffect(() => {
    if (
      showSeasonsPanel &&
      !hasAutoOpenedEpisodeThisSession && // Only run if not already auto-opened this session
      data?.seasons &&
      contentStatusList?.length > 0 &&
      externalId &&
      openEpisode === null // Only run if no episode is currently expanded by user or previous run
    ) {
      const sortedSeasons = data.seasons
        ? [...data.seasons].sort((a, b) => a.season_number - b.season_number)
        : [];

      for (const season of sortedSeasons) {
        const currentSeasonNumber = season.season_number;

        const pendingStatusesForSeason = contentStatusList
          .filter(
            (cs) =>
              cs.externalId === externalId &&
              cs.season === currentSeasonNumber &&
              cs.status === 'pending'
          )
          .sort((a, b) => a.episode - b.episode); // Sort by episode number

        if (pendingStatusesForSeason.length > 0) {
          const firstPendingEpisodeNumberInSeason = pendingStatusesForSeason[0].episode;

          if (selectedSeason === currentSeasonNumber) {
            // Current season is already selected, episodes should be loaded
            const episodeToOpen = seasonEpisodes.find(
              (ep) => ep.episode_number === firstPendingEpisodeNumberInSeason
            );
            if (episodeToOpen) {
              setOpenEpisode(episodeToOpen.id);
              setHasAutoOpenedEpisodeThisSession(true); // Mark as auto-opened for this session
              return; // Exit effect once an episode is opened
            }
          } else {
            // This season is not selected yet. Select it.
            // The effect will re-run when seasonEpisodes for this new season are loaded.
            setSelectedSeason(currentSeasonNumber);
            return; // Exit effect, will re-trigger due to setSelectedSeason -> seasonEpisodes change
          }
        }
      }
    }
  }, [
    showSeasonsPanel,
    data, // data.seasons is used
    contentStatusList,
    externalId,
    selectedSeason,
    seasonEpisodes,
    openEpisode,
    setSelectedSeason, // Include setters if your linting rules require it, they are stable
    setOpenEpisode   // Include setters if your linting rules require it, they are stable
  ]);

  // Reset auto-open tracker when seasons panel is closed
  useEffect(() => {
    if (!showSeasonsPanel) {
      setHasAutoOpenedEpisodeThisSession(false);
    }
  }, [showSeasonsPanel]);

  // Inject content script with episode data when an episode is selected (clicked and expanded)
  useEffect(() => {
    if (!open || !externalId) return;
    
    const isTV = data?.media_type === 'tv' || data?.number_of_seasons;
    
    // If it's not a TV show, don't do anything more
    if (!isTV) return;
    
    // When an episode is clicked and expanded in a TV show
    if (openEpisode && isTV && selectedSeason !== null) {
      // Find the episode data for the expanded episode
      const selectedEpisodeData = seasonEpisodes.find(ep => ep.id === openEpisode);
      
      if (selectedEpisodeData) {
        // Re-inject the content script with the selected episode data
        console.log('Episode selected, injecting content script with episode data:', selectedEpisodeData.name);
        injectContentScript(externalId, selectedEpisodeData);
      }
    } else if (isTV && !openEpisode) {
      // If no episode is expanded, revert to basic script with "Select Episode First" button
      injectContentScript(externalId);
    }
  }, [openEpisode, externalId, selectedSeason, seasonEpisodes, data, open]);

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
              {Array.isArray(data?.seasons) && data.seasons.length > 0 && (
                <button
                  className={styles.seasonsToggleBtn}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    right: -38,
                    transform: 'translateY(-50%)',
                    zIndex: 20,
                    background: 'linear-gradient(135deg,rgb(135, 93, 212),rgb(20, 20, 129) 100%)', // linear gradient background
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 44,
                    borderRadius: '50%',
                    width: 50,
                    height: 50,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px #0007',
                    color: '#fff',
                    transition: 'background 0.2s',
                  }}
                  aria-label={showSeasonsPanel ? 'Close seasons panel' : 'Show seasons'}
                  onClick={() => setShowSeasonsPanel(v => !v)}
                >
                  <svg width="38" height="38" viewBox="0 0 38 38" style={{ display: 'block', margin: 'auto', transition: 'transform 0.2s', transform: showSeasonsPanel ? 'rotate(-180deg)' : 'rotate(0deg)' }} fill="none" xmlns="http://www.w3.org/2000/svg" >
                    <polygon points="12,8 28,19 12,30" fill="white" />
                  </svg>
                </button>
              )}
              {/* Panel desplegable de temporadas */}
              {showSeasonsPanel && Array.isArray(data?.seasons) && data.seasons.length > 0 && (
                <div
                  className={styles.seasonsPanelOverlay + ' ' + styles.seasonsPanelOverlayAbsolute}
                >
                  {/* Selector de seasons a la izquierda */}
                  <div className={styles.seasonsListColumn}>
                    <h3 className={styles.seasonsListTitle}>Seasons</h3>
                    <ul className={styles.seasonsListUl}>
                      {data.seasons.map(season => (
                        <li
                          key={season.id}
                          className={selectedSeason == season.season_number ? styles.seasonListItemSelected : styles.seasonListItem}
                          onClick={() => setSelectedSeason(season.season_number)}
                        >
                          {season.season_number === 0 ? 'Specials' : season.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {/* Lista de episodios de la temporada seleccionada o espacio reservado */}
                  <div className={styles.episodesListPanel}>
                    <div className={styles.episodesListScrollWrapper}>
                      {selectedSeason !== null && selectedSeason !== undefined ? (
                        <>
                          {seasonEpisodesLoading && (
                            <div className={styles.episodesLoading}>Loading episodes...</div>
                          )}
                          {seasonEpisodesError && (
                            <div className={styles.episodesError}>{seasonEpisodesError}</div>
                          )}
                          {!seasonEpisodesLoading && !seasonEpisodesError && seasonEpisodes.length > 0 && (
                            <ul className={styles.episodesListUl}>
                              {seasonEpisodes.map(ep => {
                                // Buscar progreso pendiente para este episodio
                                const pending = contentStatusList.find(e =>
                                  e.externalId === externalId &&
                                  e.season === Number(selectedSeason) &&
                                  e.episode === ep.episode_number &&
                                  e.status === 'pending'
                                );
                                let percent = null;
                                if (pending && typeof pending.watchedTime === 'number' && typeof ep.runtime === 'number' && ep.runtime > 0) {
                                  percent = Math.min(100, Math.round((pending.watchedTime / (ep.runtime * 60)) * 100));
                                }
                                return (
                                  <li key={ep.id} className={styles.episodeItem}
                                    onClick={() => setOpenEpisode(openEpisode === ep.id ? null : ep.id)}
                                  >
                                    <span className={styles.episodeTitle}>
                                      Episode {ep.episode_number}
                                    </span>
                                    <span className={styles.episodeImdbId}>
                                      [imdb_id: {externalId || 'N/A'}] - ID {ep.id}
                                    </span>
                                    {/* Barra de progreso en la badge del episodio */}
                                    {percent !== null && !watchedEpisodes.includes(ep.episode_number) && (
                                      <div className={styles.episodeProgressBarBadge}>
                                        <div className={styles.episodeProgressBarBgBadge}>
                                          <div
                                            className={styles.episodeProgressBarFillBadge}
                                            style={{ width: `${percent}%` }}
                                          />
                                        </div>
                                        <div className={styles.episodeProgressBarPercentBadge}>{percent}%</div>
                                      </div>
                                    )}                                    {openEpisode === ep.id && (
                                      <div className={styles.episodeOverviewPanel}>
                                        <div className={styles.episodeOverviewTitle}>
                                          {ep.name}
                                        </div>
                                        <div>Rating: ⭐ {ep.vote_average.toFixed(1)}</div>
                                        <br />
                                        {ep.overview && <p>{ep.overview}</p>}
                                        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                                          <small style={{ display: 'block', marginBottom: '0.5rem', color: '#A1A1AA' }}>
                                            Content links will appear in the button at the bottom right
                                          </small>
                                        </div>
                                      </div>
                                    )}
                                    {watchedEpisodes.includes(ep.episode_number) && (
                                      <span className={styles.episodeWatchedIcon} title="Watched">
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ display: 'inline', verticalAlign: 'middle' }} xmlns="http://www.w3.org/2000/svg">
                                          <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="#6ee7b7" strokeWidth="2" fill="none" />
                                          <circle cx="12" cy="12" r="3.5" fill="#6ee7b7" />
                                        </svg>
                                      </span>
                                    )}
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                          {!seasonEpisodesLoading && !seasonEpisodesError && seasonEpisodes.length === 0 && (
                            <div className={styles.episodesEmpty}>No episodes found for this season.</div>
                          )}
                        </>
                      ) : (
                        <div className={styles.episodesPlaceholder}>Select a season to view episodes</div>
                      )}
                    </div>
                  </div>
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
