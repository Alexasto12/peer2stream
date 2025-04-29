'use client'

import Card from "@/app/components/card/Card";
import { useEffect, useState } from "react";
import React from "react";

export default function DiscoverPage() {

  // Estado para endpoint y parámetros
  const [endpoint, setEndpoint] = useState("/trending/all/week"); // valor por defecto
  const [params, setParams] = useState({});
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const [contentCount, setContentCount] = useState(20); // Por defecto 1, pero puedes cambiarlo

  useEffect(() => {
    const BASE_URL = "https://api.themoviedb.org/3";

    const query = new URLSearchParams({
      ...params,
      api_key: process.env.NEXT_PUBLIC_TMDB_API_KEY
    }).toString();

    fetch(`${BASE_URL}${endpoint}?${query}`)
      .then(res => res.json())
      .then(data => setResults(data.results || []))
      .catch(() => setError("Error al cargar resultados"));
  }, [endpoint, params]);

  return (
    <main style={{ paddingLeft: "220px", padding: "2rem" }}>
      <h1>Discover</h1>
      <p>Descubre nuevas películas y series recomendadas para ti.</p>
      {error && <div style={{color: "red"}}>{error}</div>}
      <div className="flex flex-wrap gap-6 justify-start items-start mt-8">
        {results.slice(0, contentCount).map((item, idx) => (
          <Card
            key={item.id || idx}
            image={item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : "/file.svg"}
            title={item.title || item.name}
          />
        ))}
      </div>
    </main>
  );
}
