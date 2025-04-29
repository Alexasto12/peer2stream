import React from 'react';
import styles from './NavBar.module.css';
import Link from 'next/link';
import Image from "next/image";
import { FaHome, FaCompass, FaFilm, FaSignInAlt, FaUserCircle, FaBell } from "react-icons/fa";

export default function NavBar({ isLoggedIn, notificationCount }) {
  return (
    <nav className={styles.navbar}>
      <div className={styles.logoContainer}>
        <Image src="/favicon.ico" alt="Logo" width={60} height={60} className={styles.logoIcon} />
      </div>
      <ul className={styles.navLinks}>
        <li><Link href="/"><FaHome title="Home" alt="Home" size={50} /></Link></li>
        <li><Link href="/discover"><FaCompass title="Discover" alt="Discover" size={50} /></Link></li>
        <li><Link href="/videoclub"><FaFilm title="Videoclub" alt="Videoclub" size={50} /></Link></li>
        <li>
          <Link href={isLoggedIn ? "/dashboard" : "/login"}>
            {isLoggedIn ? (
              <FaUserCircle title="Dashboard" alt="Dashboard" size={50} />
            ) : (
              <FaSignInAlt title="Login" alt="Login" size={50} />
            )}
          </Link>
        </li>
        <li style={{ position: 'relative' }}>
          <Link href="/notifications">
            <FaBell title="Notifications" alt="Notifications" size={50} />
            {notificationCount > 0 && (
              <span style={{
                position: 'absolute',
                top: 2,
                right: 2,
                background: '#e53935',
                color: '#fff',
                borderRadius: '50%',
                minWidth: 22,
                height: 22,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: 700,
                boxShadow: '0 2px 8px #0003',
                zIndex: 2
              }}>{notificationCount}</span>
            )}
          </Link>
        </li>
      </ul>
    </nav>
  );
}
