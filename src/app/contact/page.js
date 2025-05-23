import styles from './Contact.module.css';
import Link from "next/link";

export default function ContactPage() {
    return (
        <main className={styles.mainContact}>
            <div className={styles.contactContainer}>
                <h1 className={styles.contactTitle}>Contact</h1>
                <section className={styles.contactSection}>
                    <p className={styles.contactSectionText}>
                        Do you have any questions, suggestions, or need help?<br /><br />
                        You can contact us by email at:<br />
                        <Link href="mailto:peer2stream.daw@gmail.com" className={styles.contactEmail}>
                            peer2stream.daw@gmail.com
                        </Link><br /><br />
                        We aim to respond as soon as possible. Thank you for helping us improve Peer2Stream!
                    </p>
                    <Link href="mailto:peer2stream.daw@gmail.com?subject=Peer2Stream%20Support%20Request&body=Please%20describe%20your%20question%20or%20issue%20in%20detail.%20Our%20team%20will%20get%20back%20to%20you%20shortly." target="_blank" rel="noopener noreferrer">
                        <button className={styles.contactButton}>
                            📧 Send Email
                        </button>
                    </Link>
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
