import React, { useEffect, useState, useRef } from "react";
import Card from "../card/Card";
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

export default function ContinueWatchingCarousel() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const isDragging = useRef(false);
    const carouselRef = useRef(null);



    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch("/api/content-status?status=pending");
                if (!res.ok) throw new Error("Error al obtener ContentStatus");
                const data = await res.json();
                // Para cada item, obtener runtime
                const withRuntime = await Promise.all(
                    data.map(async (item) => {
                        const runtime = await fetchRuntime(item.type, item.externalId);
                        return { ...item, runtime };
                    })
                );
                setItems(withRuntime);
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    // Filtrar items con status 'pending', runtime y watchedTime < runtime
    const pending = items.filter(item => item.status === "pending" && item.runtime && item.watchedTime < item.runtime);

    const dateYear = (date) => {
        if (!date) return "";
        const d = new Date(date);
        return d.getFullYear();
    };

    // Flechas: scroll horizontal nativo
    const scrollByCards = (direction) => {
        if (!carouselRef.current) return;
        const card = carouselRef.current.querySelector(`.${styles.cardItem}`);
        if (!card) return;
        const cardWidth = card.offsetWidth + 24; // 24px gap aprox
        carouselRef.current.scrollBy({
            left: direction === 'left' ? -cardWidth * 2 : cardWidth * 2,
            behavior: 'smooth'
        });
    };

    // Drag horizontal
    const handleMouseDown = (e) => {
        if (!carouselRef.current) return;
        isDragging.current = true;
        startX.current = e.pageX || e.touches?.[0]?.pageX;
        scrollLeft.current = carouselRef.current.scrollLeft;
        document.body.style.userSelect = 'none';
    };
    const handleMouseMove = (e) => {
        if (!isDragging.current || !carouselRef.current) return;
        const x = e.pageX || e.touches?.[0]?.pageX;
        const walk = (x - startX.current);
        carouselRef.current.scrollLeft = scrollLeft.current - walk;
    };
    const handleMouseUp = () => {
        isDragging.current = false;
        document.body.style.userSelect = '';
    };
    useEffect(() => {
        if (!isDragging.current) return;
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('touchmove', handleMouseMove);
        window.addEventListener('touchend', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleMouseMove);
            window.removeEventListener('touchend', handleMouseUp);
        };
    }, [isDragging.current]);

    return (
        <div className={styles.carouselWrapper}>
            {loading ? (
                <div className={styles.loading}>Cargando recomendaciones...</div>
            ) : pending.length === 0 ? (
                <div className={styles.loading}>No hay recomendaciones disponibles.</div>
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
                        style={{ cursor: isDragging.current ? 'grabbing' : 'grab' }}
                        onMouseDown={handleMouseDown}
                        onTouchStart={handleMouseDown}
                    >
                        {Array.from(new Map(
                            pending.filter(item => item.poster_path)
                                .map(item => [`${item._mediaType}-${item.id}`, item])
                        ).values())
                            .map((item, idx) => (
                                <div className={styles.cardItem} key={`${item.id}-${idx}`}>
                                    <Card
                                        id={item.id}
                                        type={item._mediaType}
                                        image={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                                        title={item.title || item.name}
                                        release_date={dateYear(item.release_date || item.first_air_date)}
                                    />
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
        </div>
    );
}
