import React, { useState } from "react";
const pig = {
  id: 1,
  name: "Sir Oinksalot",
  type: "Basic",
  reward: "2%",
  balance: "$150",
  health: "80%",
  goal: "$500",
  nextCycle: "15d 2h 30m",
};
function Race() {
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
  const [raceActive, isRaceActive] = useState(true);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="flex flex-col gap-8 bg-[#F7F7F7] rounded-3xl px-8 md:px-16 py-12 w-full max-w-5xl">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#F8A4B6] mb-2">
            let's go Oink-Oink
          </h1>
          <p className="text-lg md:text-xl text-gray-500 font-medium mb-4">
            One person’s penalty is another person’s reward
          </p>
        </div>
        <div className="relative">
          <img src="/race_card.svg" />
          {raceActive && (
            <div className="absolute right-7 top-11 hover:scale-110 transition-all cursor-pointer ">
              <img src="/race_active.svg" className="w-40" />
              <h3 className="absolute top-4 left-7 font-bold text-2xl text-white text-center font-Pixel">
                Join race
              </h3>
            </div>
          )}
          {!raceActive && (
            <div className="absolute right-7 top-11 hover:scale-110 transition-all  cursor-not-allowed ">
              <img src="/race_disabled.svg" className="w-40" />
              <h3 className="absolute top-4 left-10 font-bold text-2xl text-white text-center font-Pixel">
                Begun
              </h3>
            </div>
          )}
          <div className="absolute  px-7 left-44 top-8 flex gap-14">
            <div className="flex flex-col gap-4">
              <h3 className=" text-[#ED981D] text-2xl  select-none font-Pixel">
                Start time:<span className="font-extralight">12:00:12</span>
              </h3>
              <h3 className=" text-[#ED981D] text-2xl  select-none font-Pixel">
                End time:<span className="font-extralight">12:00:12</span>
              </h3>
            </div>
            <div className="flex flex-col gap-4">
              <h3 className=" text-[#ED981D] text-2xl  select-none font-Pixel">
                Participants:
                <span className="font-extralight ">1</span>
              </h3>
              <h3 className=" text-[#ED981D] text-2xl  select-none font-Pixel">
                Rewards:<span className="font-extralight">1</span>
              </h3>
            </div>
          </div>
        </div>
        <div>
          <p className="text-lg md:text-xl text-gray-500 font-medium mb-4 text-center">
            Your piggies
          </p>
          <div
            key={pig.id}
            className="relative flex items-stretch gap-4 md:gap-6 p-4 md:p-6 bg-white rounded-xl shadow-sm border border-gray-200"
          >
            <div
              className="absolute inset-0 bg-no-repeat bg-contain bg-center z-0"
              style={{ backgroundImage: `url(/simple_frame.svg)` }}
            />

            <div className="flex items-center justify-between gap-4 md:gap-6 relative z-10 w-full px-2 md:px-4">
              <div className="flex items-center gap-4 md:gap-6 flex-grow">
                <div
                  // style={{ backgroundImage: "url(/basic_frame.svg)" }}
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
                      label="reward"
                      value={pig.reward}
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
                      value={"00:00" || pig.nextCycle}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 flex-shrink-0 relative z-10">
                <button
                  className="relative w-24 h-10 md:w-32 md:h-12 cursor-pointer font-Pixel bg-contain bg-center bg-no-repeat flex items-center justify-center text-white font-bold text-sm md:text-base hover:opacity-80 transition-opacity"
                  style={{ backgroundImage: "url(/add_to_piggy.svg)" }}
                >
                  Pig in
                </button>
                <button
                  className="relative w-24 h-10 md:w-32 md:h-12 font-Pixel cursor-pointer bg-contain bg-center bg-no-repeat flex items-center justify-center text-white font-bold text-sm md:text-base hover:opacity-80 transition-opacity"
                  style={{ backgroundImage: "url(/break_button.svg)" }}
                >
                  Quit
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Race;
