// AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { auth } from "./firebase"; // Import your Firebase authentication setup
import { onAuthStateChanged } from "firebase/auth";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [selectedAccounts, setSelectedAccounts] = useState([]); // Add state for selected accounts

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, selectedAccounts, setSelectedAccounts }}>
      {children}
    </AuthContext.Provider>
  );
};