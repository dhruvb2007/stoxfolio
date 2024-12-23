import React, { useEffect, useState } from 'react';
import { db, collection, getDocs, query, doc, updateDoc, deleteDoc, addDoc } from '../firebase';
import { useAuth } from '../auth-context';
import axios from 'axios';

function HoldingCard({ userId, accountName }) {
  const [holdings, setHoldings] = useState([]);
  const { user, selectedAccounts } = useAuth();
  const [gmpData, setGmpData] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [selectedHolding, setSelectedHolding] = useState(null);
  const [sellDetails, setSellDetails] = useState({ quantity: '', sellPrice: '' });

  const fetchGmpData = async (slug) => {
    try {
      const response = await axios.post(`http://localhost:5000/get-ipo-data/${slug}`);
      setGmpData(prevData => ({ ...prevData, [slug]: response.data.Data.GMP }));
    } catch (error) {
      console.error('Error fetching GMP data:', error);
    }
  };

  useEffect(() => {
    if (user && selectedAccounts && Array.isArray(selectedAccounts) && selectedAccounts.length > 0) {
      const fetchHoldings = async () => {
        const holdingsRef = collection(db, 'Users', user.uid, 'Accounts', accountName, 'Holdings');
        const q = query(holdingsRef);
        const querySnapshot = await getDocs(q);
        const fetchedHoldings = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        setHoldings(fetchedHoldings);

        fetchedHoldings.forEach(holding => {
          if (holding.ipo_slug) {
            fetchGmpData(holding.ipo_slug);
          }
        });
      };

      fetchHoldings();
    } else {
      console.error("selectedAccounts is not a valid array or is empty", selectedAccounts);
    }
  }, [user, selectedAccounts, accountName]);

  const handleSellClick = (holding) => {
    setSelectedHolding(holding);
    setShowModal(true);
  };

  const handleSell = async () => {
    if (!selectedHolding || !sellDetails.quantity || !sellDetails.sellPrice) {
      alert('Please enter valid sell details.');
      return;
    }
  
    const quantityToSell = parseInt(sellDetails.quantity);
    const sellPrice = parseFloat(sellDetails.sellPrice);
  
    if (quantityToSell > selectedHolding.quantity) {
      alert('Sell quantity cannot be greater than available quantity.');
      return;
    }
  
    const remainingQuantity = selectedHolding.quantity - quantityToSell;
    const investedAmount = selectedHolding.buy_price * quantityToSell;
    const netProfitLoss = quantityToSell * (sellPrice - selectedHolding.buy_price);
  
    const completedRef = collection(db, 'Users', user.uid, 'Accounts', accountName, 'Completed');
  
    try {
      // Add to Completed collection
      await addDoc(completedRef, {
        stock_name: selectedHolding.stock_name,
        quantity: quantityToSell,
        buy_price: selectedHolding.buy_price,
        invested_amount: investedAmount,
        sell: sellPrice * quantityToSell,
        net_p_l_return: netProfitLoss,
        ipo_slug: selectedHolding.ipo_slug,
      });
  
      const holdingRef = doc(db, 'Users', user.uid, 'Accounts', accountName, 'Holdings', selectedHolding.id);
  
      if (remainingQuantity > 0) {
        // Update the Holdings collection with remaining quantity
        await updateDoc(holdingRef, {
          quantity: remainingQuantity,
          invested_amount: remainingQuantity * selectedHolding.buy_price,
        });
      } else {
        // Remove the holding if fully sold
        await deleteDoc(holdingRef);
      }
  
      // Fetch the Basics document (assuming it's the only one in the subcollection)
      const basicsQuerySnapshot = await getDocs(collection(db, 'Users', user.uid, 'Accounts', accountName, 'Basics'));
      if (!basicsQuerySnapshot.empty) {
        const basicsDoc = basicsQuerySnapshot.docs[0]; // Assuming there's only one document in Basics
        const basicsData = basicsDoc.data();
  
        // Calculate updated total returns
        const previousTotalReturns = basicsData?.total_returns || 0;
        const updatedTotalReturns = previousTotalReturns + ((quantityToSell * sellPrice) - investedAmount);
  
        // Update pending count
        const previousPending = basicsData?.pending || 0;
        const updatedPending = Math.max(previousPending - 1, 0); // Ensure pending doesn't go below 0
  
        // Update the Basics document with new values
        await updateDoc(basicsDoc.ref, {
          total_returns: updatedTotalReturns,
          pending: updatedPending,
        });
      } else {
        console.error('No Basics document found for the account.');
      }
  
      // Refresh holdings
      setHoldings(prevHoldings => 
        prevHoldings.map(h => 
          h.id === selectedHolding.id 
            ? { ...h, quantity: remainingQuantity } 
            : h
        ).filter(h => h.quantity > 0)
      );
  
      setShowModal(false);
      setSellDetails({ quantity: '', sellPrice: '' });
      setSelectedHolding(null);
    } catch (error) {
      console.error('Error during sell operation:', error);
    }
  };  
  
  if (!user) {
    return <p>Please log in to view holdings.</p>;
  }

  return (
    <section className="rounded-md">
      {holdings.length === 0 ? (
        <div className='flex w-full justify-center'>
          <img src="/a_minimalist_vector_illustration_of_no_holdings-removebg-preview.png" />
        </div>
      ) : (
        holdings.map((holding, index) => (
        <div key={index} className="flex flex-col md:flex-row gap-6 bg-[#EBEBEB] p-2 md:p-4 rounded-md mb-4">
          {/* Mobile & PC: stock_name and accountName */}
          <div className="text-lg md:text-2xl font-medium w-full md:w-1/3 flex flex-col gap-2 px-4">
            <h1>{holding.stock_name}</h1>
            <h2 className="text-gray-600">{accountName}</h2>
          </div>

          {/* Mobile UI: Remaining details, GMP, and SELL button */}
          <div className="w-full md:w-2/3 px-4 md:hidden flex justify-between">
            <div>
              <p>Buy Price: {holding.buy_price}</p>
              <p>Quantity: {holding.quantity}</p>
              <p>Invested Amount: {holding.invested_amount}</p>
            </div>
            <div className='flex flex-col items-center justify-center'>
              <h1 className="text-lg font-medium">GMP: {gmpData[holding.ipo_slug] || 'Loading...'}</h1>
              <button
                className="bg-[#EB3636] text-white text-lg w-[80%] flex items-center justify-center rounded-xl py-1 px-6"
                onClick={() => handleSellClick(holding)}
              >
                SELL
              </button>
            </div>
          </div>

          {/* PC UI: Remaining details */}
          <div className="hidden md:block w-1/3 px-10">
            <p><strong>Buy Price:</strong> {holding.buy_price}</p>
            <p><strong>Quantity:</strong> {holding.quantity}</p>
            <p><strong>Invested Amount:</strong> {holding.invested_amount}</p>
          </div>

          {/* PC UI: GMP and SELL button */}
          <div className="hidden md:flex w-1/3 flex-col items-center justify-center gap-2">
            <h1 className="text-2xl font-medium">GMP: {gmpData[holding.ipo_slug] || 'Loading...'}</h1>
            <button
              className="bg-[#EB3636] text-white text-xl w-[40%] rounded-xl py-2 px-8"
              onClick={() => handleSellClick(holding)}
            >
              SELL
            </button>
          </div>
        </div>
        ))
      )}

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-md w-[90%] md:w-1/3">
            <h2 className="text-xl font-medium mb-4">Sell {selectedHolding?.stock_name}</h2>
            <div className="flex flex-col gap-4">
              <input
                type="number"
                placeholder="Quantity to Sell"
                value={sellDetails.quantity}
                onChange={(e) => setSellDetails({ ...sellDetails, quantity: e.target.value })}
                className="border p-2 rounded-md"
              />
              <input
                type="number"
                placeholder="Sell Price per Share"
                value={sellDetails.sellPrice}
                onChange={(e) => setSellDetails({ ...sellDetails, sellPrice: e.target.value })}
                className="border p-2 rounded-md"
              />
              <button 
                onClick={handleSell}
                className="bg-black text-white p-2 rounded-md"
              >
                Confirm Sell
              </button>
              <button 
                onClick={() => setShowModal(false)}
                className="bg-red-500 text-white p-2 rounded-md"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default HoldingCard;
