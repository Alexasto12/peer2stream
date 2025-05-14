import React, { useEffect, useState, useRef } from "react";
import Card from "@/app/components/card/Card";
import Modal from "@/app/components/modal/Modal";
import styles from "./RecommendedCarousel.module.css";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

export default function RecommendedCarousel() {
    const [recommended, setRecommended] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalData, setModalData] = useState(null);
    const carouselRef = useRef(null);
  
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

    // Handler para abrir el modal y cargar info detallada y proveedores
    const handleFaviconClick = async ({ id, type }) => {
        setModalOpen(true);
        setModalData(null); // Mostrar loading
        const BASE_URL = "https://api.themoviedb.org/3";
        const endpoint = type === 'movie' ? 'movie' : 'tv';
        const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
        // 1. Obtener detalles
        const res = await fetch(`${BASE_URL}/${endpoint}/${id}?api_key=${apiKey}&language=es-ES`);
        const data = await res.json();
        // 2. Obtener proveedores
        let watchProviders = [];
        try {
            const provRes = await fetch(`${BASE_URL}/${endpoint}/${id}/watch/providers?api_key=${apiKey}`);
            const provData = await provRes.json();
            if (provData.results && (provData.results.ES || provData.results.US)) {
                const prov = provData.results.ES || provData.results.US;
                if (prov.flatrate) watchProviders = prov.flatrate;
                else if (prov.rent) watchProviders = prov.rent;
                else if (prov.buy) watchProviders = prov.buy;
            }
        } catch {}
        setModalData({ ...data, media_type: type, watchProviders });
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


    return (
        <div className={styles.carouselWrapper}>
            {loading ? (
                <div className={styles.spinnerContainer}>
                    <span className={styles.loaderSpinner} />
                </div>
            ) : recommended.length === 0 ? (
                <div className={styles.noContentMsg}>
                    Watch any movie or series to get your recommendations!
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
                                    onFaviconClick={handleFaviconClick}
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
            <Modal open={modalOpen} onClose={() => setModalOpen(false)} data={modalData} />
        </div>
    );
}
