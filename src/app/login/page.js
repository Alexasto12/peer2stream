"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./Login.module.css";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        router.push("/dashboard");
      } else {
        const data = await res.json();
        setError(data.message || "Login failed");
      }
    } catch (err) {
      setError("Network error");
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.formCard}>
        <Image src="/file.svg" alt="Logo" width={112} height={80} className={styles.logo} priority />
        <div className={styles.welcome}>Bienvenido</div>
        <div className={styles.loginTitle}>Login</div>
        <div className={styles.loginDesc}>Accede a tu cuenta para gestionar tu videoclub.</div>
        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
          <div className={styles.formGroup}>
            <label>Email:</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className={styles.formGroup}>
            <label>Contraseña:</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          {error && <div className={styles.error}>{error}</div>}
          <button type="submit" className={styles.loginButton}>Iniciar sesión</button>
        </form>
      </div>
    </div>
  );
}
