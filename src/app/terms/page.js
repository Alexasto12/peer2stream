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
                        By accessing and using this website, you agree to comply with these Terms & Conditions and all applicable laws and regulations. If you do not agree with any of these terms, please do not use this site.
                    </p>
                </section>
                <section className={styles.termsSection}>
                    <h2 className={styles.termsSectionTitle}>2. Use of the Site</h2>
                    <p className={styles.termsSectionText}>
                        The content of this site is for informational and personal use only. Copying, distributing, or modifying any content without prior authorization is not permitted.
                    </p>
                </section>
                <section className={styles.termsSection}>
                    <h2 className={styles.termsSectionTitle}>3. Intellectual Property</h2>
                    <p className={styles.termsSectionText}>
                        All intellectual property rights to the content and materials on this site belong to their respective owners.
                    </p>
                </section>
                <section className={styles.termsSection}>
                    <h2 className={styles.termsSectionTitle}>4. Changes to the Terms</h2>
                    <p className={styles.termsSectionText}>
                        We reserve the right to modify these Terms & Conditions at any time. Changes will become effective once published on this page.
                    </p>
                </section>
                <section className={styles.termsSection}>
                    <h2 className={styles.termsSectionTitle}>5. Contact</h2>
                    <p className={styles.termsSectionText}>
                        If you have any questions about these Terms & Conditions, you can contact us through the site's contact form.
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
