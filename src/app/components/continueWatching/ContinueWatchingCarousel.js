import React, { useEffect, useState, useRef } from "react";
import Card from "../card/Card";
import Modal from "../modal/Modal";
import styles from "./ContinueWatchingCarousel.module.css";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";


const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

async function fetchRuntime(type, externalId) {
    const url =
        type === "movie"
            ? `https://api.themoviedb.org/3/find/${externalId}?api_key=${TMDB_API_KEY}&external_source=imdb_id`
            : `https://api.themoviedb.org/3/tv/${externalId}?api_key=${TMDB_API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return type === "movie" ? data.runtime * 60 : (data.episode_run_time?.[0] || 0) * 60; // segundos
}

// Obtiene datos de TMDB igual que en Videoclub
async function fetchTmdbDataFromExternalId(externalId) {
    const url = `https://api.themoviedb.org/3/find/${externalId}?api_key=${TMDB_API_KEY}&external_source=imdb_id`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    let result = null;
    if (data.movie_results && data.movie_results.length > 0) {
        result = { ...data.movie_results[0], type: "movie", external_id: externalId };
    } else if (data.tv_results && data.tv_results.length > 0) {
        result = { ...data.tv_results[0], type: "tv", external_id: externalId };
    }
    // Si no hay runtime, intenta obtenerlo con una petición extra a /movie/{id} o /tv/{id}
    if (result && (!result.runtime || result.runtime === 0)) {
        try {
            let detailsUrl = '';
            if (result.type === 'movie') {
                detailsUrl = `https://api.themoviedb.org/3/movie/${result.id}?api_key=${TMDB_API_KEY}`;
            } else if (result.type === 'tv') {
                detailsUrl = `https://api.themoviedb.org/3/tv/${result.id}?api_key=${TMDB_API_KEY}`;
            }
            if (detailsUrl) {
                const detailsRes = await fetch(detailsUrl);
                const detailsData = await detailsRes.json();
                if (result.type === 'movie' && detailsData.runtime) {
                    result.runtime = detailsData.runtime;
                } else if (result.type === 'tv' && detailsData.episode_run_time && detailsData.episode_run_time.length > 0) {
                    result.episode_run_time = detailsData.episode_run_time;
                    // Para TV, si no hay runtime, usar el primer valor de episode_run_time
                    if (!result.runtime && detailsData.episode_run_time[0]) {
                        result.runtime = detailsData.episode_run_time[0];
                    }
                }
            }
        } catch (e) {
            console.error('Error obteniendo detalles TMDB:', e);
        }
    }
    return result;
}

