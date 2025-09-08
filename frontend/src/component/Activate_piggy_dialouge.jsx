import React, { useState, useEffect } from "react";
import {
  useSimulateContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseEther } from "viem";
import master_abi from "../ABI/abi.json"; // Adjust path to your ABI
import contract from "../contract/contract.json"; // Adjust path to your contract address

const CYCLE_OPTIONS = [
  { id: "weekly", label: "Weekly", days: 7 },
  { id: "monthly", label: "Monthly", days: 30 },
  { id: "quarterly", label: "Quarterly", days: 90 },
];

function ActivatePiggyDialog({
  tokenId,
  setIsDialogActive,
  setSelectedTokenId,
  onStatusChange,
}) {
  // --- FORM STATE ---
  const [selectedCycle, setSelectedCycle] = useState("weekly");
  const [totalAmount, setTotalAmount] = useState("");
  const [pledgeAmount, setPledgeAmount] = useState("");
  const [endTime, setEndTime] = useState(null);

  // --- WAGMI TRANSACTION HOOKS ---

  // 1. Simulate the contract call to validate inputs and prepare the transaction
  const { data: simulation, error: simulationError } = useSimulateContract({
    address: contract.contract_address,
    abi: master_abi,
    functionName: "activatePiggy",
    args: [
      tokenId,
      pledgeAmount ? parseEther(pledgeAmount) : BigInt(0),
      totalAmount ? parseEther(totalAmount) : BigInt(0),
      // Convert cycle days into seconds for the smart contract
      BigInt(
        CYCLE_OPTIONS.find((c) => c.id === selectedCycle)?.days * 86400 || 0
      ),
    ],
    // Only run simulation if inputs are valid to prevent premature errors
    query: {
      enabled:
        !!pledgeAmount &&
        !!totalAmount &&
        parseFloat(pledgeAmount) < parseFloat(totalAmount),
    },
  });

  // 2. Hook to send the transaction to the blockchain
  const {
    data: hash,
    isPending: isWritePending,
    writeContract,
  } = useWriteContract();

  // 3. Hook to wait for the transaction to be confirmed
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: receiptError,
  } = useWaitForTransactionReceipt({ hash });

  // --- LOGIC & EFFECTS ---

  // Effect to calculate the estimated end date for the UI
  useEffect(() => {
    const total = parseFloat(totalAmount);
    const pledge = parseFloat(pledgeAmount);
    const cycleInfo = CYCLE_OPTIONS.find((c) => c.id === selectedCycle);

    if (total > 0 && pledge > 0 && cycleInfo) {
      const numberOfPayments = Math.ceil(total / pledge);
      const totalDurationInDays = numberOfPayments * cycleInfo.days;
      const now = new Date();
      const endDate = new Date(
        now.setDate(now.getDate() + totalDurationInDays)
      );
      setEndTime(endDate.toLocaleDateString());
    } else {
      setEndTime(null);
    }
  }, [totalAmount, pledgeAmount, selectedCycle]);

  useEffect(() => {
    let statusTimer;
    if (isConfirmed) {
      onStatusChange({
        status: "success",
        message: `Piggy #${tokenId} activated successfully!`,
      });

      setIsDialogActive(false);
      setSelectedTokenId(null);

      statusTimer = setTimeout(() => {
        onStatusChange(null);
      }, 3000);
    }
    const error = simulationError || receiptError;
    if (error) {
      onStatusChange({
        status: "error",
        message: error.shortMessage || "Transaction failed.",
      });
      statusTimer = setTimeout(() => {
        onStatusChange(null);
      }, 5000);
    }

    return () => {
      if (statusTimer) {
        clearTimeout(statusTimer);
      }
    };
  }, [
    isConfirmed,
    simulationError,
    receiptError,
    onStatusChange,
    setIsDialogActive,
    setSelectedTokenId,
    tokenId,
  ]);

  // --- HANDLERS ---

  const handleClose = () => {
    setIsDialogActive(false);
    setSelectedTokenId(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (simulation?.request) {
      writeContract(simulation.request);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 font-['Pixelify_Sans']">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm p-8 bg-white shadow-xl space-y-6 relative"
      >
        <button
          type="button"
          onClick={handleClose}
          className="right-4 top-2 absolute cursor-pointer text-2xl font-bold"
        >
          &times;
        </button>

        <h1 className="text-3xl font-bold text-center text-pink-500">
          Activate Your Piggy
        </h1>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Cycle
          </label>
          <div className="flex justify-between gap-2">
            {CYCLE_OPTIONS.map((option) => (
              <button
                type="button"
                key={option.id}
                onClick={() => setSelectedCycle(option.id)}
                className={`w-full py-2 cursor-pointer text-sm font-semibold border-2 border-b-4 border-black transition-transform active:translate-y-0.5 ${
                  selectedCycle === option.id
                    ? "bg-pink-500 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="totalAmount"
              className="block text-sm font-medium text-gray-700"
            >
              Total SONIC to Save
            </label>
            <input
              id="totalAmount"
              type="number"
              placeholder="e.g., 1.2"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 shadow-sm focus:ring-pink-500 focus:border-pink-500 font-sans"
              required
            />
          </div>
          <div>
            <label
              htmlFor="pledgeAmount"
              className="block text-sm font-medium text-gray-700"
            >
              Pledge per Cycle (SONIC)
            </label>
            <input
              id="pledgeAmount"
              type="number"
              placeholder="e.g., 0.1"
              value={pledgeAmount}
              onChange={(e) => setPledgeAmount(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 shadow-sm focus:ring-pink-500 focus:border-pink-500 font-sans"
              required
            />
          </div>
        </div>

        <div className="text-center text-sm text-gray-600 space-y-1">
          <p>
            Token ID: <span className="font-bold font-sans">{tokenId}</span>
          </p>
          {endTime && (
            <p>
              Estimated End Date:{" "}
              <span className="font-bold font-sans">{endTime}</span>
            </p>
          )}
        </div>

        {/* Real-time validation message from useSimulateContract */}
        {simulationError && (
          <p className="text-center text-sm text-red-600 font-sans">
            Error:{" "}
            {simulationError.cause?.shortMessage || "Please check your inputs."}
          </p>
        )}

        <div className="relative z-10">
          <div className="bg-black absolute inset-0 -z-[1]"></div>
          <button
            type="submit"
            disabled={!simulation?.request || isWritePending || isConfirming}
            className="w-full cursor-pointer py-3 font-bold text-white bg-pink-500 border-2 border-b-4 border-black active:translate-y-0.5 transition-transform disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isConfirming
              ? "Activating..."
              : isWritePending
              ? "Confirm in Wallet..."
              : "Confirm Activation"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ActivatePiggyDialog;
