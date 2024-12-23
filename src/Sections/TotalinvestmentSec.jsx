import React from 'react';

const TotalinvestmentSec = ({ items }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {items.map((item, index) => (
        <div
          key={index}
          className="bg-[#EBEBEB] rounded-lg md:px-4 overflow-hidden transition-shadow duration-300"
        >
          <div className="p-4">
            <h3 className="text-md font-medium">{item.title}</h3>
            <p className="mt-4 font-semibold text-4xl">
              {index === 2 ? `${item.amount}` : `${item.amount} ₹`}
            </p>
            {index !== 0 && (
              <p className="text-md mt-4 font-medium">
                {index === 1 ? `Returns ${item.returns}%` : `Pending ${item.pending}`}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TotalinvestmentSec;