export default function ContinueWatchingCarousel() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalData, setModalData] = useState(null);
    const isDragging = useRef(false);
    const carouselRef = useRef(null);

    // Handler para abrir el modal y cargar info detallada y proveedores
    const handleFaviconClick = async (item) => {
        setModalOpen(true);
        setModalData(null); // Mostrar loading
        const BASE_URL = "https://api.themoviedb.org/3";
        const endpoint = item.type === 'movie' ? 'movie' : 'tv';
        const query = new URLSearchParams({ api_key: process.env.NEXT_PUBLIC_TMDB_API_KEY }).toString();
        // 1. Obtener detalles
        const res = await fetch(`${BASE_URL}/${endpoint}/${item.id}?${query}`);
        const data = await res.json();
        // 2. Obtener proveedores
        let providers = [];
        try {
            const provRes = await fetch(`${BASE_URL}/${endpoint}/${item.id}/watch/providers?${query}`);
            const provData = await provRes.json();
            if (provData.results && provData.results.ES && provData.results.ES.flatrate) {
                providers = provData.results.ES.flatrate;
            }
        } catch { }
        data.watchProviders = providers;
        setModalData(data);
    };

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch("/api/content-status?status=pending");
                if (!res.ok) throw new Error("Error al obtener ContentStatus");
                const data = await res.json();
               // <-- Añadido para debug
                // Igual que en Videoclub: obtener datos completos de TMDB
                const withTmdb = await Promise.all(
                    data.map(async (item) => {
                        const tmdbData = await fetchTmdbDataFromExternalId(item.externalId);
                        if (!tmdbData) return null;
                        // runtime: para movie es runtime, para tv es episode_run_time[0]
                        let runtime = 0;
                        if (tmdbData.type === "movie") {
                            runtime = (tmdbData.runtime || 0) * 60;
                        } else if (tmdbData.type === "tv") {
                            runtime = (tmdbData.episode_run_time?.[0] || 0) * 60;
                        }
                        return {
                            ...item,
                            ...tmdbData,
                            runtime
                        };
                    })
                );
                setItems(withTmdb.filter(Boolean));
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    // Filtrar items con status 'pending', runtime y watchedTime < runtime
    let pending = items.filter(item => item.status === "pending");
    // Ordenar por updatedAt descendente (más recientes primero)
    pending = pending.sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.lastWatched || 0).getTime();
        const dateB = new Date(b.updatedAt || b.lastWatched || 0).getTime();
        return dateB - dateA;
    });

    const dateYear = (date) => {
        if (!date) return "";
        const d = new Date(date);
        return d.getFullYear();
    };

    // Flechas: scroll horizontal nativo
    const easeInOutQuad = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    const scrollByCards = (direction) => {
        if (!carouselRef.current) return;
        const card = carouselRef.current.querySelector(`.${styles.cardItem}`);
        if (!card) return;
        const cardWidth = card.offsetWidth + 24; // 24px gap aprox
        const scrollAmount = direction === 'left' ? -cardWidth * 2 : cardWidth * 2;
        let start = null;
        const duration = 300;
        const startScrollLeft = carouselRef.current.scrollLeft;
        const animateScroll = (timestamp) => {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);
            carouselRef.current.scrollLeft = startScrollLeft + (scrollAmount * easeInOutQuad(progress));
            if (progress < 1) {
                requestAnimationFrame(animateScroll);
            }
        };
        requestAnimationFrame(animateScroll);
    };
    return (
        <div className={styles.carouselWrapper}>
            {loading ? (
                <div className={styles.spinnerContainer}>
                    <span className={styles.loaderSpinner} />
                </div>
            ) : pending.length === 0 ? (
                <div className={styles.noContentMsg}>
                    Start watching any movie or series to see your continue watching list!
                </div>
            ) : (
                <div className={styles.carouselContainer}>
                    <button className={`${styles.arrow} ${styles.arrowLeft}`}
                        onClick={() => scrollByCards('left')}
                        aria-label="Scroll left"
                    >
                        <FaArrowLeft />
                    </button>
                    <div
                        className={styles.carousel}
                        ref={carouselRef}
                    >
                        {Array.from(new Map(
                            pending.filter(item => item.poster_path)
                                .map(item => [`${item.type}-${item.id}`, item])
                        ).values())
                            .map((item, idx) => (
                                <div className={styles.cardItem} key={`${item.id}-${idx}`} style={{ position: 'relative' }}>
                                    <Card
                                        id={item.id}
                                        type={item.type}
                                        image={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                                        title={item.title || item.name}
                                        release_date={dateYear(item.release_date || item.first_air_date)}
                                        onFaviconClick={handleFaviconClick}
                                        idx={idx} // Pass idx for image priority
                                    />
                                    {/* Barra de progreso superpuesta */}
                                    {item.runtime && item.watchedTime >= 0 && (
                                        (() => {
                                            // runtime ya está en segundos, así que no multiplicamos por 60
                                            const percent = Math.min(100, Math.round((item.watchedTime / item.runtime) * 100));
                                            console.log('Barra progreso:', {
                                                watchedTime: item.watchedTime,
                                                runtime: item.runtime,
                                                percent,
                                                item
                                            });
                                            return (
                                                <div style={{
                                                    position: 'absolute',
                                                    left: 0,
                                                    bottom: 2,
                                                    width: '100%',
                                                    height: 10,
                                                    background: 'rgba(20,16,40,0.82)',
                                                    borderRadius: '0 10px 30px 30px',
                                                    zIndex: 10,
                                                    pointerEvents: 'none',
                                                    overflow: 'hidden',
                                                    boxShadow: '0 2px 12px 2px rgba(128,0,255,0.18), 0 0 0 1px #a78bfa44',
                                                    border: '1.5px solid rgba(128,0,255,0.13)',
                                                    backdropFilter: 'blur(2px)'
                                                }}>
                                                    <div
                                                        style={{
                                                            position: 'absolute',
                                                            left: 0,
                                                            top: 0,
                                                            width: `${percent}%`,
                                                            height: '100%',
                                                            background: 'linear-gradient(90deg, #a78bfa 0%, #8000ff 40%, #351eff 100%)',
                                                            borderRadius: ' 20px',
                                                            transition: 'width 4s',
                                                            zIndex: 11,
                                                            boxShadow: '0 0 16px 4px #a78bfa99, 0 0 8px 2px #351eff77',
                                                            animation: percent > 0 ? 'progressShine 2.2s linear infinite' : 'none',
                                                            backgroundSize: '200% 100%',
                                                            backgroundPosition: '0% 0%'
                                                        }}
                                                    />
                                                </div>
                                            );
                                        })()
                                    )}
                                </div>
                            ))}
                    </div>
                    <button className={`${styles.arrow} ${styles.arrowRight}`}
                        onClick={() => scrollByCards('right')}
                        aria-label="Scroll right"
                    >
                        <FaArrowRight />
                    </button>
                </div>
            )}
            {modalOpen && (
                <Modal open={modalOpen} onClose={() => setModalOpen(false)} data={modalData} />
            )}
        </div>
    );
}
