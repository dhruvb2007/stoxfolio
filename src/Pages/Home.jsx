import React, { useEffect, useState, useMemo } from 'react';
import { db, collection, onSnapshot } from '../firebase';
import TotalinvestmentSec from '../Sections/TotalinvestmentSec';
import PortfolioinsightsSec from '../Sections/PortfolioinsightsSec';
import { useAuth } from '../auth-context';

function Home() {
  const { user } = useAuth();
  const { selectedAccounts } = useAuth();
  const [accountDetails, setAccountDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user || selectedAccounts.length === 0) {
      console.log('No accounts selected or user not authenticated.');
      setAccountDetails([]);
      return;
    }

    const unsubscribeListeners = [];

    const fetchAccountsDetails = async () => {
      setIsLoading(true);

      try {
        for (let accountName of selectedAccounts) {
          if (!accountName) continue;

          const basicsRef = collection(db, 'Users', user.uid, 'Accounts', accountName, 'Basics');

          const unsubscribe = onSnapshot(basicsRef, (snapshot) => {
            const updatedDetails = snapshot.docs.map((docSnapshot) => ({
              id: docSnapshot.id,
              ...docSnapshot.data(),
            }));

            setAccountDetails((prevDetails) => {
              // Merge updated details with existing state
              const filteredPrevDetails = prevDetails.filter(
                (detail) => !updatedDetails.some((updated) => updated.id === detail.id)
              );
              return [...filteredPrevDetails, ...updatedDetails];
            });
          });

          unsubscribeListeners.push(unsubscribe);
        }
      } catch (error) {
        console.error('Error setting up real-time listeners:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccountsDetails();

    return () => {
      unsubscribeListeners.forEach((unsubscribe) => unsubscribe());
    };
  }, [user, selectedAccounts]);

  const totalData = useMemo(() => {
    let totalInvestment = 0;
    let totalReturns = 0;
    let totalAllottedIpo = 0;
    let totalPending = 0;

    accountDetails.forEach((account) => {
      totalInvestment += account.total_investment || 0;
      totalReturns += account.total_returns || 0;
      totalAllottedIpo += account.total_allotted_ipo || 0;
      totalPending += account.pending || 0;
    });

    return {
      total_investment: totalInvestment,
      total_returns_amount: totalReturns,
      total_returns_percentage: totalInvestment
        ? ((totalReturns * 100) / totalInvestment).toFixed(2)
        : 0,
      total_allotted_ipo: totalAllottedIpo,
      total_pending: totalPending,
    };
  }, [accountDetails]);

  const sampleItems = useMemo(() => {
    return [
      { title: 'Total Investment', amount: totalData.total_investment },
      { title: 'Total Returns', amount: totalData.total_returns_amount, returns: totalData.total_returns_percentage },
      { title: 'Total Allotted IPO', amount: totalData.total_allotted_ipo, pending: totalData.total_pending },
    ];
  }, [totalData]);

  return (
    <main>
      <section>
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          accountDetails.length > 0 && <TotalinvestmentSec items={sampleItems} />
        )}
        <div className="mt-4">
          <PortfolioinsightsSec />
        </div>
      </section>
    </main>
  );
}

export default Home;
