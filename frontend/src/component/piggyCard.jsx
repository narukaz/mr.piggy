import React, { useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useNavigate } from "react-router-dom";
import mr_piggy_abi from "../ABI/abi.json";
import contract from "../contract/contract.json";
import { parseEther } from "viem";
import { parse } from "dotenv";

function PiggyCard({
  name,
  imagePlaceholder,
  bullets,
  setIsToast,
  function_name,
  piggy_price,
}) {
  const {
    data: hash,
    isPending,
    error: writeError,
    writeContract,
    reset,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: receiptError,
  } = useWaitForTransactionReceipt({ hash });

  const navigate = useNavigate();

  function buyPiggy() {
    setIsToast(null);
    switch (name) {
      case "Basic Piggy":
        {
          writeContract({
            address: contract.contract_address,
            abi: mr_piggy_abi,
            functionName: function_name,
            args: [],
          });
        }
        break;
      case "Bronze Piggy":
        writeContract({
          address: contract.contract_address,
          abi: mr_piggy_abi,
          functionName: function_name,
          args: [],
          value: parseEther(piggy_price),
        });
        break;
      case "Silver Piggy":
        writeContract({
          address: contract.contract_address,
          abi: mr_piggy_abi,
          functionName: function_name,
          args: [],
          value: parseEther(piggy_price),
        });
        break;
      case "Gold Piggy":
        writeContract({
          address: contract.contract_address,
          abi: mr_piggy_abi,
          functionName: function_name,
          args: [],
          value: parseEther(piggy_price),
        });
        break;
      case "Diamond Piggy":
        writeContract({
          address: contract.contract_address,
          abi: mr_piggy_abi,
          functionName: function_name,
          args: [],
          value: parseEther(piggy_price),
        });
        break;
    }
  }

  useEffect(() => {
    if (isPending) {
      setIsToast({
        status: "info",
        message: "Confirm in your wallet...",
      });
      return;
    }

    // State 2: Transaction is submitted and processing
    if (isConfirming) {
      setIsToast({
        status: "loading",
        message: "Transaction processing...",
        hash,
      });
      return;
    }

    // State 3: Transaction succeeded
    if (isConfirmed) {
      setIsToast({
        status: "success",
        message: "Purchase successful! Redirecting...",
        hash,
      });

      const timer = setTimeout(() => {
        navigate("/farm");
        setIsToast(null); // Clear toast after navigation
      }, 2000);

      // Clean up the timer and reset the hook's state for the next transaction
      return () => {
        clearTimeout(timer);
        reset();
      };
    }

    // State 4: An error occurred
    if (writeError || receiptError) {
      const error = writeError || receiptError;
      setIsToast({
        status: "error",

        message: error.shortMessage || "Transaction failed.",
      });
      // Reset the hook's state so the user can try again
      const errorTimer = setTimeout(() => {
        setIsToast(null);
        reset();
      }, 8000);

      return () => clearTimeout(errorTimer);
    }
  }, [
    isPending,
    isConfirming,
    isConfirmed,
    hash,
    writeError,
    receiptError,
    setIsToast,
    navigate,
    reset,
  ]);

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

      <button
        onClick={buyPiggy}
        disabled={isPending || isConfirming}
        className="w-full bg-[#F8A4B6] text-white cursor-pointer font-semibold py-2 rounded-lg hover:bg-[#E08F9B] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isPending ? "Confirming..." : isConfirming ? "Processing..." : "Buy"}
      </button>
    </div>
  );
}

export default PiggyCard;
