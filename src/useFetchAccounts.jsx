import { useState, useEffect, useCallback } from 'react';
import { db } from './firebase'; // Firebase Firestore
import { getDocs, collection } from 'firebase/firestore';
import { useAuth } from './auth-context'; // useAuth hook

const useFetchAccounts = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Define fetchAccounts as a reusable function
  const fetchAccounts = useCallback(async () => {
    if (user) {
      try {
        const accountsRef = collection(db, 'Users', user.uid, 'Accounts');
        const accountSnapshot = await getDocs(accountsRef);
        const accountsList = accountSnapshot.docs.map(doc => doc.data().account_name);
        setAccounts(accountsList);
      } catch (error) {
        console.error('Error fetching accounts:', error);
      } finally {
        setLoading(false);
      }
    }
  }, [user]);

  // Refetch accounts function
  const refetchAccounts = () => {
    setLoading(true);
    fetchAccounts();
  };

  // Fetch accounts on initial load
  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  return { accounts, loading, refetchAccounts };
};

export default useFetchAccounts;
export { useFetchAccounts };
