import styles from "./Cookie.module.css";
import React from "react";
import Link from "next/link";

export default function CookiePolicyPage() {
    return (
        <div className={styles.mainCookie}>
            <div className={styles.cookieContainer}>
                <h1 className={styles.cookieTitle}>Cookie Policy</h1>
                <section className={styles.cookieSection}>
                    <h2 className={styles.cookieSectionTitle}>1. Introduction</h2>
                    <p className={styles.cookieSectionText}>
                        This Cookie Policy explains how we use cookies and similar technologies on our website. By using our site, you consent to the use of cookies as described in this policy.
                    </p>
                </section>
                <section className={styles.cookieSection}>
                    <h2 className={styles.cookieSectionTitle}>2. What Are Cookies?</h2>
                    <p className={styles.cookieSectionText}>
                        Cookies are small text files stored on your device by your browser. They help us improve your experience and analyze site usage.
                    </p>
                </section>
                <section className={styles.cookieSection}>
                    <h2 className={styles.cookieSectionTitle}>3. Types of Cookies We Use</h2>
                    <p className={styles.cookieSectionText}>
                        We use both session and persistent cookies for essential site functions, analytics, and to remember your preferences.
                    </p>
                </section>
                <section className={styles.cookieSection}>
                    <h2 className={styles.cookieSectionTitle}>4. Managing Cookies</h2>
                    <p className={styles.cookieSectionText}>
                        You can control or delete cookies through your browser settings. Disabling cookies may affect the functionality of our website.
                    </p>
                </section>
                <section className={styles.cookieSection}>
                    <h2 className={styles.cookieSectionTitle}>5. Changes to This Policy</h2>
                    <p className={styles.cookieSectionText}>
                        We may update this Cookie Policy from time to time. Any changes will be posted on this page with an updated effective date.
                    </p>
                </section>
                <section className={styles.cookieSection}>
                    <h2 className={styles.cookieSectionTitle}>6. Contact</h2>
                    <p className={styles.cookieSectionText}>
                        If you have any questions about our use of cookies, please contact us through the site's contact form.
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
