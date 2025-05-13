import React from "react";
import styles from "./ForgotPasswordModal.module.css";

export default function ForgotPasswordModal({ open, onClose, email, setEmail, onSubmit, loading, error, success }) {
    if (!open) return null;
    return (
        <div className={styles.backdrop} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={onClose}>&times;</button>
                <h2 className={styles.title}>Recover password</h2>
                <form onSubmit={onSubmit} className={styles.form}>
                    <label className={styles.label}>Email</label>
                    <input
                        className={styles.input}
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        autoFocus
                    />
                    {error && <div className={styles.error}>{error}</div>}
                    {success && <div className={styles.success}>{success}</div>}
                    <button className={styles.button} type="submit" disabled={loading}>
                        {loading ? "Sending..." : "Send instructions"}
                    </button>
                </form>
            </div>
        </div>
    );
}