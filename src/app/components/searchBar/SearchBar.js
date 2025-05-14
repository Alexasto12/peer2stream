import React, { useState, useRef } from "react";
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export default function SearchBar({
  searchQuery,
  setSearchQuery,
  setResults,
  setIsSearching,
  setSearchMode,
  suggestions,
  setSuggestions,
  handleSuggestionClick,
  onKeyDown,
  resetAllFilters // Añadimos setters de filtros
}) {
  const debounceTimeout = useRef();

  // Handler para limpiar el input y reiniciar búsqueda
  const handleClear = () => {
    setSearchQuery("");
    setSuggestions([]);
    setResults([]);
    setSearchMode(false);
    resetAllFilters && resetAllFilters();
  };

  const handleSearchInput = (e) => {
    resetAllFilters && resetAllFilters();
    const value = e.target.value;
    setSearchQuery(value);
    setSearchMode(!!value);
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    if (!value.trim()) {
      setSuggestions([]);
      setResults([]);
      setSearchMode(false);
      return;
    }
    debounceTimeout.current = setTimeout(async () => {
      setIsSearching(true);
      const BASE_URL = "https://api.themoviedb.org/3";
      const query = new URLSearchParams({
        api_key: process.env.NEXT_PUBLIC_TMDB_API_KEY,
        query: value
      }).toString();
      const res = await fetch(`${BASE_URL}/search/multi?${query}`);
      const data = await res.json();
      const filteredResults = (data.results || []).filter(item => item.media_type !== 'person' && item.poster_path);
      setSuggestions(filteredResults.slice(0, 5));
      setResults(filteredResults);
      setIsSearching(false);
    }, 800);
  };


  return (
    <div id="search-bar-root" className="w-full flex justify-center mt-2 mb-8 relative">
      <div className="relative w-full max-w-3xl">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchInput}
          onKeyDown={e => {
            onKeyDown && onKeyDown(e);
            if (e.key === "Enter") resetAllFilters && resetAllFilters();
          }}
          placeholder="Search movies or series..."
          className="block w-full rounded-full border border-blue-700 bg-[#18181b] py-3 pl-10 pr-10 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          autoComplete="on"
        />
        {searchQuery && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white focus:outline-none"
            style={{ zIndex: 2 }}
          >
            {/* Unicode X or SVG */}
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        )}
        <AnimatePresence>
          {suggestions.length > 0 && (
            <motion.ul
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className={`absolute z-30 left-0 right-0 mt-1 bg-[#23232b] border border-gray-700 rounded-lg shadow-lg ${suggestions.length >= 3 ? 'max-h-50 overflow-y-auto custom-scrollbar-lila' : ''}`}
            >
              {suggestions.map((item, idx) => (
                <li
                  key={item.id}
                  className="px-4 py-2 cursor-pointer hover:bg-[#18181b] flex items-center gap-4"
                  onClick={() => handleSuggestionClick(item)}
                >
                  <Image
                    src={item.poster_path ? `https://image.tmdb.org/t/p/w92${item.poster_path}` : "/file.svg"}
                    alt={item.title || item.name}
                    width={40}
                    height={56}
                    className="w-10 h-14 object-cover rounded"
                    loading="lazy"
                    unoptimized
                  />
                  <span>{item.title || item.name}</span>
                  <span className="ml-auto text-l text-gray-400">{item.media_type?.toUpperCase()}</span>
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
        {/* Minimalist lila scrollbar */}
        {suggestions.length >= 3 && (
          <style global jsx>{`
            .custom-scrollbar-lila::-webkit-scrollbar {
              width: 6px;
              background: transparent;
            }
            .custom-scrollbar-lila::-webkit-scrollbar-thumb {
              background: #a78bfa;
              border-radius: 6px;
            }
            .custom-scrollbar-lila {
              scrollbar-width: thin;
              scrollbar-color: #a78bfa #23232b;
            }
          `}</style>
        )}
      </div>
    </div>
  );
}
