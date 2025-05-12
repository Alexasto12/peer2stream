import styles from './Contact.module.css';
import Link from "next/link";

export default function ContactPage() {
    return (
        <main className={styles.mainContact}>
            <div className={styles.contactContainer}>
                <h1 className={styles.contactTitle}>Contact</h1>
                <section className={styles.contactSection}>
                    <p className={styles.contactSectionText}>
                        Do you have any questions, suggestions, or need help? <br />
                        You can contact us by email and we will get back to you as soon as possible.
                    </p>
                    <a href="mailto:peer2stream.daw@gmail.com">
                        <button className={styles.contactButton}>Send email</button>
                    </a>
                </section>
            <div className={styles.backToDashboardBottomWrapper}>
                <Link href="/dashboard" className={styles.backToDashboard}>
                    <span aria-hidden="true" style={{fontSize: '1.3em', marginRight: 8}}>←</span> Back to Dashboard
                </Link>
            </div>
            </div>
        </main>
    );
}
