import Image from "next/image";
import styles from "./Card.module.css";

export default function Card({ image, title }) {
    return (
        <div className={styles.card}>
            <div className={styles.imageWrapper}>
                <Image
                    src={image}
                    alt={title}
                    width={240}
                    height={340}
                    className={styles.cardImage}
                    priority
                />
            </div>
            <div className={styles.cardTitle} title={title}>
                {title}
            </div>
        </div>
    );
}