import React from 'react';
import styles from './NavBar.module.css';
import Link from 'next/link';
import Image from "next/image";
import { FaHome, FaCompass, FaSignInAlt, FaUserCircle, FaBell} from "react-icons/fa";

import { usePathname } from 'next/navigation';


export default function NavBar({ isLoggedIn, notificationCount }) {
  const pathname = usePathname();
  return (
    <nav className={styles.navbar}>
      <ul className={styles.navLinks}>
        <li>
          <Link href="/" className={pathname === '/' ? styles.active : ''}>
            <FaHome title="Home" alt="Home" size={50} />
          </Link>
        </li>
        <li>
          <Link href="/discover" className={pathname.startsWith('/discover') ? styles.active : ''}>
            <FaCompass title="Discover" alt="Discover" size={50} />
          </Link>
        </li>
        <li>
          <Link href="/videoclub" className={pathname.startsWith('/videoclub') ? styles.active : ''}>
            <Image
              src="/videoclub.svg"
              alt="My Videoclub"
              title="My Videoclub"
              width={50}
              height={50}
              style={{ filter:' brightness(0) saturate(100%) invert(89%) sepia(11%) saturate(11%) hue-rotate(344deg) brightness(85%) contrast(83%)' }} 
            />
          </Link>
        </li>
        <li>
          <Link href={isLoggedIn ? "/dashboard" : "/login"} className={pathname.startsWith('/dashboard') || pathname.startsWith('/login') ? styles.active : ''}>
            {isLoggedIn ? (
              <FaUserCircle title="Dashboard" alt="Dashboard" size={50} />
            ) : (
              <FaSignInAlt title="Login" alt="Login" size={50} />
            )}
          </Link>
        </li>
        <li style={{ position: 'relative' }}>
          <Link href="/notifications" className={pathname.startsWith('/notifications') ? styles.active : ''}>
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
