import React, { useEffect, useState } from "react";
import {
  useSimulateContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseEther } from "viem";
import master_abi from "../ABI/abi.json"; // Adjust path if needed
import contract from "../contract/contract.json"; // Adjust path if needed
import { useNavigate } from "react-router-dom";

// --- Internal PiggyCard Component ---
function PiggyCard({
  setIsToast,
  name,
  frame,
  bullets,
  function_name,
  piggy_price,
}) {
  const navigate = useNavigate();

  const { data: simulation, error: simulationError } = useSimulateContract({
    address: contract.contract_address,
    abi: master_abi,
    functionName: function_name,
    value:
      piggy_price && parseFloat(piggy_price) > 0
        ? parseEther(piggy_price)
        : undefined,
  });

  const { data: hash, isPending, writeContract } = useWriteContract();
  const {
    isLoading: isConfirming,
    isSuccess,
    error: receiptError,
  } = useWaitForTransactionReceipt({ hash });

  const handleBuy = () => {
    if (simulation?.request) {
      writeContract(simulation.request);
    }
  };

  useEffect(() => {
    let timer;
    if (isConfirming) {
      setIsToast({ status: "loading", message: "Minting piggy..." });
    } else if (isSuccess) {
      setIsToast({ status: "success", message: "Mint successful!" });
      timer = setTimeout(() => {
        setIsToast(null);
        navigate("/farm?status=new");
      }, 2000);
    } else if (simulationError || receiptError) {
      const error = simulationError || receiptError;
      setIsToast({
        status: "error",
        message: error.shortMessage || "Transaction failed.",
      });
      timer = setTimeout(() => setIsToast(null), 5000);
    }
    return () => clearTimeout(timer);
  }, [
    isConfirming,
    isSuccess,
    simulationError,
    receiptError,
    setIsToast,
    navigate,
  ]);

  return (
    <div className="flex flex-col gap-4 px-6 py-6 bg-white min-w-[250px] rounded-2xl text-black items-center shadow-lg border-2 border-gray-200">
      {/* FIX: Replaced the background div with a layered image structure */}
      <div className="relative w-32 h-32 mb-4">
        {/* Placeholder for the piggy image (bottom layer) */}
        <img
          src="https://cyan-realistic-swift-995.mypinata.cloud/ipfs/bafybeiavqtowxksrgfyf7btcydeh2fhbvm3h3qw2ueecucrzbebzeb5h6a/2.jpg"
          alt={`${name} Placeholder`}
          className=" w-auto h-auto object-cover rounded-full scale-75"
        />
        {/* The frame image (top layer) */}
        <img
          src={frame}
          alt={`${name} frame`}
          className="absolute inset-0 w-full h-full object-contain z-10"
        />
      </div>

      <h2 className="text-2xl font-bold text-gray-800 font-['Pixelify_Sans']">
        {name}
      </h2>
      <p className="font-semibold text-pink-500">
        {piggy_price === "0" ? "Free" : `${piggy_price} ETH`}
      </p>
      <ul className="list-disc list-inside space-y-2 text-sm text-gray-700 leading-normal self-start pl-4">
        {bullets.map((bullet, index) => (
          <li key={index}>{bullet}</li>
        ))}
      </ul>
      <div className="relative w-full mt-auto pt-4">
        <button
          onClick={handleBuy}
          disabled={!simulation?.request || isPending || isConfirming}
          className="w-full bg-[#F8A4B6] text-white cursor-pointer font-semibold py-3 border-2 border-black transition-transform active:translate-y-1 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:border-gray-500 disabled:shadow-none font-['Pixelify_Sans']"
          style={{
            boxShadow: "4px 4px 0px #000000",
          }}
        >
          {isConfirming
            ? "Minting..."
            : isPending
            ? "Confirm..."
            : "Mint Piggy"}
        </button>
      </div>
      {simulationError && (
        <p className="text-xs text-red-500 mt-2 text-center">
          {simulationError.cause?.shortMessage}
        </p>
      )}
    </div>
  );
}

function Market() {
  const piggies = [
    {
      name: "Basic Piggy",
      functionName: "mintBasicPiggy",
      price: "0",
      frame: "/basic_inactive_frame.svg",
      bullets: [
        "Health: 3",
        "Tracks your feeding streaks.",
        "3% bonus on goal completion.",
      ],
    },
    {
      name: "Bronze Piggy",
      functionName: "mint_BronzePiggy",
      price: "0.0001",
      frame: "/bronze_inactive_frame.svg",
      bullets: [
        "Health: 5",
        "Slightly increased health.",
        "5% bonus on goal completion.",
      ],
    },
    {
      name: "Silver Piggy",
      functionName: "mint_SilverPiggy",
      price: "0.0003",
      frame: "/silver_inactive_frame.svg",
      bullets: [
        "Health: 6",
        "Substantially increased health.",
        "6% bonus on goal completion.",
      ],
    },
    {
      name: "Gold Piggy",
      functionName: "mint_GoldPiggy",
      price: "0.0005",
      frame: "/gold_inactive_frame.svg",
      bullets: [
        "Health: 7",
        "Impressive health reserve.",
        "7% bonus on goal completion.",
      ],
    },
    {
      name: "Diamond Piggy",
      functionName: "mint_DiamondPiggy",
      price: "0.0007",
      frame: "/diamond_inactive_frame.svg",
      bullets: [
        "Health: 9",
        "Unmatched health and resilience.",
        "9% bonus on goal completion.",
      ],
    },
  ];

  const [isToast, setIsToast] = useState(null);

  const getToastInfo = (status) => {
    switch (status) {
      case "success":
        return { icon: "/success-check.svg", animation: "" };
      case "error":
        return { icon: "/error-cross.svg", animation: "" };
      case "loading":
      default:
        return { icon: "/loading.svg", animation: "animate-spin" };
    }
  };

  const toastInfo = isToast ? getToastInfo(isToast.status) : {};

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen p-8 mt-45">
        <div className="flex flex-col gap-8 bg-[#F7F7F7] rounded-3xl px-12 py-20">
          <div className="text-center">
            <h1 className="text-5xl font-extrabold text-[#F8A4B6] mb-2 font-['Pixelify_Sans']">
              Buy an Oinker!
            </h1>
            <p className="text-xl text-gray-500 font-medium">
              Choose a piggy to start your journey.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-12 ">
            {piggies.map((piggy, index) => (
              <PiggyCard
                setIsToast={setIsToast}
                key={index}
                name={piggy.name}
                frame={piggy.frame}
                bullets={piggy.bullets}
                function_name={piggy.functionName}
                piggy_price={piggy.price}
              />
            ))}
          </div>
        </div>
      </div>
      {isToast && (
        <div className="px-5 py-5 bg-white fixed bottom-10 right-5 w-fit max-w-[300px] flex gap-3 rounded-3xl drop-shadow-2xl items-center select-none z-50">
          <img
            src={toastInfo.icon}
            className={`w-7 h-7 select-none ${toastInfo.animation}`}
            alt={isToast.status}
          />
          <div className="font-['Pixelify_Sans'] select-none">
            {isToast.message}
          </div>
        </div>
      )}
    </>
  );
}

export default Market;
