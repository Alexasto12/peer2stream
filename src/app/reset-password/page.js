"use client";
import { Suspense } from "react";
import ResetPasswordContent from "./ResetPasswordContent";
import styles from "./reset.module.css";

export const dynamic = "force-dynamic";

export default function ResetPasswordPage() {
    return (
        <div className={styles.loginContainer}>
            <div className={styles.formCard}>
                <Suspense fallback={<div>Cargando...</div>}>
                    <ResetPasswordContent />
                </Suspense>
            </div>
        </div>
    );
}
