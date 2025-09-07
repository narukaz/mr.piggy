import React from "react";

function Home() {
  return (
    <div className="absolute top-[30%] left-1/2 -translate-x-1/2 w-[95%] md:w-[85%] lg:w-[70%] xl:w-[60%] bg-[#F5F5F5] text-[#2e2e2e] p-8 rounded-2xl shadow-lg border border-gray-200">
      <h1 className="text-4xl font-extrabold mb-4 text-center text-[#F8A4B6]">
        Rules of Piggy DApp
      </h1>
      <p className="mb-8 text-center text-gray-600 font-medium">
        Welcome! Here's a quick guide to feeding, growing, and racing your
        piggies.
      </p>

      {/* Rules Section */}
      <div className="space-y-8">
        {/* Feeding and Badges */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-2xl font-bold mb-2 text-[#F8A4B6]">
            Streaks and NFTs
          </h2>
          <p className="text-gray-700 leading-relaxed">
            By consistently feeding your piggies, you build a "streak." Clear
            specific streak milestones to earn special NFT badges. These badges
            are unique and represent your dedication!
          </p>
        </div>

        {/* Piggy NFTs */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-2xl font-bold mb-2 text-[#F8A4B6]">
            Piggy NFTs: Your Oink-Powered Advantages
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            **Basic Piggy:** This little piggy is your starter. It holds your
            saved funds and a growing streak. Its health is tied to consistent
            feeding.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="p-4 bg-gray-100 rounded-lg text-center">
              <h3 className="font-semibold text-lg text-[#F8A4B6]">Bronze</h3>
              <p className="text-sm text-gray-600">Increased Health</p>
            </div>
            <div className="p-4 bg-gray-100 rounded-lg text-center">
              <h3 className="font-semibold text-lg text-[#F8A4B6]">Silver</h3>
              <p className="text-sm text-gray-600">Higher Interest Rate</p>
            </div>
            <div className="p-4 bg-gray-100 rounded-lg text-center">
              <h3 className="font-semibold text-lg text-[#F8A4B6]">Gold</h3>
              <p className="text-sm text-gray-600">Increased Health</p>
            </div>
            <div className="p-4 bg-gray-100 rounded-lg text-center">
              <h3 className="font-semibold text-lg text-[#F8A4B6]">Diamond</h3>
              <p className="text-sm text-gray-600">Top-tier advantages!</p>
            </div>
          </div>
          <p className="text-gray-700 leading-relaxed mt-2">
            **Health:** If a piggy's health reaches zero, you can no longer feed
            it. You must crack it open to retrieve the funds.
          </p>
        </div>

        {/* Piggy Races */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-2xl font-bold mb-2 text-[#F8A4B6]">
            The Piggy Race
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Players can enter a race by feeding a certain amount to their
            piggies within a specific timeframe. The winner is the one who feeds
            the most. The final prize pool consists of penalties from other
            users who did not meet the feeding requirements, plus a reward from
            the race creator.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Home;
