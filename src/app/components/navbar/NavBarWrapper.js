"use client";
import React, { useEffect, useState } from "react";
import NavBar from "./NavBar";

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
    return () => {
      window.removeEventListener('notificationUpdate', handleNotificationUpdate);
    };
  }, [isLoggedIn]);

  return (
    <>
      <NavBar isLoggedIn={isLoggedIn} notificationCount={notificationCount} />
      {children && React.cloneElement(children, { setNotificationCount })}
    </>
  );
}
