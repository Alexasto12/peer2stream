import styles from "./Terms.module.css";
import React from "react";
import Link from "next/link";

export default function TermsPage() {
    return (
        <div className={styles.mainTerms}>
            <div className={styles.termsContainer}>
                <h1 className={styles.termsTitle}>Terms & Conditions</h1>
                <section className={styles.termsSection}>
                    <h2 className={styles.termsSectionTitle}>1. Acceptance of Terms</h2>
                    <p className={styles.termsSectionText}>
                        By accessing and using Peer2Stream, you agree to comply with these Terms & Conditions and all applicable laws and regulations. If you do not agree with any of these terms, please do not use this site.
                    </p>
                </section>
                <section className={styles.termsSection}>
                    <h2 className={styles.termsSectionTitle}>2. Use of External Plugins</h2>
                    <p className={styles.termsSectionText}>
                        Peer2Stream may require or allow the use of external plugins or third-party tools to enable certain functionalities, such as streaming or enhanced playback. The installation and use of such plugins are at your own risk. Peer2Stream is not responsible for the content, security, or privacy practices of any third-party plugins or services.
                    </p>
                </section>
                <section className={styles.termsSection}>
                    <h2 className={styles.termsSectionTitle}>3. User Responsibility</h2>
                    <p className={styles.termsSectionText}>
                        You are solely responsible for your activity on Peer2Stream, including the content you access, stream, or share. You agree to use the platform only for lawful purposes and in accordance with all applicable laws and regulations in your jurisdiction.
                    </p>
                </section>
                <section className={styles.termsSection}>
                    <h2 className={styles.termsSectionTitle}>4. Intellectual Property</h2>
                    <p className={styles.termsSectionText}>
                        All intellectual property rights to the content and materials on this site belong to their respective owners. Peer2Stream does not claim ownership of any third-party content accessible through the platform.
                    </p>
                </section>
                <section className={styles.termsSection}>
                    <h2 className={styles.termsSectionTitle}>5. Privacy</h2>
                    <p className={styles.termsSectionText}>
                        Peer2Stream values your privacy. Please refer to our Privacy Policy for information on how we collect, use, and protect your personal data.
                    </p>
                </section>
                <section className={styles.termsSection}>
                    <h2 className={styles.termsSectionTitle}>6. Changes to the Terms</h2>
                    <p className={styles.termsSectionText}>
                        We reserve the right to modify these Terms & Conditions at any time. Changes will become effective once published on this page.
                    </p>
                </section>
                <div className={styles.backToDashboardBottomWrapper}>
                    <Link href="/dashboard" className={styles.backToDashboard}>
                        <span aria-hidden="true" style={{fontSize: '1.3em', marginRight: 8}}>←</span> Back to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
