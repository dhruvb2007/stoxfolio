// SelectAccountCard Component
import React, { useState } from 'react';
import useFetchAccounts from '../useFetchAccounts';
import { useAuth } from '../auth-context'; // Assuming you're using a context for authentication

function SelectAccountCard({ onClose, onSelectAccount }) {
    const { user, selectedAccounts, setSelectedAccounts } = useAuth(); // Get the selected account from context
    const { accounts, loading } = useFetchAccounts(); // Get accounts and loading state from the custom hook
    const [isModified, setIsModified] = useState(false); // Track if account selection is changed

    const handleAccountSelection = (accountName) => {
        if (isModified) return; // Prevent changes after modification

        setSelectedAccounts((prevSelectedAccounts) => {
            const updatedSelectedAccounts = prevSelectedAccounts.includes(accountName)
                ? prevSelectedAccounts.filter(account => account !== accountName)
                : [...prevSelectedAccounts, accountName];
            onSelectAccount(updatedSelectedAccounts); // Pass selected accounts to parent
            return updatedSelectedAccounts;
        });
    };

    const handleSelectAll = () => {
        if (isModified) return; // Prevent changes after modification

        if (selectedAccounts.length === accounts.length) {
            setSelectedAccounts([]); // Deselect all
        } else {
            setSelectedAccounts(accounts); // Select all accounts
        }
    };

    const handleModifySelection = () => {
        setIsModified(true); // Lock the selection after modification
    };

    if (loading) return <div>Loading accounts...</div>; // Show loading indicator while fetching accounts

    return (
        <div className="fixed top-0 left-0 right-0 bottom-0 flex justify-center items-center z-50 bg-gray-900 bg-opacity-50">
            <div className="bg-white w-[90%] md:w-[50%] p-6 rounded-md shadow-lg">
                <h2 className="text-2xl font-bold">Select Account</h2>
                <div className="flex items-center my-4">
                    <input
                        type="checkbox"
                        checked={selectedAccounts.length === accounts.length}
                        onChange={handleSelectAll}
                        id="selectAll"
                        disabled={isModified} // Disable select all after modification
                    />
                    <label htmlFor="selectAll" className="ml-2">Select All</label>
                </div>
                {accounts.map((account) => (
                    <div key={account} className='flex items-center justify-between my-2'>
                        <h1>{account}</h1>
                        <input
                            type="checkbox"
                            className='hidden'
                            checked={selectedAccounts.includes(account)}
                            onChange={() => handleAccountSelection(account)}
                            id={`account-${account}`}
                            disabled={isModified} // Disable individual selection after modification
                        />
                        <label
                            htmlFor={`account-${account}`}
                            className={`w-4 h-4 rounded-full cursor-pointer inline-block transition-colors duration-300 ${selectedAccounts.includes(account) ? 'bg-black' : 'bg-[#AFAFAF]'}`}
                        />
                    </div>
                ))}
                <div className="flex justify-end mt-4">
                    <button
                        className="bg-black text-white px-10 rounded py-1"
                        onClick={() => { handleModifySelection(); onClose(); }}
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SelectAccountCard;
