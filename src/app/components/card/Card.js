import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./Card.module.css";

export default function Card({ id, type, image, title, release_date }) {
    const [hovered, setHovered] = useState(false);

    return (
        <div
            className={styles.card}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{ position: 'relative' }}
        >
            <div className={styles.imageWrapper} style={{ position: 'relative' }}>
                <Image
                    src={image}
                    alt={id}
                    width={240}
                    height={340}
                    className={styles.cardImage + (hovered ? ' ' + styles.blurred : '')}
                    priority
                />
                {hovered && (
                    <div className={styles.faviconOverlay}>
                        <Image
                            src="/favicon.ico"
                            alt="favicon"
                            width={64}
                            height={64}
                            style={{ filter: 'drop-shadow(0 2px 8px #000)' }}
                        />
                    </div>
                )}
            </div>
            <div className={styles.cardTitle} title={title}>
                {title} ({release_date})
            </div>
        </div>
    );
}