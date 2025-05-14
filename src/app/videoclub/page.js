"use client"

import React, { useEffect, useState } from "react";
import Card from "@/app/components/card/Card";
import CustomSelect from "../components/customSelect/CustomSelect";
import Modal from "@/app/components/modal/Modal";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./videoclub.module.css";
import Link from "next/link";

export default function VideoclubPage() {
  const [isLogged, setIsLogged] = useState(null); // null: loading, false: not logged, true: logged
  const [favourites, setFavourites] = useState(null); // null: loading, []: loaded
  const [cards, setCards] = useState([]);
  const [loadingCards, setLoadingCards] = useState(false);
  const [movieMeta, setMovieMeta] = useState([]); // Nuevo estado para títulos y fechas
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("title"); // "title" o "date"
  const [sortAsc, setSortAsc] = useState(true); // true: asc, false: desc
  const [selectedIds, setSelectedIds] = useState([]); // selector de card para eliminarlas
  // Estado para el modal y la card seleccionada
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false); // Modal de confirmación
  const [pendingDelete, setPendingDelete] = useState([]); // IDs pendientes de borrar

  const dateYear = function (date) {
    let year = new Date(date)
    return year.getFullYear()
  }

  // funcion para alternas la seleccion
  const toggleSelect = (external_id) => {
    setSelectedIds(prev =>
      prev.includes(external_id)
        ? prev.filter(id => id !== external_id)
        : [...prev, external_id]
    );
  };

  // Opciones para el select
  const sortOptions = [
    { value: "title", label: "Title" },
    { value: "date", label: "Release date" }
  ];

  // --- FUNCION PARA OBTENER FAVORITOS Y ACTUALIZAR ESTADOS ---
  const fetchFavourites = () => {
    fetch("/api/user/favourites/getFavourites/")
      .then(res => {
        if (res.status === 401) {
          setIsLogged(false);
          return null;
        }
        setIsLogged(true);
        return res.json();
      })
      .then(data => {
        let favs = [];
        if (data && data.favourites) {
          if (Array.isArray(data.favourites)) {
            favs = data.favourites;
          } else if (Array.isArray(data.favourites.content)) {
            favs = data.favourites.content;
          }
        }
        setFavourites(favs);
      })
      .catch(() => setFavourites([]));
  };

  // --- useEffect para cargar favoritos al montar ---
  useEffect(() => {
    fetchFavourites();
  }, []);

  // --- useEffect para actualizar cards y movieMeta cuando cambian los favoritos ---
  useEffect(() => {
    if (!favourites || favourites.length === 0) {
      setCards([]);
      setMovieMeta([]);
      return;
    }
    setLoadingCards(true);
    const fetchAll = async () => {
      const promises = favourites.map(fav => {
        return fetch(`https://api.themoviedb.org/3/find/${fav.external_id}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&external_source=imdb_id`)
          .then(res => res.json())
          .then(data => {
            if (data.movie_results && data.movie_results.length > 0) {
              return { ...data.movie_results[0], type: "movie", external_id: fav.external_id };
            } else if (data.tv_results && data.tv_results.length > 0) {
              return { ...data.tv_results[0], type: "tv", external_id: fav.external_id };
            } else {
              return null;
            }
          });
      });
      const results = (await Promise.all(promises)).filter(Boolean);
      setCards(results);
      const meta = results.map(item => ({
        title: item.title || item.name || "",
        date: item.release_date || item.first_air_date || "",
        type: item.type || "",
        id: item.id,
        external_id: item.external_id
      }));
      setMovieMeta(meta);
      setLoadingCards(false);
    };
    fetchAll();
  }, [favourites]);

  // --- FILTRO Y ORDEN SIEMPRE SOBRE movieMeta Y cards ---
  const filteredMeta = movieMeta
    .filter(item => item.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === "title") {
        return a.title.localeCompare(b.title);
      } else if (sort === "date") {
        return (b.date || "").localeCompare(a.date || "");
      }
      return 0;
    });
  const filteredMetaOrdered = sortAsc ? filteredMeta : [...filteredMeta].reverse();
  const filteredCards = filteredMetaOrdered.map(meta => cards.find(card => card.id === meta.id)).filter(Boolean);

  // --- ELIMINAR SELECCIONADOS Y REFRESCAR ---
  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    setPendingDelete([...selectedIds]);
    setShowConfirm(true);
  };

  const confirmDeleteSelected = async () => {
    const toRemove = pendingDelete.map(external_id => ({ external_id }));
    await fetch("/api/user/favourites/updateFavourites/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ add: [], remove: toRemove })
    });
    // Enviar notificación por cada eliminado
    toRemove.forEach(({ external_id }) => {
      const meta = movieMeta.find(m => m.external_id === external_id);
      const title = meta?.title || "Contenido";
      fetch("/api/user/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: `${title} has been removed from My Videoclub` })
      }).then(() => {
        window.dispatchEvent(new Event('notificationUpdate'));
      });
    });
    setSelectedIds([]);
    setShowConfirm(false);
    setPendingDelete([]);
    fetchFavourites();
  };

  // Handler para abrir el modal y cargar info detallada y proveedores
  const handleCardClick = async (card) => {
    setModalOpen(true);
    setModalData(null); // Mostrar loading
    const BASE_URL = "https://api.themoviedb.org/3";
    const endpoint = card.type === "movie" ? "movie" : "tv";
    const query = new URLSearchParams({ api_key: process.env.NEXT_PUBLIC_TMDB_API_KEY }).toString();
    // 1. Obtener detalles
    const res = await fetch(`${BASE_URL}/${endpoint}/${card.id}?${query}`);
    const data = await res.json();
    // 2. Obtener proveedores
    let providers = [];
    try {
      const provRes = await fetch(`${BASE_URL}/${endpoint}/${card.id}/watch/providers?${query}`);
      const provData = await provRes.json();
      if (provData.results && provData.results.ES && provData.results.ES.flatrate) {
        providers = provData.results.ES.flatrate;
      }
    } catch { }
    data.watchProviders = providers;
    setModalData(data);
  };

  useEffect(() => {
    // console.log("selectedIds changed:", selectedIds);
  }, [selectedIds]);

  if (!isLogged) {
    return (
      <main className={styles.centeredMain}>
        <div className={styles.centeredBox}>
          <h1 className={styles.title}>My Videoclub</h1>
          <p className={styles.centeredMsg}>You must log in to view My Videoclub</p>
          <Link href="/login" className={styles.loginBtn}>Log in</Link>
        </div>
      </main>
    );
  }

  if (favourites === null) {
    return (
      <main className={styles.centeredMain}>
        <div className={styles.centeredBox}>
          <h1 className={styles.title}>My Videoclub</h1>
          <p className={styles.centeredMsg}>You don&apos;t have any content saved in My Videoclub {":("}</p>
        </div>
      </main>
    );
  }

  if (favourites.length === 0) {
    return (
      <main className={styles.centeredMain}>
        <div className={styles.centeredBox}>
          <h1 className={styles.title}>My Videoclub</h1>
          <p className={styles.centeredMsg}>You don&apos;t have any content saved in My Videoclub {":("}</p>
        </div>
      </main>
    );
  }

  return (
    <div className={styles.mainVideoclub}>
      <div className={styles.mainVideoclubScrollable}>
        <h1 className={styles.title}>My Videoclub</h1>
        <p className={styles.subtitle}>Here you can view and manage your content collection</p>
        <div className={styles.controls}>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search per title..."
            className={styles.searchBar}
          />
          <CustomSelect options={sortOptions} value={sort} onChange={setSort} />
          <button
            className={styles.sortOrderBtn}
            onClick={() => setSortAsc(a => !a)}
            title={sortAsc ? 'Sort descending' : 'Sort ascending'}
            aria-label={sortAsc ? 'Sort descending' : 'Sort ascending'}
          >
            {sortAsc ? '↓' : '↑'}
          </button>
          {selectedIds.length > 0 && (
            <button
              className={styles.deleteBtn}
              onClick={handleDeleteSelected}
            >
              Delete selected
            </button>
          )}
        </div>
        {/* Delete confirmation modal */}
        {showConfirm && (
          <div className={styles.videoclubModalOverlay}>
            <div className={styles.videoclubModalBox}>
              <h2 className={styles.videoclubModalTitle}>
                Are you sure you want to delete {pendingDelete.length} item{pendingDelete.length !== 1 ? 's' : ''} from My Videoclub?
              </h2>
              <p className={styles.videoclubModalDesc}>
                This action cannot be undone.
              </p>
              <div className={styles.videoclubModalActions}>
                <button
                  onClick={confirmDeleteSelected}
                  className={styles.videoclubModalBtnDelete}
                >
                  Yes, delete
                </button>
                <button
                  onClick={() => { setShowConfirm(false); setPendingDelete([]); }}
                  className={styles.videoclubModalBtnCancel}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        {loadingCards ? (
          <div className={styles.loadingMsg}>Loading My Videoclub...</div>
        ) : (
          <div className={styles.gridScrollContainer}>
            <div className={styles.cardsGrid}>
              {filteredCards.map(card => (
                <motion.div
                  key={card.external_id}
                  className={`${styles.cardWrapper} ${selectedIds.includes(card.external_id) ? styles.selectedCard : ""}`}
                  onClick={() => toggleSelect(card.external_id)}
                  layout
                  animate={selectedIds.includes(card.external_id) ? { scale: 1.04 } : { scale: 1 }}
                  transition={{ type: 'spring', stiffness: 225, damping: 25 }}
                >
                  <Card
                    id={card.id}
                    type={card.title ? "movie" : "tv"}
                    image={card.poster_path ? `https://image.tmdb.org/t/p/w500${card.poster_path}` : "/file.svg"}
                    title={card.title || card.name}
                    release_date={dateYear(card.release_date) || dateYear(card.first_air_date)}
                    onFaviconClick={handleCardClick}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        )}
        <AnimatePresence>
          {modalOpen && (
            <Modal open={modalOpen} onClose={() => setModalOpen(false)} data={modalData} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
