import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./Card.module.css";

// export function useImdbId({ id, type }) {
//     const [imdbId, setImdbId] = useState("");
//     useEffect(() => {
//         const BASE_URL = "https://api.themoviedb.org/3";
//         const endpoint = type === "movie" ? `/movie/${id}` : `/tv/${id}`;
//         const query = new URLSearchParams({

//             api_key: process.env.NEXT_PUBLIC_TMDB_API_KEY

//         }).toString();

//         fetch(`${BASE_URL}${endpoint}?${query}`)
//             .then(res => res.json())
//             .then(data => {
//                 if (type === "movie") setImdbId(data.imdb_id);
//                 else if (type === "tv") setImdbId(data.imdb_id);
//             })

//             .catch(() => setImdbId(""));

//     }, [id, type]);
//     return imdbId;
// }

export default function Card({ id, type, image, title, release_date }) {
    // const imdbId = useImdbId({ id, type });

    return (
        <div className={styles.card}>
            <div className={styles.imageWrapper}>
                <Image
                    src={image}
                    alt={id}
                    width={240}
                    height={340}
                    className={styles.cardImage}
                    priority
                />
            </div>
            <div className={styles.cardTitle} title={title}>
                {title} ({release_date})
            </div>
        </div>
    );
}