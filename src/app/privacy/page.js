import styles from "./Privacy.module.css";
import React from "react";

export default function PrivacyPolicyPage() {
    return (
        <div className={styles.mainPrivacy}>
            <div className={styles.privacyContainer}>
                <h1 className={styles.privacyTitle}>Privacy Policy</h1>
                <section className={styles.privacySection}>
                    <h2 className={styles.privacySectionTitle}>1. Introduction</h2>
                    <p className={styles.privacySectionText}>
                        We value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our website.
                    </p>
                </section>
                <section className={styles.privacySection}>
                    <h2 className={styles.privacySectionTitle}>2. Information We Collect</h2>
                    <p className={styles.privacySectionText}>
                        We may collect personal information such as your name, email address, and usage data when you register or interact with our services.
                    </p>
                </section>
                <section className={styles.privacySection}>
                    <h2 className={styles.privacySectionTitle}>3. Use of Information</h2>
                    <p className={styles.privacySectionText}>
                        Your information is used to provide and improve our services, communicate with you, and ensure the security of our platform.
                    </p>
                </section>
                <section className={styles.privacySection}>
                    <h2 className={styles.privacySectionTitle}>4. Data Sharing</h2>
                    <p className={styles.privacySectionText}>
                        We do not sell or share your personal information with third parties except as required by law or to provide our services.
                    </p>
                </section>
                <section className={styles.privacySection}>
                    <h2 className={styles.privacySectionTitle}>5. Your Rights</h2>
                    <p className={styles.privacySectionText}>
                        You have the right to access, update, or delete your personal information. Contact us if you wish to exercise these rights.
                    </p>
                </section>
                <section className={styles.privacySection}>
                    <h2 className={styles.privacySectionTitle}>6. Changes to this Policy</h2>
                    <p className={styles.privacySectionText}>
                        We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated effective date.
                    </p>
                </section>
            </div>
        </div>
    );
}
