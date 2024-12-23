import React, { useState } from 'react';
import { useAuth } from '../auth-context';
import { useFetchAccounts } from '../useFetchAccounts';
import { db } from '../firebase';
import { setDoc, doc, collection, deleteDoc } from 'firebase/firestore';

function Accounts() {
  const { user, setSelectedAccounts } = useAuth();
  const { accounts, loading, refetchAccounts } = useFetchAccounts(); // Added refetch for real-time updates
  const [showModal, setShowModal] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        // User signed out successfully
      })
      .catch((error) => {
        console.error('Error signing out: ', error);
      });
  };

  const handleCreateAccount = async () => {
    if (newAccountName.trim() !== '') {
      try {
        const accountRef = collection(db, 'Users', user.uid, 'Accounts');
        const newAccountDoc = doc(accountRef, newAccountName);

        await setDoc(newAccountDoc, { account_name: newAccountName });

        const basicsRef = collection(newAccountDoc, 'Basics');
        await setDoc(doc(basicsRef), {
          total_investment: 0,
          total_returns: 0,
          total_allotted_ipo: 0,
          pending: 0,
        });

        setNewAccountName('');
        setShowModal(false);
        refetchAccounts(); // Refresh accounts list
      } catch (error) {
        console.error('Error adding account: ', error);
      }
    }
  };

  const handleDeleteAccount = async () => {
    if (accountToDelete) {
      try {
        const accountRef = doc(db, 'Users', user.uid, 'Accounts', accountToDelete);
        await deleteDoc(accountRef);
        setAccountToDelete(null);
        setShowDeleteModal(false);
        refetchAccounts(); // Refresh accounts list
      } catch (error) {
        console.error('Error deleting account:', error);
      }
    }
  };

  return (
<main className="p-4">
  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center font-medium mt-2 gap-2">
    <p className="text-lg text-center sm:text-left">{user ? user.email : 'Loading...'}</p>
    <button
      onClick={handleSignOut}
      className="bg-red-500 text-white py-1 px-6 rounded-3xl w-full sm:w-auto"
    >
      Sign Out
    </button>
  </div>

  <div className="flex flex-col md:flex-row mt-6">
    <div className="w-full md:w-1/3 py-4">
      <h1 className="text-3xl md:text-4xl font-semibold text-center md:text-left">Your Profiles</h1>
    </div>
    <div className="py-3 w-full md:w-[55%]">
      {loading ? (
        <p className="text-center">Loading profiles...</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 mt-4">
          {accounts.map((account, index) => (
            <div
              key={index}
              className="bg-slate-300 w-[8rem] h-[8rem] md:w-[10rem] md:h-[10rem] rounded-full flex items-center font-medium justify-center relative mx-auto"
            >
              <h1 className="text-center max-w-[6rem] break-words">{account}</h1>
              <button
                onClick={() => {
                  setAccountToDelete(account);
                  setShowDeleteModal(true);
                }}
                className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center"
              >
                <span className="material-symbols-rounded text-sm">close</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>

  <div className="p-4 w-full flex justify-center sm:justify-end">
    <button
      onClick={() => setShowModal(true)}
      className="bg-black text-white py-2 px-8 flex items-center justify-center rounded-2xl"
    >
      <span className="material-symbols-rounded text-2xl font-thin">person_add</span>
    </button>
  </div>

  {/* Modal for creating new account */}
  {showModal && (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 p-4">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-4 text-center">Create New Account</h2>
        <input
          type="text"
          value={newAccountName}
          onChange={(e) => setNewAccountName(e.target.value)}
          placeholder="Enter account name"
          className="w-full p-2 mb-4 border rounded"
        />
        <div className="flex justify-between">
          <button
            onClick={() => setShowModal(false)}
            className="bg-gray-500 text-white py-1 px-4 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateAccount}
            className="bg-black text-white py-1 px-4 rounded"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  )}

  {/* Modal for confirming delete */}
  {showDeleteModal && (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 p-4">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-center">Delete Account</h2>
        <p className="text-center">
          Are you sure you want to delete the account "{accountToDelete}"?
        </p>
        <div className="flex justify-between mt-4">
          <button
            onClick={() => setShowDeleteModal(false)}
            className="bg-gray-500 text-white py-1 px-4 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteAccount}
            className="bg-red-500 text-white py-1 px-4 rounded"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )}
</main>

  );
}

export default Accounts;
