import React, { useEffect, useState, useRef } from "react";
import Card from "@/app/components/card/Card";
import styles from "./RecommendedCarousel.module.css";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

export default function RecommendedCarousel() {
    const [recommended, setRecommended] = useState([]);
    const [loading, setLoading] = useState(true);
    const [current, setCurrent] = useState(0);
    const [visibleCards] = useState(6);
    const carouselRef = useRef(null);
    const scrollInterval = useRef(null);

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
            // Fetch both movie and tv similar endpoints
            const [movieRes, tvRes] = await Promise.all([
                fetch(`https://api.themoviedb.org/3/movie/${externalId}/similar?api_key=${apiKey}&page=1`),
                fetch(`https://api.themoviedb.org/3/tv/${externalId}/similar?api_key=${apiKey}&page=1`)
            ]);
            const movieData = await movieRes.json();
            const tvData = await tvRes.json();
            if (movieData.results) allResults = allResults.concat(movieData.results.map(r => ({ ...r, _mediaType: 'movie' })));
            if (tvData.results) allResults = allResults.concat(tvData.results.map(r => ({ ...r, _mediaType: 'tv' })));
            // Filtrar y ordenar
            const sorted = allResults
                .filter(item => {
                    const year = item.release_date ? new Date(item.release_date).getFullYear() : (item.first_air_date ? new Date(item.first_air_date).getFullYear() : null);
                    return !year || year >= 1980;
                })
                .sort((a, b) => b.vote_average - a.vote_average);
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

    const animateScroll = (index) => {
        if (!carouselRef.current) return;
        const cardWidth = carouselRef.current.firstChild?.offsetWidth;
        carouselRef.current.scrollTo({
            left: cardWidth * index,
            behavior: "smooth"
        });
    };

    const handlePrev = () => {
        setCurrent((prev) => {
            const next = Math.max(prev - 1, 0);
            animateScroll(next);
            return next;
        });
    };

    const handleNext = () => {
        setCurrent((prev) => {
            const next = Math.min(prev + 1, recommended.length - visibleCards);
            animateScroll(next);
            return next;
        });
    };

    const startAutoScroll = (direction) => {
        if (scrollInterval.current) return;
        scrollInterval.current = setInterval(() => {
            if (direction === "left") {
                setCurrent((prev) => {
                    const next = Math.max(prev - 1, 0);
                    animateScroll(next);
                    if (next === 0) stopAutoScroll();
                    return next;
                });
            } else {
                setCurrent((prev) => {
                    const next = Math.min(prev + 1, recommended.length - visibleCards);
                    animateScroll(next);
                    if (next >= recommended.length - visibleCards) stopAutoScroll();
                    return next;
                });
            }
        }, 500);
    };

    const stopAutoScroll = () => {
        if (scrollInterval.current) {
            clearInterval(scrollInterval.current);
            scrollInterval.current = null;
        }
    };

    return (
        <div className={styles.carouselWrapper}>
            {loading ? (
                <div className={styles.loading}>Cargando recomendaciones...</div>
            ) : recommended.length === 0 ? (
                <div className={styles.loading}>No hay recomendaciones disponibles.</div>
            ) : (
                <div className={styles.carouselContainer}>
                    <button className={`${styles.arrow} ${styles.arrowLeft}`}
                        onClick={handlePrev}
                        onMouseEnter={() => startAutoScroll("left")}
                        onMouseLeave={stopAutoScroll}
                        disabled={current === 0}
                    >
                        <FaArrowLeft />
                    </button>
                    <div
                        className={styles.carousel}
                        ref={carouselRef}
                    >
                        {recommended.filter(item => item.poster_path)
                            .map((item, idx) => (
                                <div className={styles.cardItem} key={`${item.id}-${idx}`}>
                                    <Card
                                        id={item.id}
                                        type={"movie"}
                                        image={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                                        title={item.title || item.name}
                                        release_date={dateYear(item.release_date || item.first_air_date)}
                                    />
                                </div>
                            ))}
                    </div>
                    <button className={`${styles.arrow} ${styles.arrowRight}`}
                        onClick={handleNext}
                        onMouseEnter={() => startAutoScroll("right")}
                        onMouseLeave={stopAutoScroll}
                        disabled={current >= recommended.length - visibleCards}
                    >
                        <FaArrowRight />
                    </button>
                </div>
            )}
        </div>
    );
}
