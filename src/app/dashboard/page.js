"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function fetchUser() {
      try {
        // Ya no es necesario obtener ni enviar el token manualmente
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          setError("No se pudo cargar el usuario");
        }
      } catch {
        setError("Error de red");
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  if (loading) return <main style={{ paddingLeft: "220px", padding: "2rem" }}><p>Cargando...</p></main>;
  if (error) return <main style={{ paddingLeft: "220px", padding: "2rem" }}><p style={{color: 'red'}}>{error}</p></main>;
  if (!user) return null;

  return (
    <main style={{ paddingLeft: "220px", padding: "2rem" }}>
      <h1>Dashboard</h1>
      <section style={{ marginBottom: 32 }}>
        <h2>Datos del usuario</h2>
        <p><b>Nombre:</b> {user.name || user.username || "-"}</p>
        <p><b>Email:</b> {user.email}</p>
      </section>
      <section style={{ display: 'flex', gap: 24 }}>
        <button onClick={() => router.push('/dashboard')}>Resumen</button>
        <button onClick={() => router.push('/notifications')}>Notificaciones</button>
        <button onClick={() => router.push('/videoclub')}>Videoclub</button>
        <button onClick={() => router.push('/discover')}>Descubrir</button>
        <button onClick={() => router.push('/dashboard/settings')}>Ajustes</button>
        <button onClick={() => router.push('/dashboard/favourites')}>Favoritos</button>
      </section>
    </main>
  );
}
