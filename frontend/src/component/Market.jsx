import React, { useEffect, useState } from "react";
import PiggyCard from "./piggyCard";

function Market() {
  const piggies = [
    {
      name: "Basic Piggy",
      functionName: "mintBasicPiggy",
      price: "0",
      imagePlaceholder: "[Basic Piggy Image]",
      bullets: [
        "Tracks your feeding streaks.",
        "Default health and interest rate.",
        "Your first step into the game.",
      ],
    },
    {
      name: "Bronze Piggy",
      functionName: "mint_BronzePiggy",
      imagePlaceholder: "[Bronze Piggy Image]",
      bullets: [
        "Slightly increased health.",
        "Small interest rate boost.",
        "More forgiving on missed days.",
      ],
      price: "0.0001",
    },
    {
      name: "Silver Piggy",
      imagePlaceholder: "[Silver Piggy Image]",
      functionName: "mint_SilverPiggy",
      bullets: [
        "Substantially increased health.",
        "Significant interest rate jump.",
        "A secure piggy for growing assets.",
      ],
      price: "0.0003",
    },
    {
      name: "Gold Piggy",
      imagePlaceholder: "[Gold Piggy Image]",
      functionName: "mint_GoldPiggy",
      bullets: [
        "Impressive health reserve.",
        "High-yield interest rate.",
        "An elite choice for top players.",
      ],
      price: "0.0005",
    },
    {
      name: "Diamond Piggy",
      imagePlaceholder: "[Diamond Piggy Image]",
      functionName: "mint_DiamondPiggy",
      bullets: [
        "Unmatched health and resilience.",
        "Exceptional interest rates.",
        "A top-tier asset for races.",
      ],
      price: "0.0007",
    },
  ];

  const [isToast, setIsToast] = useState(null);

  console.log(isToast);

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen p-8 mt-25">
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
                setIsToast={setIsToast}
                key={index}
                name={piggy.name}
                imagePlaceholder={piggy.imagePlaceholder}
                bullets={piggy.bullets}
                function_name={piggy.functionName}
                piggy_price={piggy.price}
              />
            ))}
          </div>
        </div>
      </div>
      {isToast ? (
        <div className="px-5 py-5 bg-white fixed bottom-10  right-5 w-[250px] flex gap-3 rounded-3xl drop-shadow-2xl items-center select-none">
          <img
            src="/loading.svg"
            className="w-7 h-7 animate-spin select-none"
          />
          <div className="font-Pixel select-none">{isToast?.message}</div>
        </div>
      ) : null}
    </>
  );
}

export default Market;
