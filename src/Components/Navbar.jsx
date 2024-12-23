import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom"; // Use NavLink for active page styling
import SelectAccountCard from "./SelectAccountCard";
import { useAuth } from '../auth-context'; // Assuming you're using a context for authentication

const Navbar = () => {
  const { selectedAccounts, setSelectedAccounts, user } = useAuth();
  const [showCard, setShowCard] = useState(false);
  const location = useLocation(); // Get the current location (URL)

  useEffect(() => {
    // Automatically select the first account if none is selected and accounts are available
    if (user && selectedAccounts.length === 0 && user.accounts && user.accounts.length > 0) {
      const firstAccount = [user.accounts[0]]; // Assuming user.accounts is the list of accounts
      setSelectedAccounts(firstAccount); // Set the first account as selected
    }
  }, [user, selectedAccounts, setSelectedAccounts]);

  const handleButtonClick = () => {
    setShowCard(!showCard); // Toggle card visibility
  };

  const handleCloseCard = () => {
    setShowCard(false); // Close the card
  };

  const handleAccountSelection = (selectedAccounts) => {
    setSelectedAccounts(selectedAccounts); // Update global state with selected accounts
  };

  const getDisplayAccountName = () => {
    if (selectedAccounts.length === 0) {
      return "Select Account"; // Default when no account is selected
    }
    if (selectedAccounts.length === 1) {
      return selectedAccounts[0]; // Display the single selected account
    }
    return "All"; // Display "All" when multiple accounts are selected
  };

  const isActiveRoute = (path) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  return (
    <nav className="text-black md:py-6">
      <div className="container mx-auto">
        {/* Mobile View: Stoxfolio and Accounts */}
        <div className="flex md:flex-row px-6 mt-4 justify-between items-center md:space-x-6 md:hidden">
          <NavLink to="/" className="text-2xl font-medium ">
            Stocxfolio
          </NavLink>
          <button
            className="bg-[#1d1d1d] text-white text-md py-1 px-6 rounded-2xl"
            onClick={handleButtonClick} // Button click handler
          >
            {getDisplayAccountName()} {/* Show the selected account name */}
          </button>
        </div>

        {/* Mobile View: NavLinks */}
        <div className="flex justify-between items-center mb-6 px-4 md:flex-row md:justify-center md:items-center md:space-y-0 md:space-x-6 mt-6 md:hidden">
          <ul className="flex flex-col md:flex-row md:space-x-6">
            <li>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  isActive || location.pathname === "/"
                    ? "bg-[#000000] text-white py-2 px-6 rounded-md"
                    : "bg-[#D9D9D9] text-black py-2 px-6 rounded-md"
                }
              >
                Home
              </NavLink>
            </li>
          </ul>
          <ul className="flex flex-col md:flex-row md:space-x-6">
            <li>
              <NavLink
                to="/ipo"
                className={({ isActive }) =>
                  isActive || isActiveRoute("/ipo") || isActiveRoute("/applyipo") || isActiveRoute("/viewipo")
                    ? "bg-[#000000] text-white py-2 px-6 rounded-md"
                    : "bg-[#D9D9D9] text-black py-2 px-6 rounded-md"
                }
              >
                IPO
              </NavLink>
            </li>
          </ul>
          <ul className="flex flex-col md:flex-row md:space-x-6">
            <li>
              <NavLink
                to="/accounts"
                className={({ isActive }) =>
                  isActive || location.pathname === "/accounts"
                    ? "bg-[#000000] text-white py-2 px-6 rounded-md"
                    : "bg-[#D9D9D9] text-black py-2 px-6 rounded-md"
                }
              >
                Accounts
              </NavLink>
            </li>
          </ul>
        </div>

        {/* Desktop View */}
        <div className="hidden md:flex justify-between items-center">
          <NavLink to="/" className="text-2xl font-medium">
            Stocxfolio
          </NavLink>
          <div className="flex justify-center items-center gap-6">
            <ul className="flex ">
              <li>
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    isActive || location.pathname === "/"
                      ? "bg-[#000000] text-white md:py-1 md:px-8 rounded-md"
                      : "bg-[#D9D9D9] text-black md:py-1 md:px-8 rounded-md"
                  }
                >
                  Home
                </NavLink>
              </li>
            </ul>
            <ul className="flex space-x-6">
              <li>
                <NavLink
                  to="/ipo"
                  className={({ isActive }) =>
                    isActive || isActiveRoute("/ipo") || isActiveRoute("/applyipo") || isActiveRoute("/viewipo")
                      ? "bg-[#000000] text-white md:py-1 md:px-8 rounded-md"
                      : "bg-[#D9D9D9] text-black md:py-1 md:px-8 rounded-md"
                  }
                >
                  IPO
                </NavLink>
              </li>
            </ul>
            <ul className="flex space-x-6">
              <li>
                <NavLink
                  to="/accounts"
                  className={({ isActive }) =>
                    isActive || location.pathname === "/accounts"
                      ? "bg-[#000000] text-white md:py-1 md:px-8 rounded-md"
                      : "bg-[#D9D9D9] text-black md:py-1 md:px-8 rounded-md"
                  }
                >
                  Accounts
                </NavLink>
              </li>
            </ul>
          </div>
          <button
            className="bg-[#1d1d1d] text-white md:py-1 md:px-8 rounded-2xl"
            onClick={handleButtonClick}
          >
            {getDisplayAccountName()}
          </button>
        </div>
      </div>

      {/* Account Selection Card */}
      {showCard && <SelectAccountCard onClose={handleCloseCard} onSelectAccount={handleAccountSelection} />}
    </nav>
  );
};

export default Navbar;
