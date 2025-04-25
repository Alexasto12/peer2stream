"use client";
import React, { useEffect, useState } from "react";
import NavBar from "./NavBar";

export default function NavBarWrapper() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((res) => {
        if (res.ok) setIsLoggedIn(true);
        else setIsLoggedIn(false);
      })
      .catch(() => setIsLoggedIn(false));
  }, []);
  return <NavBar isLoggedIn={isLoggedIn} />;
}
