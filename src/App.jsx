import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from './auth-context';
import useFetchAccounts from './useFetchAccounts';
import Navbar from './Components/Navbar';
import Home from './Pages/Home';
import './index.css';
import Ipo from './Pages/Ipo';
import Signup from './Pages/Signup';
import Login from './Pages/Login';
import ApplyIpo from './Pages/ApplyIpo';
import ViewIpo from './Pages/ViewIpo';
import Accounts from './Pages/Accounts';

const App = () => {
  return (
    <AuthProvider> {/* Wrap the entire app with AuthProvider to provide authentication context */}
      <Router>
        <AppInitializer />
      </Router>
    </AuthProvider>
  );
};

const AppInitializer = () => {
  const { accounts, loading } = useFetchAccounts();
  const { selectedAccounts, setSelectedAccounts } = useAuth();

  useEffect(() => {
    if (!loading && accounts.length > 0 && selectedAccounts.length === 0) {
      // Set the first account as the default selected account only once
      setSelectedAccounts([accounts[0]]);
    }
  }, [accounts, loading, selectedAccounts, setSelectedAccounts]);

  return <NavAndRoutes />;
};

const NavAndRoutes = () => {
  const location = useLocation();

  // Hide Navbar on Login or Signup pages
  const showNavbar = location.pathname !== "/login" && location.pathname !== "/signup";

  return (
    <>
      {showNavbar && <Navbar />} {/* Display Navbar only if not on Login or Signup page */}
      <div className='px-4 md:px-10'>
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Home />} />
          <Route path="/ipo" element={<Ipo />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/applyipo/:slug" element={<ApplyIpo />} />
          <Route path="/viewipo/:slug" element={<ViewIpo />} />
        </Routes>
      </div>
    </>
  );
};

export default App;
