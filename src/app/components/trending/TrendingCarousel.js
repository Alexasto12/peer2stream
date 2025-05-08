import React, { useEffect, useState, useRef } from "react";
import Card from "@/app/components/card/Card";
import styles from "./TrendingCarousel.module.css";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

export default function TrendingCarousel() {
    const [trending, setTrending] = useState([]);
    const [loading, setLoading] = useState(true);
    const [current, setCurrent] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const visibleCards = 6;
    const carouselRef = useRef(null);
    const scrollInterval = useRef(null);

    useEffect(() => {
        async function fetchTrending() {
            setLoading(true);
            const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
            let allResults = [];
            let totalPagesFetched = 0;
            let totalPagesApi = 2;
            // Fetch all pages from the endpoint
            for (let p = 1; p <= totalPagesApi && p <= 7; p++) { // Limita a 10 páginas por seguridad
                const res = await fetch(`https://api.themoviedb.org/3/trending/all/week?api_key=${apiKey}&page=${p}`);
                const data = await res.json();
                if (data.results) allResults = allResults.concat(data.results);
                if (p === 1 && data.total_pages) totalPagesApi = data.total_pages;
                totalPagesFetched = p;
            }
            setTrending(allResults);
            setTotalPages(totalPagesFetched);
            setLoading(false);
        }
        fetchTrending();
    }, []);

    const dateYear = (date) => {
        if (!date) return "";
        const d = new Date(date);
        return d.getFullYear();
    };

    // Animación de scroll suave
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
            const next = Math.min(prev + 1, trending.length - visibleCards);
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
                    const next = Math.min(prev + 1, trending.length - visibleCards);
                    animateScroll(next);
                    if (next >= trending.length - visibleCards) stopAutoScroll();
                    return next;
                });
            }
        }, 500); // velocidad de scroll
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
                <div className={styles.loading}>Cargando...</div>
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
                        style={{ overflowX: 'auto', scrollBehavior: 'smooth', display: 'flex', height: '325px' }}
                    >
                        {trending.filter(item => item.poster_path)
                            .map((item, idx) => (
                                <div className={styles.cardItem} key={`${item.id}-${idx}`}>
                                    <Card
                                        id={item.id}
                                        type={item.media_type}
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
                        disabled={current >= trending.length - visibleCards}
                    >
                        <FaArrowRight />
                    </button>
                </div>
            )}
        </div>
    );
}
