"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [me, setMe] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoadingUser(false);
      return;
    }

    (async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_AUTH_API_URL}/auth/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (res.ok) {
          const data = await res.json();
          setMe(data);
        } else {
          localStorage.removeItem("token");
        }
      } catch (err) {
        console.error("❌ Failed to load user:", err);
      } finally {
        setLoadingUser(false);
      }
    })();
  }, []);

  return (
    <UserContext.Provider value={{ me, setMe, loadingUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
