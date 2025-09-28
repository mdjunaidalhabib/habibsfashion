"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [me, setMe] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // ✅ Helper: fetch user by token
  const fetchMe = async (token) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_AUTH_API_URL}/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        }
      );
      if (res.ok) {
        const data = await res.json();
        setMe(data);
      } else {
        localStorage.removeItem("token");
        setMe(null);
      }
    } catch (err) {
      console.error("❌ Failed to load user:", err);
      setMe(null);
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoadingUser(false);
      return;
    }
    fetchMe(token);
  }, []);

  return (
    <UserContext.Provider value={{ me, setMe, loadingUser, fetchMe }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
