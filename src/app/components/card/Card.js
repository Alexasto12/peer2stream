import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./Card.module.css";

export default function Card({ id, type, image, title, release_date, onFaviconClick }) {
    const [hovered, setHovered] = useState(false);

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
                    alt={id}
                    width={240}
                    height={340}
                    className={styles.cardImage + (hovered ? ' ' + styles.blurred : '')}
                    loading="lazy"
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