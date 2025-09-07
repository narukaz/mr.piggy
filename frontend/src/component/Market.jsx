import React from "react";
import PiggyCard from "./piggyCard"; // Ensure this path is correct

function Market() {
  const piggies = [
    {
      name: "Basic Piggy",
      imagePlaceholder: "[Basic Piggy Image]",
      bullets: [
        "Tracks your feeding streaks.",
        "Default health and interest rate.",
        "Your first step into the game.",
      ],
    },
    {
      name: "Bronze Piggy",
      imagePlaceholder: "[Bronze Piggy Image]",
      bullets: [
        "Slightly increased health.",
        "Small interest rate boost.",
        "More forgiving on missed days.",
      ],
    },
    {
      name: "Silver Piggy",
      imagePlaceholder: "[Silver Piggy Image]",
      bullets: [
        "Substantially increased health.",
        "Significant interest rate jump.",
        "A secure piggy for growing assets.",
      ],
    },
    {
      name: "Gold Piggy",
      imagePlaceholder: "[Gold Piggy Image]",
      bullets: [
        "Impressive health reserve.",
        "High-yield interest rate.",
        "An elite choice for top players.",
      ],
    },
    {
      name: "Diamond Piggy",
      imagePlaceholder: "[Diamond Piggy Image]",
      bullets: [
        "Unmatched health and resilience.",
        "Exceptional interest rates.",
        "A top-tier asset for races.",
      ],
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="flex flex-col gap-8 bg-[#F7F7F7] rounded-3xl px-12 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-extrabold text-[#F8A4B6] mb-2">
            Buy an Oinker!
          </h1>
          <p className="text-xl text-gray-500 font-medium">
            Choose a piggy to start Pigging.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-12 ">
          {piggies.map((piggy, index) => (
            <PiggyCard
              key={index}
              name={piggy.name}
              imagePlaceholder={piggy.imagePlaceholder}
              bullets={piggy.bullets}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Market;
