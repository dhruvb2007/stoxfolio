import React, { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../auth-context';

function AppliedCard() {
  const [appliedData, setAppliedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, selectedAccounts } = useAuth();

  useEffect(() => {
    const fetchAppliedIPOs = async () => {
      setLoading(true);
      try {
        if (!user || selectedAccounts.length === 0) {
          console.warn('User not logged in or no accounts selected.');
          setLoading(false);
          return;
        }

        const db = getFirestore();
        const userId = user.uid;
        const appliedIPOs = [];

        for (const accountName of selectedAccounts) {
          const appliedRef = collection(db, 'Users', userId, 'Accounts', accountName, 'Applied');
          const appliedSnapshot = await getDocs(appliedRef);

          appliedSnapshot.forEach((doc) => {
            appliedIPOs.push({
              accountName,
              id: doc.id,
              ...doc.data(),
            });
          });
        }

        setAppliedData(appliedIPOs);
      } catch (error) {
        console.error('Error fetching applied IPOs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppliedIPOs();
  }, [user, selectedAccounts]);

  const handleAllotted = async (ipo) => {
    try {
      const db = getFirestore();
      const userId = user.uid;
      const { accountName, id, stock_name, quantity, buy_price, ipo_slug, invested_amount } = ipo;
  
      // Custom data for Holding
      const holdingData = {
        stock_name,
        quantity,
        buy_price,
        invested_amount,
        ipo_slug,
        status: 'Holding', 
      };
  
      // Add to Holding
      const holdingRef = collection(db, 'Users', userId, 'Accounts', accountName, 'Holdings');
      await addDoc(holdingRef, holdingData);
  
      // Remove from Applied
      const appliedDocRef = doc(db, 'Users', userId, 'Accounts', accountName, 'Applied', id);
      await deleteDoc(appliedDocRef);

      const basicsRef = collection(db, 'Users', userId, 'Accounts', accountName, 'Basics');
      const basicsSnapshot = await getDocs(basicsRef);
  
      if (!basicsSnapshot.empty) {
        const basicsDoc = basicsSnapshot.docs[0];  // Assuming there's at least one document
        const allottedIpo = basicsDoc.data().total_allotted_ipo;
        const updateAllottedIpo = allottedIpo + 1;

  
        // Update Basics with the new invested_amount
        await updateDoc(basicsDoc.ref, { total_allotted_ipo: updateAllottedIpo });
      }
  
      // Update UI
      setAppliedData((prevData) => prevData.filter((item) => item.id !== id));
    } catch (error) {
      console.error('Error handling allotted IPO:', error);
    }
  };
  
  const handleNotAllotted = async (ipo) => {
    try {
      const db = getFirestore();
      const userId = user.uid;
      const { accountName, id, stock_name, quantity, invested_amount, buy_price, ipo_slug } = ipo;
  
      // Custom data for Completed
      const completedData = {
        stock_name,
        quantity,
        invested_amount,
        buy_price,
        ipo_slug,
        result: 'Not Allotted',
      };
  
      // Add to Completed
      const completedRef = collection(db, 'Users', userId, 'Accounts', accountName, 'Completed');
      await addDoc(completedRef, completedData);
  
      // Remove from Applied
      const appliedDocRef = doc(db, 'Users', userId, 'Accounts', accountName, 'Applied', id);
      await deleteDoc(appliedDocRef);
  
      // Retrieve the first document from the Basics collection
      const basicsRef = collection(db, 'Users', userId, 'Accounts', accountName, 'Basics');
      const basicsSnapshot = await getDocs(basicsRef);
  
      if (!basicsSnapshot.empty) {
        const basicsDoc = basicsSnapshot.docs[0];  // Assuming there's at least one document
        const currentInvestedAmount = basicsDoc.data().total_investment || 0;
        const updatedInvestedAmount = currentInvestedAmount - invested_amount;
        const currentPending = basicsDoc.data().pending;
        const updatePending = currentPending - 1;
        const allottedIpo = basicsDoc
  
        // Update Basics with the new invested_amount
        await updateDoc(basicsDoc.ref, { total_investment: updatedInvestedAmount, pending:updatePending });
      }
  
      // Update UI
      setAppliedData((prevData) => prevData.filter((item) => item.id !== id));
    } catch (error) {
      console.error('Error handling not allotted IPO:', error);
    }
  };

  if (appliedData.length === 0) {
    return (
      <div className='flex w-full justify-center'>
        <img src="/a_minimalist_vector_illustration_of_no_ipo-removebg-preview.png" />
      </div>    
    );
  }

  return (
    <div>
  {appliedData.map((ipo) => (
    <section 
      key={ipo.id} 
      className="flex flex-col md:flex-row gap-6 bg-[#EBEBEB] p-4 rounded-md mb-4"
    >
      {/* Mobile & PC: stock_name and accountName */}
      <div className="text-lg md:text-2xl font-medium w-full md:w-1/3 flex flex-col gap-2 px-2">
        <h1>{ipo.stock_name}</h1>
        <h2 className="text-gray-600">{ipo.accountName}</h2>
      </div>

      {/* Mobile UI: Remaining details and buttons */}
      <div className="w-full md:w-2/3 px-2 md:hidden flex justify-between">
        <div>
          <p>Buy Price: {ipo.buy_price}</p>
          <p>Quantity: {ipo.quantity}</p>
          <p>Invested Amount: {ipo.invested_amount}</p>
        </div>
        <div className="flex flex-col items-center justify-center gap-2">
          <button
            onClick={() => handleAllotted(ipo)}
            className="bg-[#0D9800] text-white flex items-center justify-center text-md w-[80%] rounded-xl py-1 px-6"
          >
            Allotted
          </button>
          <button
            onClick={() => handleNotAllotted(ipo)}
            className="bg-[#EB3636] text-white flex items-center justify-center text-md w-[80%] rounded-xl py-1 px-6"
          >
            Not Allotted
          </button>
        </div>
      </div>

      {/* PC UI: Remaining details */}
      <div className="hidden md:block w-1/3 px-10">
        <p><strong>Buy Price:</strong> {ipo.buy_price}</p>
        <p><strong>Quantity:</strong> {ipo.quantity}</p>
        <p><strong>Invested Amount:</strong> {ipo.invested_amount}</p>
      </div>

      {/* PC UI: Buttons */}
      <div className="hidden md:flex w-1/3 flex-col items-center justify-center gap-2">
        <button
          onClick={() => handleAllotted(ipo)}
          className="bg-[#0D9800] text-white text-lg w-[40%] rounded-xl py-2 px-8"
        >
          Allotted
        </button>
        <button
          onClick={() => handleNotAllotted(ipo)}
          className="bg-[#EB3636] text-white text-lg w-[40%] rounded-xl py-2 px-8"
        >
          Not Allotted
        </button>
      </div>
    </section>
  ))}
</div>

  );
}

export default AppliedCard;
