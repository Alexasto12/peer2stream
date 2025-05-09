'use client'

import React, { useEffect, useState } from "react";
import styles from "./page.module.css";
import RecommendedCarousel from "@/app/components/recommended/RecommendedCarousel";
import Link from "next/link";

export default function HomePage() {
 

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

  // Estado para autenticación
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        setIsAuthenticated(res.ok);
      } catch {
        setIsAuthenticated(false);
      }
    }
    checkAuth();
  }, []);

  if (!isAuthenticated) {
    return (
      <main className={styles.centeredMain}>
        <div className={styles.centeredBox}>
          <h1 className={styles.title}>Home</h1>
          <p className={styles.centeredMsg}>You must log in to view the Home page</p>
          <Link href="/login" className={styles.loginBtn}>{'>'} Log in {'<'}</Link>
          <p className={styles.centeredMsg}>Or explore some content</p>
          <Link href="/discover" className={styles.loginBtn}>{'>'} Go to Discover {'<'}</Link>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.main}>

      <h1 className={styles.title}>Continue Watching</h1>
      <section className={styles.section}>
             <RecommendedCarousel 
        />
      </section>

      <h1 className={styles.title}>For You</h1>
      <section className={styles.section}>
        <RecommendedCarousel />
      </section>

    </main>
  );
}
