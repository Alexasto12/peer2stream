'use client'

import React, { useEffect, useState } from "react";
import styles from "./page.module.css";
import Card from "@/app/components/card/Card";
import TrendingCarousel from "@/app/components/trending/TrendingCarousel";

export default function HomePage() {
  // Trending state
  const [trending, setTrending] = useState([]);
  const [loadingTrending, setLoadingTrending] = useState(true);

  useEffect(() => {
    async function fetchTrending() {
      setLoadingTrending(true);
      const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
      const res = await fetch(`https://api.themoviedb.org/3/trending/all/week?api_key=${apiKey}`);
      const data = await res.json();
      setTrending(data.results || []);
      setLoadingTrending(false);
    }
    fetchTrending();
  }, []);

  const dateYear = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.getFullYear();
  };

  return (
    <main className={styles.main}>

      <h1 className={styles.title}>Continue Watching</h1>
      <section className={styles.section}>
        {/* Aquí puedes añadir contenido relacionado */}
        <TrendingCarousel />
      </section>

      <h1 className={styles.title}>For You</h1>
      <section className={styles.section}>

        <TrendingCarousel />
      </section>

    </main>
  );
}
