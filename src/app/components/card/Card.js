import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./Card.module.css";

export default function Card({ id, type, image, title, release_date, onFaviconClick, idx }) {
    const [hovered, setHovered] = useState(false);
    // Fallback blurDataURL (tiny transparent image)
    const blurDataURL = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
    return (
        <div
            className={styles.card}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{ position: 'relative' }}
            title={title}
        >
            <div className={styles.imageWrapper} style={{ position: 'relative' }}>
                <Image
                    src={image}
                    alt={title || id}
                    width={230}
                    height={345}
                    className={styles.cardImage + (hovered ? ' ' + styles.blurred : '')}
                    loading={idx !== undefined && idx < 6 ? "eager" : "lazy"}
                    priority={idx !== undefined && idx < 6}
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 230px"
                    placeholder="blur"
                    blurDataURL={blurDataURL}
                />
                {hovered && (
                    <div className={styles.faviconOverlay} onClick={e => { e.stopPropagation(); onFaviconClick && onFaviconClick({ id, type }); }} style={{ cursor: 'pointer' }}>
                        <Image
                            src="/favicon.ico"
                            alt="favicon"
                            width={64}
                            height={64}
                            style={{ }}
                            loading="lazy"
                        />
                    </div>
                )}
            </div>
            <div className={styles.cardTitle} title={title}>
                <div className={styles.cardTitleInner}>{title}</div>
                <span className={styles.releaseDate}>({release_date})</span>
            </div>
        </div>
    );
}