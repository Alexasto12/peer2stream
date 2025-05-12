import styles from './Contact.module.css';

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
            </div>
        </main>
    );
}
