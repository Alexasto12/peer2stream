import React, { useEffect, useState, useRef } from "react";
import Card from "@/app/components/card/Card";
import styles from "./RecommendedCarousel.module.css";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

export default function RecommendedCarousel() {
    const [recommended, setRecommended] = useState([]);
    const [loading, setLoading] = useState(true);
    const carouselRef = useRef(null);
    const isDragging = useRef(false);
    const startX = useRef(0);
    const scrollLeft = useRef(0);

    useEffect(() => {
        async function fetchRecommended() {
            setLoading(true);
            const res = await fetch("/api/content-status");
            const statuses = await res.json();
            const filtered = statuses.filter(cs => cs.status === 'pending' || cs.status === 'watched');
            if (!filtered.length) {
                setRecommended([]);
                setLoading(false);
                return;
            }
            filtered.sort((a, b) => new Date(b.lastWatched || b.createdAt) - new Date(a.lastWatched || a.createdAt));
            const { externalId } = filtered[0];
            const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
            let allResults = [];
            const fetchPages = async (type) => {
                let results = [];
                for (let page = 1; page <= 5; page++) {
                    const res = await fetch(`https://api.themoviedb.org/3/${type}/${externalId}/similar?api_key=${apiKey}&page=${page}`);
                    const data = await res.json();
                    if (data.results) {
                        results = results.concat(data.results.map(r => ({ ...r, _mediaType: type === 'movie' ? 'movie' : 'tv' })));
                    }
                    if (!data.results || data.results.length === 0) break;
                }
                return results;
            };
            const [movieResults, tvResults] = await Promise.all([
                fetchPages('movie'),
                fetchPages('tv')
            ]);
            allResults = allResults.concat(movieResults, tvResults);
            const sorted = allResults
                .filter(item => {
                    const year = item.release_date ? new Date(item.release_date).getFullYear() : (item.first_air_date ? new Date(item.first_air_date).getFullYear() : null);
                    return (!year || year >= 1980) && (item.vote_average === undefined || item.vote_average >= 6.8);
                })
                .sort(() => Math.random() - 0.5);
            setRecommended(sorted);
            setLoading(false);
        }
        fetchRecommended();
    }, []);

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
            ) : recommended.length === 0 ? (
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
                            recommended.filter(item => item.poster_path)
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
