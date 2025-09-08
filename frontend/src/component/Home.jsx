import React from "react";

const piggyTiers = [
  {
    name: "Basic",
    frame: "/basic_inactive_frame.svg",
    benefits: ["Health: 3", "3% Goal Bonus"],
    image:
      "https://cyan-realistic-swift-995.mypinata.cloud/ipfs/bafybeih4gdpouwvk3nhkufhvlagwqmjsg55ahbvguvjzstyyfbs32f2kaa/1.svg",
  },
  {
    name: "Bronze",
    frame: "/bronze_inactive_frame.svg",
    benefits: ["Health: 5", "5% Goal Bonus"],
    image:
      "https://cyan-realistic-swift-995.mypinata.cloud/ipfs/bafybeih4gdpouwvk3nhkufhvlagwqmjsg55ahbvguvjzstyyfbs32f2kaa/2.svg",
  },
  {
    name: "Silver",
    frame: "/silver_inactive_frame.svg",
    benefits: ["Health: 6", "6% Goal Bonus"],
    image:
      "https://cyan-realistic-swift-995.mypinata.cloud/ipfs/bafybeih4gdpouwvk3nhkufhvlagwqmjsg55ahbvguvjzstyyfbs32f2kaa/3.svg",
  },
  {
    name: "Gold",
    frame: "/gold_inactive_frame.svg",
    benefits: ["Health: 7", "7% Goal Bonus"],
    image:
      "https://cyan-realistic-swift-995.mypinata.cloud/ipfs/bafybeih4gdpouwvk3nhkufhvlagwqmjsg55ahbvguvjzstyyfbs32f2kaa/4.svg",
  },
  {
    name: "Diamond",
    frame: "/diamond_inactive_frame.svg",
    benefits: ["Health: 9", "9% Goal Bonus"],
    image:
      "https://cyan-realistic-swift-995.mypinata.cloud/ipfs/bafybeih4gdpouwvk3nhkufhvlagwqmjsg55ahbvguvjzstyyfbs32f2kaa/5.svg",
  },
];

function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 mt-52">
      <div className="w-full max-w-5xl bg-[#F7F7F7] text-[#2e2e2e] p-8 rounded-2xl shadow-lg border border-gray-200 font-['Pixelify_Sans']">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-center text-[#F8A4B6]">
          Welcome to Mr. Piggy!
        </h1>
        <p className="mb-8 text-center text-gray-600 font-medium font-sans">
          Here's a quick guide to saving, earning, and racing with your piggies.
        </p>

        <div className="space-y-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-2xl font-bold mb-4 text-[#F8A4B6]">
              Piggy NFTs: Your Oink-Powered Advantages
            </h2>

            <p className="text-gray-700 leading-relaxed mb-6 font-sans">
              Your journey starts by acquiring a Piggy. You can get a Basic
              Piggy for free or purchase higher-tier Piggies from the Market,
              each offering better perks for your savings goals.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {piggyTiers.map((pig) => (
                <div
                  key={pig.name}
                  className="bg-gray-50 p-4 rounded-lg shadow-inner flex flex-col items-center"
                >
                  <div className="relative w-full aspect-square mb-4">
                    <div className="absolute inset-4 bg-gray-200 left-7 rounded-full flex items-center justify-center">
                      <img src={pig.image} />
                    </div>

                    <img
                      src={pig.frame}
                      alt={`${pig.name} frame`}
                      className="absolute inset-0 w-full h-full object-contain"
                    />
                  </div>
                  <div className="text-center">
                    <h3 className="font-bold text-xl text-black">{pig.name}</h3>
                    <div className="mt-2 space-y-1">
                      {pig.benefits.map((benefit, index) => (
                        <p
                          key={index}
                          className="text-black text-xs md:text-sm font-sans"
                        >
                          {benefit}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-gray-700 leading-relaxed mt-6 text-sm font-sans">
              <strong>Health Note:</strong> If a piggy's health reaches zero
              from missed deposits, you must crack it open to retrieve your
              funds.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-2xl font-bold mb-2 text-[#F8A4B6]">
              Streaks & Badge NFTs
            </h2>
            <p className="text-gray-700 leading-relaxed font-sans">
              By making consistent deposits ("feeding"), you build a "streak."
              Reaching specific streak milestones (like 10, 30, or 50 on-time
              deposits) allows you to mint special, permanent NFT badges as a
              reward for your dedication!
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-2xl font-bold mb-2 text-[#F8A4B6]">
              The Piggy Race
            </h2>
            <p className="text-gray-700 leading-relaxed font-sans">
              Players can enter a community race by paying an entry fee, which
              mints a special racing piggy. All participants must meet the
              deposit goals within the race timeframe. The final prize pool,
              funded by the race creator and penalties from those who quit, is
              distributed among the winners based on their piggy's final health.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
