import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function ViewIpo() {
  const { slug } = useParams();  // Extract slug from the URL params
  const [ipoDetails, setIpoDetails] = useState(null);
  const [error, setError] = useState(null);  // Add state for error handling
  const navigate = useNavigate();  // Hook to navigate back

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

  return (
    <main>
      <button
        onClick={() => navigate(-1)}  // Navigate back
        className="bg-black text-white py-1 px-4 rounded-md mt-2 material-symbols-rounded"
      >
        keyboard_backspace
      </button>
     
      <div className="flex mt-6">
        <div className="w-1/3 px-6">
          <h1 className="text-4xl font-medium">{ipoDetails.companyName}</h1>
        </div>
        <div className="w-2/3 px-32">
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
      <div className="container mx-auto px-4 py-6 mt-6">
        <table className="min-w-full table-auto border-collapse border border-gray-300">
          <thead>
            <tr className="text-lg">
              <th className="px-4 py-2 border-b text-left">Application</th>
              <th className="px-4 py-2 border-b text-left">Lots</th>
              <th className="px-4 py-2 border-b text-left">Shares</th>
              <th className="px-4 py-2 border-b text-left">Amount</th>
            </tr>
          </thead>
          <tbody>
            {ipoDetails.financialLotsize.map((lot, index) => (
              <tr key={index}>
                <td className="px-4 py-2 border-b">{lot.application}</td>
                <td className="px-4 py-2 border-b">{lot.lots}</td>
                <td className="px-4 py-2 border-b">{lot.shares}</td>
                <td className="px-4 py-2 border-b">₹{lot.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

export default ViewIpo;
