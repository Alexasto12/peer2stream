import React from 'react';
import styles from './NavBar.module.css';
import Link from 'next/link';
import Image from "next/image";
import { FaHome, FaCompass, FaFilm, FaSignInAlt, FaUserCircle, FaBell } from "react-icons/fa";

export default function NavBar({ isLoggedIn }) {
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
        <li><Link href="/notifications"><FaBell title="Notifications" alt="Notifications" size={50} /></Link></li>
      </ul>
    </nav>
  );
}
