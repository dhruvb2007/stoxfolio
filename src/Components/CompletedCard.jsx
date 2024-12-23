import React, { useEffect, useState } from 'react';
import { db, collection, getDocs, query } from '../firebase'; // import Firestore functions
import { useAuth } from '../auth-context';

function CompletedCard({ accountName }) {
  const [completedHoldings, setCompletedHoldings] = useState([]);
  const { user, selectedAccounts } = useAuth();

  useEffect(() => {
    if (user && selectedAccounts && Array.isArray(selectedAccounts) && selectedAccounts.length > 0) {
      // Fetch completed holdings for the specific account
      const fetchCompletedHoldings = async () => {
        const completedRef = collection(db, 'Users', user.uid, 'Accounts', accountName, 'Completed');
        const q = query(completedRef);
        const querySnapshot = await getDocs(q);
        const fetchedCompletedHoldings = querySnapshot.docs.map(doc => doc.data());
        setCompletedHoldings(fetchedCompletedHoldings);
      };

      fetchCompletedHoldings();
    } else {
      console.error("selectedAccounts is not a valid array or is empty", selectedAccounts);
    }
  }, [user, selectedAccounts, accountName]); // Re-fetch when user, selectedAccounts, or accountName changes

  // Ensure the user is logged in before rendering
  if (!user) {
    return <p>Please log in to view completed holdings.</p>;
  }

  return (
    <section>
      {completedHoldings.length === 0 ? (
        <div className='flex w-full justify-center'>
          <img src="/a_minimalist_vector_illustration_of_no_completed-removebg-preview.png" />
        </div>
      ) : (
        completedHoldings.map((holding, index) => (
          <div key={index} className="flex flex-col md:flex-row gap-6 bg-[#EBEBEB] p-4 rounded-md mb-4">
            {/* Mobile & PC: IPO Name and Account Name */}
            <div className="text-lg md:text-2xl font-medium w-full md:w-1/3 flex flex-col gap-2 px-2">
              <h1>{holding.stock_name}</h1>
              <h2 className="text-gray-500">{accountName}</h2>
            </div>

            {/* Mobile UI: Middle and Right Columns Combined */}
            <div className="w-full md:hidden px-2 flex justify-between">
              <div className='w-full'>
                <p>Buy Price: {holding.buy_price}</p>
                <p>Quantity: {holding.quantity}</p>
                <p>Invested: {holding.invested_amount}</p>
                {holding.result !== "Not Allotted" && <p>Sell Price: {holding.sell}</p>}
                {holding.result !== "Not Allotted" && <p>Net P/L Return: {holding.net_p_l_return}</p>}
              </div>
              <div className="flex flex-col items-end w-fit justify-center px-4">
                {holding.result !== "Not Allotted" ? (
                  <h1 className="bg-[#2e2e2e] text-white text-md  rounded-xl py-1 px-4">
                    Net P/L Return: {holding.net_p_l_return}
                  </h1>
                ) : (
                  <h1 className="bg-[#EB3636] text-white flex items-center justify-center text-md w-[80%] rounded-xl py-2 px-4">
                    {holding.result}
                  </h1>
                )}
              </div>
            </div>

            {/* PC UI: Middle Column */}
            <div className="hidden md:block w-1/3 px-10">
              <p><strong>Buy Price:</strong> {holding.buy_price}</p>
              <p><strong>Quantity:</strong> {holding.quantity}</p>
              <p><strong>Invested:</strong> {holding.invested_amount}</p>
              {holding.result !== "Not Allotted" && <p><strong>Sell Price:</strong> {holding.sell}</p>}
              {holding.result !== "Not Allotted" && <p><strong>Net P/L Return:</strong> {holding.net_p_l_return}</p>}
            </div>

            {/* PC UI: Right Column */}
            <div className="hidden md:flex w-1/3 flex-col items-center justify-center gap-2">
              {holding.result !== "Not Allotted" ? (
                <h1 className="bg-[#2e2e2e] text-white text-xl w-[40%] rounded-xl py-2 px-8">
                  Net P/L Return: {holding.net_p_l_return}
                </h1>
              ) : (
                <h1 className="bg-[#EB3636] text-white text-xl w-[40%] rounded-xl py-2 px-8">
                  {holding.result}
                </h1>
              )}
            </div>
          </div>

        ))
      )}
    </section>
  );
}

export default CompletedCard;
