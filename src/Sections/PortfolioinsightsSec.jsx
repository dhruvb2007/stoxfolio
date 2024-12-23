import React, { useState } from 'react';
import HoldingCard from '../Components/HoldingCard';
import AppliedCard from '../Components/AppliedCard';
import CompletedCard from '../Components/CompletedCard';
import { useAuth } from '../auth-context'

function PortfolioinsightsSec() {
  const [activeButton, setActiveButton] = useState('Holding');
  const { selectedAccounts } = useAuth(); // Assuming `useAuth` provides `selectedAccounts`

  return (
    <section>
      <h1 className='text-xl md:text-2xl font-medium text-[#363636]'>Portfolio Insights</h1>
      <div className='flex gap-4 sm:w-full justify-between md:justify-start'>
        <button
          className={`w-1/3 md:w-[15%] mt-4 rounded-md py-1 ${
            activeButton === 'Holding' ? 'bg-black text-white' : 'bg-[#D9D9D9] text-black'
          }`}
          onClick={() => setActiveButton('Holding')}
        >
          Holding
        </button>
        <button
          className={`w-1/3 md:w-[15%] mt-4 rounded-md py-1 ${
            activeButton === 'Applied' ? 'bg-black text-white' : 'bg-[#D9D9D9] text-black'
          }`}
          onClick={() => setActiveButton('Applied')}
        >
          Applied
        </button>
        <button
          className={`w-1/3 md:w-[15%] mt-4 rounded-md py-1 ${
            activeButton === 'Completed' ? 'bg-black text-white' : 'bg-[#D9D9D9] text-black'
          }`}
          onClick={() => setActiveButton('Completed')}
        >
          Completed
        </button>
      </div>
      <div className='mt-6'>
        {activeButton === 'Holding' && selectedAccounts.map((accountName, index) => (
          <HoldingCard key={index} accountName={accountName} />
        ))}
        {activeButton === 'Applied' && <AppliedCard />}
        {activeButton === 'Completed' && selectedAccounts.map((accountName, index) => (
          <CompletedCard key={index} accountName={accountName} />
        ))}
      </div>
    </section>
  );
}

export default PortfolioinsightsSec;
