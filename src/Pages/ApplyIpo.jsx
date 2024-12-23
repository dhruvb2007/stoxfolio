import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import useFetchAccounts from '../useFetchAccounts'; // Import the hook
import { db } from '../firebase'; // Firebase instance
import { doc, collection, addDoc, updateDoc, increment, getDocs } from 'firebase/firestore'; // Firebase Firestore methods
import { useAuth } from '../auth-context'

function ApplyIpo() {
  const { user } = useAuth();
  const { slug } = useParams();  // Extract slug from the URL params
  const [ipoDetails, setIpoDetails] = useState(null);
  const [error, setError] = useState(null);  // Add state for error handling
  const { accounts, loading } = useFetchAccounts();  // Fetch accounts from the custom hook
  const [selectedAccount, setSelectedAccount] = useState('');  // State for selected account
  const navigate = useNavigate(); 

  useEffect(() => {
    const fetchIpoDetails = async () => {
      try {
        const response = await axios.post(`http://localhost:5000/get-ipo-data/${slug}`);
        console.log('IPO Details:', response.data.Data);
        setIpoDetails(response.data.Data);  // Set IPO details
      } catch (error) {
        console.error('Error fetching IPO details:', error);
        setError('There was an error fetching the IPO details. Please try again later.');  // Update error state
      }
    };

    fetchIpoDetails();
  }, [slug]);  // Re-fetch when slug changes

  if (error) {
    return <p>{error}</p>;  // Show error message if there's an error
  }

  if (!ipoDetails) {
    return <p>Loading IPO details...</p>;  // Show loading message while fetching IPO details
  }

  const handleAccountChange = (event) => {
    setSelectedAccount(event.target.value);  // Update selected account
  };

  const handleApplyClick = async (lot) => {
    if (!selectedAccount) {
      alert("Please select an account.");
      return;
    }
  
    try {
      const userRef = doc(db, 'Users', user.uid);  // Replace with actual user ID from auth context
      const accountRef = doc(userRef, 'Accounts', selectedAccount);  // Reference to the selected account's document
  
      // Prepare the data to be stored in Firebase
      const appliedData = {
        stock_name: ipoDetails.companyName,
        quantity: lot.shares,  // You can modify this to match user input
        buy_price: ipoDetails.fromPrice,  // Assuming this is the buy price
        invested_amount: lot.amount,  // Total amount to be invested
        is_allotted: false,  // Initially, set it as not allotted
        ipo_slug: ipoDetails.slug
      };
  
      // Add data to the Applied subcollection
      const appliedRef = collection(accountRef, 'Applied');
      await addDoc(appliedRef, appliedData);
  
      // Increment the 'pending' field in the 'Basics' subcollection
      const basicsRef = collection(accountRef, 'Basics');
      const basicsSnapshot = await getDocs(basicsRef);
  
      // Check if there are documents in the Basics subcollection
      if (basicsSnapshot.empty) {
        alert("No Basics document found for this account.");
        return;
      }
  
      const basicsDocRef = basicsSnapshot.docs[0].ref;  // Assuming there's only one document in the Basics subcollection
  
      // Update the pending field
      await updateDoc(basicsDocRef, {
        pending: increment(1),
        total_investment: increment(lot.amount)
      });
  
      alert("IPO Application Successful!");
    } catch (error) {
      console.error("Error applying for IPO:", error);
      alert("There was an error applying for the IPO.");
    }
  };
  
  return (
    <main>
      <button
        onClick={() => navigate(-1)}  // Navigate back
        className="bg-black text-white py-1 px-4 rounded-md mt-2 material-symbols-rounded"
      >
        keyboard_backspace
      </button>
      <div className="flex mt-6 flex-col md:flex-row px-4 md:px-0">
        <div className="md:w-1/3  md:px-6">
          <h1 className="text-4xl font-medium">{ipoDetails.companyName}</h1>

          {/* Dropdown for selecting account */}
          <select
            value={selectedAccount}
            onChange={handleAccountChange}
            className="bg-black text-white py-2 px-8 rounded-md w-full mt-4"
            disabled={loading} // Disable dropdown while loading accounts
          >
            <option value="" disabled>Select Account</option>
            {accounts.map((account, index) => (
              <option key={index} value={account}>
                {account}
              </option>
            ))}
          </select>
        </div>
        <div className="md:w-2/3 py-4 md:mt-0 mt-4 md:px-32">
          <p>Offer Date: {new Date(ipoDetails.IPOOpenDate).toLocaleDateString()}</p>
          <p>GMP: {ipoDetails.GMP ? ipoDetails.GMP + '₹ (' + (((ipoDetails.GMP * 100) / ipoDetails.toPrice).toFixed(2)) + '%)' : '-'}</p>
          <p>Status: {ipoDetails.IPOstatus}</p>
          <p>Offer Price: ₹{ipoDetails.fromPrice} - ₹{ipoDetails.toPrice}</p>
          <p>Listing Date: {new Date(ipoDetails.IPOListingDate).toLocaleDateString()}</p>
          <p>Category: {ipoDetails.CategoryForIPOS}</p>
          <p>Subscription Date: {new Date(ipoDetails.subscriptionDateAndTime).toLocaleString()}</p>
        </div>
      </div>

      {/* Financial Lots Table */}
      <div className="container mx-auto px-2 py-4 md:px-6 md:py-6 mt-2 md:mt-6">
        {/* Desktop Table */}
        <div className="hidden md:block">
          <table className="min-w-full table-auto border-collapse border border-gray-300">
            <thead>
              <tr className="text-lg bg-gray-100">
                <th className="px-4 py-2 border-b text-left">Application</th>
                <th className="px-4 py-2 border-b text-left">Lots</th>
                <th className="px-4 py-2 border-b text-left">Shares</th>
                <th className="px-4 py-2 border-b text-left">Amount</th>
                <th className="px-4 py-2 border-b text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {ipoDetails.financialLotsize.map((lot, index) => (
                <tr key={index}>
                  <td className="px-4 py-2 border-b">{lot.application}</td>
                  <td className="px-4 py-2 border-b">{lot.lots}</td>
                  <td className="px-4 py-2 border-b">{lot.shares}</td>
                  <td className="px-4 py-2 border-b">₹{lot.amount}</td>
                  <td className="px-4 py-2 border-b">
                    <button
                      onClick={() => handleApplyClick(lot)} // Pass the lot data to the handler
                      className="bg-black text-white rounded-md px-8 py-2 hover:bg-gray-800"
                    >
                      Apply
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Mobile Cards */}
        <div className="md:hidden space-y-4">
          {ipoDetails.financialLotsize.map((lot, index) => (
            <div
              key={index}
              className="flex flex-col gap-4 bg-gray-100 p-3 rounded-md shadow-md"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold">Application: {lot.application}</h2>
                <span className="text-sm">₹{lot.amount}</span>
              </div>
              <p className="text-sm">
                <strong>Lots:</strong> {lot.lots}
              </p>
              <p className="text-sm">
                <strong>Shares:</strong> {lot.shares}
              </p>
              <div className="mt-4">
                <button
                  onClick={() => handleApplyClick(lot)}
                  className="w-full bg-black text-white rounded-md py-2 px-4 text-center font-medium hover:bg-gray-800"
                >
                  Apply Now 🚀
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default ApplyIpo;
