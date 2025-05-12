"use client";
import React, { useEffect, useState } from "react";
import NavBar from "./NavBar";
import Image from "next/image";
import styles from "./NavBar.module.css";
import Link from 'next/link';


export default function NavBarWrapper({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((res) => {
        if (res.ok) setIsLoggedIn(true);
        else setIsLoggedIn(false);
      })
      .catch(() => setIsLoggedIn(false));
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetch("/api/user/notifications", { credentials: "include" })
        .then((res) => res.json())
        .then((data) => {
          if (data.notifications) setNotificationCount(data.notifications.length);
        })
        .catch(() => setNotificationCount(0));
    } else {
      setNotificationCount(0);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    const handleNotificationUpdate = () => {
      if (isLoggedIn) {
        fetch("/api/user/notifications", { credentials: "include" })
          .then((res) => res.json())
          .then((data) => {
            if (data.notifications) setNotificationCount(data.notifications.length);
          })
          .catch(() => setNotificationCount(0));
      } else {
        setNotificationCount(0);
      }
    };
    window.addEventListener('notificationUpdate', handleNotificationUpdate);
    // Nuevo: escuchar cambios de autenticación
    const handleAuthChanged = () => {
      fetch("/api/auth/me", { credentials: "include" })
        .then((res) => setIsLoggedIn(res.ok))
        .catch(() => setIsLoggedIn(false));
    };
    window.addEventListener('authChanged', handleAuthChanged);
    return () => {
      window.removeEventListener('notificationUpdate', handleNotificationUpdate);
      window.removeEventListener('authChanged', handleAuthChanged);
    };
  }, [isLoggedIn]);

  return (
    <>

      <div className={styles["favicon-shine"]} style={{
        position: 'fixed',
        top: '2vh',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '7.125%',
        minWidth: 85.5,
        maxWidth: 133,
      }}>

        <Link href="/">
          <Image src="/favicon.ico" alt="Logo" width={84} height={84} />
        </Link>
      </div>
      <div className={styles.logoutBtnContainer}>
        {isLoggedIn && (
          <button
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new Event('authChanged'));
                window.location.href = '/login';
              }
            }}
            title="Log out"
            className={styles.logoutBtn}
            aria-label="Log out"
          >
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
        )}
      </div>
      <NavBar isLoggedIn={isLoggedIn} notificationCount={notificationCount} />
      {children && React.cloneElement(children, { setNotificationCount })}

    </>
  );
}
