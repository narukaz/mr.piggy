import React, { useState, useEffect } from "react";

// In a real-world scenario, these would come from your user data.
const ownedPigs = [
  {
    id: 1,
    name: "Sir Oinksalot",
    type: "Basic",
    interest: "2%",
    balance: "$150",
    health: "80%",
    goal: "$500",
    nextCycle: "15d 2h 30m",
  },
  {
    id: 2,
    name: "Porkchop",
    type: "Bronze",
    interest: "5%",
    balance: "$50",
    health: "95%",
    goal: "$250",
    nextCycle: "5d 10h 0m",
  },
  {
    id: 3,
    name: "Hamlet",
    type: "Silver",
    interest: "8%",
    balance: "$300",
    health: "60%",
    goal: "$1,000",
    nextCycle: "22d 4h 5m",
  },
  {
    id: 4,
    name: "Goldie",
    type: "Gold",
    interest: "12%",
    balance: "$700",
    health: "90%",
    goal: "$1,500",
    nextCycle: "30d 5h 25m",
  },
  {
    id: 5,
    name: "Sparkle",
    type: "Diamond",
    interest: "20%",
    balance: "$2,000",
    health: "100%",
    goal: "$5,000",
    nextCycle: "45d 1h 10m",
  },
];

const ideal_piggies = [
  { type: "Gold", tokenId: 0 },
  { type: "Diamond", tokenId: 3 },
  { type: "Bronze", tokenId: 9 },
  { type: "Basic", tokenId: 10 },
];

// Reusable component for displaying stats
const StatItem = ({ icon, label, value }) => (
  <div className="flex items-center gap-2">
    <img src={icon} alt={label} className="w-5 h-5 md:w-6 md:h-6" />
    <div className="flex flex-col">
      <span className="font-semibold text-[0.65rem] md:text-xs leading-none">
        {label}
      </span>
      <span className="text-[0.6rem] md:text-xs leading-none">{value}</span>
    </div>
  </div>
);

