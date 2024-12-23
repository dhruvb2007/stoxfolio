import React, { useState, useEffect } from 'react';
import axios from 'axios';
import IpoCard from '../Components/IpoCard';

function Ipo() {
  const [statusFilter, setStatusFilter] = useState('live'); // Default filter is 'live'
  const [searchQuery, setSearchQuery] = useState(''); // State for search query
  const [searchResults, setSearchResults] = useState([]); // State for search results
  const [ipoData, setIpoData] = useState([]); // State for all IPO data
  const [isLoading, setIsLoading] = useState(true); // Track loading state
  const [debounceTimeout, setDebounceTimeout] = useState(null); // Timeout for debounce

  // Check if data exists in sessionStorage
  useEffect(() => {
    const cachedData = sessionStorage.getItem('ipoData'); // Retrieve data from sessionStorage
    if (cachedData) {
      setIpoData(JSON.parse(cachedData)); // If data exists, use it
      setIsLoading(false); // Mark loading as complete
    } else {
      fetchIpoData(); // If no data in sessionStorage, fetch it
    }
  }, []);

  // Fetch IPO data
  const fetchIpoData = async () => {
    try {
      const response = await axios.post('http://localhost:5000/get-ipo-data');
      const data = response.data.data.MainLineIpo || [];
      setIpoData(data); // Set IPO data
      sessionStorage.setItem('ipoData', JSON.stringify(data)); // Store data in sessionStorage
      setIsLoading(false); // Mark loading as complete
    } catch (error) {
      console.error('Error fetching IPO data:', error);
      setIsLoading(false);
    }
  };

  // Handle status filter change
  const handleButtonClick = (status) => {
    setStatusFilter(status);
    setSearchQuery(''); // Clear search query when filter is changed
    setSearchResults([]); // Clear search results when filter is changed
  };

  // Handle search input change with debounce
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    
    // Clear previous debounce timeout
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    // Set new debounce timeout
    const timeout = setTimeout(() => {
      const filteredResults = ipoData.filter(ipo =>
        ipo.companyName.toLowerCase().includes(e.target.value.toLowerCase())
      );
      setSearchResults(filteredResults);
    }, 500); // 500ms delay

    setDebounceTimeout(timeout);
  };

  // Filter IPOs based on selected status filter
  const filteredIpos = ipoData.filter(ipo => ipo.IPOStatus.toLowerCase() === statusFilter.toLowerCase());
  const topIpos = filteredIpos.slice(0, 10);

  if (isLoading) return <p>Loading...</p>;

  return (
    <main>
      <section>
        <div className='flex gap-4'>
          <input
            type="text"
            className='bg-[#DCDCDC] rounded-md py-2 md:py-4 px-4 outline-none w-[80%]'
            placeholder='Search IPO'
            value={searchQuery}
            onChange={handleSearchChange} // Real-time search with debounce
          />
          <button
            className='bg-black text-white rounded-md w-[20%] md:w-[10%] py-2 md:py-4 flex items-center justify-center'
            onClick={() => {}}
          >
            <span className='material-symbols-rounded'>search</span>
          </button>
        </div>
      </section>
      <section>
        <div className='flex gap-2 md:gap-4 justify-between md:justify-start'>
          <button
            className={`w-1/3 md:w-[15%] mt-4 rounded-md py-1 ${statusFilter === 'live' ? 'bg-black text-white' : 'bg-[#D9D9D9] text-black'}`}
            onClick={() => handleButtonClick('live')}
          >
            Mainboard
          </button>
          <button
            className={`w-1/3 md:w-[15%] mt-4  rounded-md py-1 ${statusFilter === 'upcoming' ? 'bg-black text-white' : 'bg-[#D9D9D9] text-black'}`}
            onClick={() => handleButtonClick('upcoming')}
          >
            Upcoming
          </button>
          <button
            className={`w-1/3 md:w-[15%] mt-4 rounded-md py-1 ${statusFilter === 'listed' ? 'bg-black text-white' : 'bg-[#D9D9D9] text-black'}`}
            onClick={() => handleButtonClick('listed')}
          >
            Listed
          </button>
        </div>
      </section>

      <section className='mt-4 gap-2 flex flex-col'>
        {searchResults.length > 0
          ? <IpoCard ipoData={searchResults} />
          : (searchQuery === '' ? <IpoCard ipoData={topIpos} /> : <IpoCard ipoData={[]} />)
        }
      </section>
    </main>
  );
}

export default Ipo;
