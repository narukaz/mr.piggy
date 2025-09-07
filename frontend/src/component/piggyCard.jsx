import React from "react";

function PiggyCard({ name, imagePlaceholder, bullets }) {
  return (
    <div className="flex flex-col gap-4 px-6 py-6 bg-white min-w-[200px] rounded-2xl text-black items-center shadow-lg">
      <div className="flex flex-col gap-2 w-full text-center">
        <h2 className="text-2xl font-bold text-gray-800">{name}</h2>
      </div>

      <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 leading-normal">
        {bullets.map((bullet, index) => (
          <li key={index}>{bullet}</li>
        ))}
      </ul>

      <button className="w-full bg-[#F8A4B6] text-white cursor-pointer font-semibold py-2 rounded-lg hover:bg-[#E08F9B] transition-colors">
        Buy
      </button>
    </div>
  );
}

export default PiggyCard;
