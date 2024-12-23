import React from 'react';
import { Link } from 'react-router-dom';

function IpoCard({ ipoData }) {
  if (!ipoData || ipoData.length === 0) return <p>No IPO data found</p>;

  return (
    <>
      {ipoData.map((ipo, index) => (
        <section key={index} className="flex flex-col md:flex-row bg-[#ECECEC] p-4 md:p-6 justify-between items-start rounded-xl mb-2">
        {/* Mobile & PC: Logo and Company Name */}
        <div className="flex items-center gap-4 mb-4 md:mb-0 md:mr-6 md:w-1/3">
          <img
            src={ipo.file}
            alt={`${ipo.companyName} logo`}
            className="w-16 h-16 object-contain"
          />
          <h1 className="text-lg md:text-xl font-medium text-center mt-2 ">
            {ipo.companyName}
          </h1>
        </div>
      
        {/* Mobile UI: Offer Details */}
        <div className="w-full md:hidden mt-2 flex justify-between">
          <div>
            <p>Offer Date: {new Date(ipo.IPOOpenDate).toLocaleDateString()}</p>
            <p>
              GMP:{" "}
              {ipo.GMP != null
                ? `${ipo.GMP}₹ (${((ipo.GMP * 100) / ipo.toPrice).toFixed(2)}%)`
                : "-"}
            </p>
            <p>Status: {ipo.IPOStatus}</p>
            <p>
              Offer Price: ₹{ipo.fromPrice} - ₹{ipo.toPrice}
            </p>
          </div>
          <div className="ml-4">
            <Link
              className="bg-black text-white text-md py-2 px-4 rounded-xl flex items-center justify-center gap-2"
              to={
                ipo.IPOStatus.toLowerCase() === "live"
                  ? `/applyipo/${ipo.slug}`
                  : `/viewipo/${ipo.slug}`
              }
            >
              {ipo.IPOStatus.toLowerCase() === "live" ? "Apply" : "View"}
              <span className="material-symbols-rounded">arrow_outward</span>
            </Link>
          </div>
        </div>
      
        {/* PC UI: Offer Details */}
        <div className="hidden md:flex w-2/3 justify-between items-start">
          <div className="flex flex-col items-start">
            <p>Offer Date: {new Date(ipo.IPOOpenDate).toLocaleDateString()}</p>
            <p>
              GMP:{" "}
              {ipo.GMP != null
                ? `${ipo.GMP}₹ (${((ipo.GMP * 100) / ipo.toPrice).toFixed(2)}%)`
                : "-"}
            </p>
            <p>Status: {ipo.IPOStatus}</p>
            <p>
              Offer Price: ₹{ipo.fromPrice} - ₹{ipo.toPrice}
            </p>
          </div>
          <div className="ml-6">
            <Link
              className="bg-black text-white py-4 px-6 rounded-xl flex items-center justify-center gap-2"
              to={
                ipo.IPOStatus.toLowerCase() === "live"
                  ? `/applyipo/${ipo.slug}`
                  : `/viewipo/${ipo.slug}`
              }
            >
              {ipo.IPOStatus.toLowerCase() === "live" ? "Apply" : "View"}
              <span className="material-symbols-rounded">arrow_outward</span>
            </Link>
          </div>
        </div>
      </section>
      
      ))}
    </>
  );
}

export default IpoCard;
