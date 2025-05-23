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
                    <h2 className={styles.cookieSectionTitle}>3. Cookie Used</h2>
                    <p className={styles.cookieSectionText}>
                        Peer2Stream only uses a single essential cookie: a JSON Web Token (JWT) for authentication purposes. This cookie is required to securely identify you while you are logged in. No tracking, analytics, or advertising cookies are used.
                    </p>
                </section>
                <section className={styles.cookieSection}>
                    <h2 className={styles.cookieSectionTitle}>4. Managing Cookies</h2>
                    <p className={styles.cookieSectionText}>
                        You can control or delete cookies through your browser settings. Disabling the authentication cookie will prevent you from logging in or using personalized features.
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
                        If you have any questions about our use of cookies, please contact us through the site&apos;s contact form.
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