// The core Farm component, now contained within the main App component
const Farm = ({ searchTerm, timers, formatTime }) => {
  // Filter the pigs based on the search term
  const filteredPigs = ownedPigs.filter((pig) =>
    pig.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFrameSvg = (type) => {
    switch (type.toLowerCase()) {
      case "basic":
        return "/simple_frame.svg";
      case "bronze":
        return "/bronze_frame.svg";
      case "silver":
        return "/silver_frame.svg";
      case "gold":
        return "/gold_frame.svg";
      case "diamond":
        return "/diamon_frame.svg";
      default:
        return "/simple_frame.svg";
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {filteredPigs.length > 0 ? (
        filteredPigs.map((pig) => (
          <div
            key={pig.id}
            className="relative flex items-stretch gap-4 md:gap-6 p-4 md:p-6 bg-white rounded-xl shadow-sm border border-gray-200"
          >
            <div
              className="absolute inset-0 bg-no-repeat bg-contain bg-center z-0"
              style={{ backgroundImage: `url(${getFrameSvg(pig.type)})` }}
            />

            <div className="flex items-center justify-between gap-4 md:gap-6 relative z-10 w-full px-2 md:px-4">
              <div className="flex items-center gap-4 md:gap-6 flex-grow">
                <div
                  style={{ backgroundImage: "url(/image_frame.svg)" }}
                  className="w-16 h-16 md:w-20 md:h-20 bg-gray-400 rounded-full flex items-center justify-center flex-shrink-0"
                >
                  <span className="text-white text-xs">Image</span>
                </div>

                <div className="flex flex-col flex-grow">
                  <div className="flex items-center gap-2 mb-2">
                    <img src="/piggyname.svg" alt="name" className="w-5 h-5" />
                    <h3 className="text-base md:text-xl font-bold text-gray-800 leading-none">
                      {pig.name}
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-gray-600">
                    <StatItem
                      icon="/interest.svg"
                      label="Interest"
                      value={pig.interest}
                    />
                    <StatItem
                      icon="/health.svg"
                      label="Health"
                      value={pig.health}
                    />
                    <StatItem
                      icon="/amount.svg"
                      label="Balance"
                      value={pig.balance}
                    />
                    <StatItem icon="/goal.svg" label="Goal" value={pig.goal} />
                    <StatItem
                      icon="/cycle.svg"
                      label="Next Cycle"
                      value={formatTime(timers[pig.id]) || pig.nextCycle}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 flex-shrink-0 relative z-10">
                <button
                  className="relative w-24 h-10 md:w-32 md:h-12 font-Pixel bg-contain bg-center bg-no-repeat flex items-center justify-center text-white font-bold text-sm md:text-base hover:opacity-80 transition-opacity"
                  style={{ backgroundImage: "url(/add_to_piggy.svg)" }}
                >
                  Pig In
                </button>
                <button
                  className="relative w-24 h-10 md:w-32 md:h-12 font-Pixel bg-contain bg-center bg-no-repeat flex items-center justify-center text-white font-bold text-sm md:text-base hover:opacity-80 transition-opacity"
                  style={{ backgroundImage: "url(/break_button.svg)" }}
                >
                  Crack
                </button>
              </div>
            </div>
          </div>
        ))
      ) : (
        <p className="text-center text-gray-500 mt-8">No piggies found.</p>
      )}
    </div>
  );
};

export default function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [timers, setTimers] = useState({});
  const [activeTab, setActiveTab] = useState("active"); // State to manage the active tab

  const getInactiveFrame = (type) => {
    switch (type.toLowerCase()) {
      case "basic":
        return "/basic_inactive_frame.svg";
      case "bronze":
        return "/bronze_inactive_frame.svg";
      case "silver":
        return "/silver_inactive_frame.svg";
      case "gold":
        return "/gold_inactive_frame.svg";
      case "diamond":
        return "/diamond_inactive_frame.svg";
    }
  };

  useEffect(() => {
    const calculateTimeRemaining = (cycleString) => {
      const [days, hours, minutes] = cycleString.match(/\d+/g).map(Number);
      const totalMilliseconds =
        days * 24 * 60 * 60 * 1000 +
        hours * 60 * 60 * 1000 +
        minutes * 60 * 1000;
      return totalMilliseconds;
    };

    const updateTimers = () => {
      setTimers((prevTimers) => {
        const newTimers = {};
        ownedPigs.forEach((pig) => {
          const timeLeft =
            prevTimers[pig.id] !== undefined
              ? prevTimers[pig.id] - 1000
              : calculateTimeRemaining(pig.nextCycle);
          newTimers[pig.id] = Math.max(0, timeLeft);
        });
        return newTimers;
      });
    };

    const timerInterval = setInterval(updateTimers, 1000);
    return () => clearInterval(timerInterval);
  }, []);

  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 mt-48">
      <div className="flex flex-col gap-8 bg-[#F7F7F7] rounded-3xl px-8 md:px-16 py-12 w-full max-w-5xl">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#F8A4B6] mb-2">
            My Farm
          </h1>
          <p className="text-lg md:text-xl text-gray-500 font-medium mb-4">
            Check on your loyal piggies!
          </p>
          <input
            type="text"
            placeholder="Search for a piggy..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:border-[#F8A4B6] transition-colors"
          />
        </div>

        {/* Tab Buttons */}
        <div className="flex justify-center gap-4 border-b border-gray-300">
          <button
            onClick={() => setActiveTab("active")}
            className={`py-2 px-4 font-bold rounded-t-lg transition-colors ${
              activeTab === "active"
                ? "text-[#F8A4B6] border-b-2 border-[#F8A4B6]"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setActiveTab("ideal")}
            className={`py-2 px-4 font-bold rounded-t-lg transition-colors ${
              activeTab === "ideal"
                ? "text-[#F8A4B6] border-b-2 border-[#F8A4B6]"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Ideal
          </button>
        </div>

        {/* Conditional Content Rendering */}
        {activeTab === "active" && (
          <Farm
            searchTerm={searchTerm}
            timers={timers}
            formatTime={formatTime}
          />
        )}

        {activeTab === "ideal" && (
          <div className="p-8 text-center text-gray-500 flex justify-center flex-wrap gap-5">
            {ideal_piggies.length > 0 ? (
              ideal_piggies.map((piggy, index) => (
                <div
                  className="bg-white rounded-lg p-6 shadow-md flex flex-col items-center gap-4"
                  key={index}
                >
                  <div className="w-44 h-44 flex items-center justify-center">
                    <div className="relative">
                      <img
                        src={getInactiveFrame(piggy?.type)}
                        alt="piggy frame"
                        className="w-full h-full object-contain  "
                      />
                      <img
                        src="/piggy_activation_button.svg"
                        alt=""
                        className="absolute w-39 h-39 top-23 left-[8px] hover:top-20 transition-all cursor-pointer"
                      />
                    </div>
                  </div>
                  <div className="text-center">
                    <span className="font-bold capitalize">{piggy.type}</span>
                    <p className="text-sm text-gray-400">
                      Token #{piggy.tokenId}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p>No ideal piggies found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
