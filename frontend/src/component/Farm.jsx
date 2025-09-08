import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  useAccount,
  useConfig,
  useSimulateContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import master_abi from "../ABI/abi.json";
import contract from "../contract/contract.json";
import { formatEther } from "viem";
import {
  readContract,
  simulateContract,
  writeContract,
  waitForTransactionReceipt,
} from "wagmi/actions";
import Activate_piggy_dialouge from "./Activate_piggy_dialouge";
import PiggyImage from "./PiggyImage";

// --- CHILD COMPONENTS ---

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

function BreakPiggyButton({ tokenId, onStatusChange, onSuccess }) {
  const { data: simulation, error: simulationError } = useSimulateContract({
    address: contract.contract_address,
    abi: master_abi,
    functionName: "Break_Your_Piggy",
    args: [tokenId],
  });

  const {
    data: hash,
    isPending: isWritePending,
    writeContract: performWrite,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: receiptError,
  } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    let statusTimer;
    if (isConfirmed) {
      onStatusChange({
        status: "success",
        message: `Piggy #${tokenId} has been cracked!`,
      });
      onSuccess();
      statusTimer = setTimeout(() => onStatusChange(null), 8000);
    }
    const error = simulationError || receiptError;
    if (error) {
      onStatusChange({
        status: "error",
        message: error.shortMessage || "Failed to crack piggy.",
      });
      statusTimer = setTimeout(() => onStatusChange(null), 8000);
    }
    return () => {
      if (statusTimer) clearTimeout(statusTimer);
    };
  }, [
    isConfirmed,
    simulationError,
    receiptError,
    onStatusChange,
    onSuccess,
    tokenId,
  ]);

  const handleBreakPiggy = () => {
    if (simulation?.request) {
      performWrite(simulation.request);
    } else {
      onStatusChange({
        status: "error",
        message:
          simulationError?.cause?.shortMessage || "Cannot crack this piggy.",
      });
      setTimeout(() => onStatusChange(null), 5000);
    }
  };

  return (
    <button
      onClick={handleBreakPiggy}
      disabled={!simulation?.request || isWritePending || isConfirming}
      className="relative w-24 h-10 md:w-32 md:h-12 font-Pixel hover:scale-110 bg-contain bg-center bg-no-repeat flex items-center justify-center text-white font-bold text-sm md:text-base hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      style={{ backgroundImage: "url(/break_button.svg)" }}
    >
      {isConfirming ? "Cracking..." : isWritePending ? "Confirm..." : "Crack"}
    </button>
  );
}

const ActivePiggies = ({
  piggies,
  searchTerm,
  pigIn,
  onStatusChange,
  onSuccess,
}) => {
  const filteredPigs = piggies.filter((pig) =>
    (pig.name || `Piggy #${pig.tokenId}`)
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const getFrameSvg = (health) => {
    if (health >= 9) return "/diamond_frame.svg";
    if (health >= 7) return "/gold_frame.svg";
    if (health >= 6) return "/silver_frame.svg";
    if (health >= 5) return "/bronze_frame.svg";
    return "/simple_frame.svg";
  };

  return (
    <div className="flex flex-col gap-6">
      {filteredPigs.length > 0 ? (
        filteredPigs.map((pig) => {
          const nextCycleDate = new Date(
            Number(pig.nextExpectedPaymentTimeRange) * 1000
          ).toLocaleDateString();

          return (
            <div
              key={pig.tokenId}
              className="relative flex items-stretch gap-4 md:gap-6 p-4 md:p-6 bg-white rounded-xl shadow-sm border border-gray-200"
            >
              <div
                className="absolute inset-0 bg-no-repeat bg-contain bg-center z-0"
                style={{
                  backgroundImage: `url(${getFrameSvg(
                    Number(pig.piggyHealth)
                  )})`,
                }}
              />
              <div className="flex items-center justify-between gap-4 md:gap-6 relative z-10 w-full px-2 md:px-4">
                <div className="flex items-center gap-4 md:gap-6 flex-grow">
                  <div
                    style={{ backgroundImage: "url(/image_frame.svg)" }}
                    className="w-16 h-16 md:w-20 md:h-20 bg-gray-400 rounded-full flex items-center justify-center flex-shrink-0"
                  >
                    <PiggyImage tokenId={pig.tokenId} />
                  </div>
                  <div className="flex flex-col flex-grow">
                    <div className="flex items-center gap-2 mb-2">
                      <img
                        src="/piggyname.svg"
                        alt="name"
                        className="w-5 h-5"
                      />

                      <h3 className="text-base md:text-xl font-bold text-gray-800 leading-none">
                        {pig.name || `Piggy #${pig.tokenId}`}
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-gray-600">
                      <StatItem
                        icon="/health.svg"
                        label="Health"
                        value={Number(pig.piggyHealth)}
                      />
                      <StatItem
                        icon="/amount.svg"
                        label="Balance (sonic)"
                        value={formatEther(pig.totalSaved)}
                      />
                      <StatItem
                        icon="/goal.svg"
                        label="Goal (sonic)"
                        value={formatEther(pig.goalAmount)}
                      />
                      <StatItem
                        icon="/pigin.svg"
                        label="Pledge (sonic)"
                        value={formatEther(pig.pledgeAmount)}
                      />
                      <StatItem
                        icon="/cycle.svg"
                        label="Next Cycle"
                        value={nextCycleDate}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0 relative z-10">
                  <button
                    className="relative w-24 h-10 cursor-pointer hover:scale-110  md:w-32 md:h-12 font-Pixel bg-contain bg-center bg-no-repeat flex items-center justify-center text-white font-bold text-sm md:text-base hover:opacity-80 transition-opacity"
                    style={{ backgroundImage: "url(/add_to_piggy.svg)" }}
                    onClick={() => pigIn(pig.pledgeAmount, pig.tokenId)}
                  >
                    Pig In
                  </button>

                  <BreakPiggyButton
                    tokenId={pig.tokenId}
                    onStatusChange={onStatusChange}
                    onSuccess={onSuccess}
                  />
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <p className="text-center text-gray-500 mt-8">
          No active piggies found.
        </p>
      )}
    </div>
  );
};

export default function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("idle");
  const account = useAccount();

  const [idleTokens, setIdleTokens] = useState([]);
  const [activePiggies, setActivePiggies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [status, onStatusChange] = useState(null);
  const [isDepositing, setIsDepositing] = useState(false);

  const config = useConfig();
  const [searchParams] = useSearchParams();

  const [isDialogActive, setIsDialogActive] = useState(false);
  const [selectedTokenId, setSelectedTokenId] = useState(null);

  const getFrameSvg = (type) => {
    if (type >= 9) return "/diamond_inactive_frame.svg";
    if (type >= 7) return "/gold_inactive_frame.svg";
    if (type >= 6) return "/silver_inactive_frame.svg";
    if (type >= 5) return "/bronze_inactive_frame.svg";
    return "/basic_inactive_frame.svg";
  };

  const PiggyNames = (type) => {
    if (type >= 9) return "Diamond Piggy";
    if (type >= 7) return "Gold Piggy";
    if (type >= 6) return "Silver Piggy";
    if (type >= 5) return "Bronze Piggy";
    return "Basic Piggy";
  };

  useEffect(() => {
    const statusParam = searchParams.get("status");
    if (statusParam === "new") {
      setActiveTab("idle");
    }
  }, [searchParams]);

  const fetchPiggyData = async () => {
    if (account.status !== "connected") {
      setIdleTokens([]);
      setActivePiggies([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      if (activeTab === "idle") {
        const rawIdleData = await readContract(config, {
          address: contract.contract_address,
          abi: master_abi,
          functionName: "user_idle_tokens",
          account: account.address,
        });
        const formattedIdleTokens = rawIdleData.map((token) => ({
          tokenId: Number(token.tokenId),
          tokenType: Number(token.tokenType),
        }));
        setIdleTokens(formattedIdleTokens);
        setActivePiggies([]);
      } else if (activeTab === "active") {
        const rawActiveData = await readContract(config, {
          address: contract.contract_address,
          abi: master_abi,
          functionName: "user_active_tokens",
          account: account.address,
        });
        const [tokenIds, piggyData] = rawActiveData;
        const formattedActivePiggies = tokenIds.map((id, index) => {
          const data = piggyData[index];
          return {
            tokenId: Number(id),
            totalSaved: data.totalSaved,
            depositCount: data.depositCount,
            startTime: data.startTime,
            lastDeposit: data.lastDeposit,
            pledgeAmount: data.pledgeAmount,
            cycle: data.cycle,
            nextExpectedPaymentTimeRange: data.nextExpectedPaymentTimeRange,
            goalAmount: data.goalAmount,
            piggyHealth: data.piggyHealth,
          };
        });
        setActivePiggies(formattedActivePiggies);
        setIdleTokens([]);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch piggies.");
    } finally {
      setIsLoading(false);
    }
  };

  const pigIn = async (pledgeAmount, tokenId) => {
    if (isDepositing) return;
    setIsDepositing(true);
    let statusTimer;
    const clearStatus = () => {
      if (statusTimer) clearTimeout(statusTimer);
      statusTimer = setTimeout(() => onStatusChange(null), 5000);
    };

    try {
      onStatusChange({ status: "info", message: "Preparing deposit..." });
      const { request } = await simulateContract(config, {
        address: contract.contract_address,
        abi: master_abi,
        functionName: "depositToPiggy",
        args: [tokenId],
        value: pledgeAmount,
        account: account.address,
      });

      onStatusChange({ status: "info", message: "Confirm in wallet..." });
      const hash = await writeContract(config, request);

      onStatusChange({ status: "loading", message: "Depositing...", hash });
      const receipt = await waitForTransactionReceipt(config, { hash });

      if (receipt.status === "success") {
        onStatusChange({
          status: "success",
          message: `Deposit for Piggy #${tokenId} successful!`,
          hash,
        });
        clearStatus();
        fetchPiggyData();
      } else {
        throw new Error("Transaction reverted.");
      }
    } catch (err) {
      console.error("Deposit Error:", err);
      onStatusChange({
        status: "error",
        message: err.shortMessage || "Deposit failed.",
      });
      clearStatus();
    } finally {
      setIsDepositing(false);
      clearStatus();
    }
  };

  useEffect(() => {
    fetchPiggyData();
  }, [activeTab, account.address, config, status]);

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen p-8 mt-25">
        <div className="flex flex-col gap-8 bg-[#F7F7F7] rounded-3xl px-8 md:px-16 py-12 w-full max-w-5xl">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#F8A4B6] mb-2 font-Pixel">
              My Farm
            </h1>
          </div>
          <div className="flex justify-center gap-4 border-b border-gray-300">
            <button
              onClick={() => setActiveTab("active")}
              className={`py-2 px-4 font-bold cursor-pointer ${
                activeTab === "active"
                  ? "text-pink-500 border-b-2 border-pink-500"
                  : "text-gray-500"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setActiveTab("idle")}
              className={`py-2 px-4 font-bold cursor-pointer ${
                activeTab === "idle"
                  ? "text-pink-500 border-b-2 border-pink-500"
                  : "text-gray-500"
              }`}
            >
              Idle
            </button>
          </div>
          {isLoading && <p className="text-center">Loading Piggies...</p>}
          {error && <p className="text-center text-red-500">{error}</p>}
          {!isLoading && !error && activeTab === "active" && (
            <ActivePiggies
              piggies={activePiggies}
              searchTerm={searchTerm}
              pigIn={pigIn}
              onStatusChange={onStatusChange}
              onSuccess={fetchPiggyData}
            />
          )}
          {!isLoading && !error && activeTab === "idle" && (
            <div className="p-8 text-center text-gray-500 flex justify-center flex-wrap gap-8">
              {idleTokens.length > 0 ? (
                idleTokens.map((piggy) => (
                  <div
                    className="bg-white rounded-lg p-6 shadow-md flex flex-col items-center gap-7"
                    key={piggy.tokenId}
                  >
                    <div className="w-44 h-44 flex items-center justify-center ">
                      <div className="relative z-10">
                        <img
                          src={getFrameSvg(piggy.tokenType)}
                          alt="piggy frame"
                          className="w-full h-full object-contain"
                        />

                        <div
                          onClick={() => {
                            setIsDialogActive(true);
                            setSelectedTokenId(piggy.tokenId);
                          }}
                          className="absolute w-39 h-39 top-32 left-[8px] hover:top-28 transition-all cursor-pointer "
                        >
                          <img
                            src="/piggy_activation_button.svg"
                            alt="Activate"
                            className=""
                          />
                          <h1 className=" font-Pixel capitalize  text-blue-100 absolute left-12 top-5 ">
                            TURN ON
                          </h1>
                        </div>
                        <div className="absolute w-full -top-9 object-cover scale-90 -z-10 ">
                          <PiggyImage tokenId={piggy.tokenId} />
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <span className="font-bold capitaliz select-none">
                        {PiggyNames(piggy.tokenType)}
                      </span>
                      <p className="text-sm text-gray-400 select-none ">
                        Token #{piggy.tokenId}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p>No idle piggies found.</p>
              )}
            </div>
          )}
        </div>
      </div>
      {isDialogActive && (
        <Activate_piggy_dialouge
          tokenId={selectedTokenId}
          setSelectedTokenId={setSelectedTokenId}
          setIsDialogActive={setIsDialogActive}
          onStatusChange={onStatusChange}
        />
      )}
      {status && (
        <div className="px-5 py-5 bg-white fixed bottom-10 right-5 w-fit max-w-[300px] flex gap-3 rounded-3xl drop-shadow-2xl items-center select-none z-50">
          <img
            src={
              status.status === "success"
                ? "/success-check.svg"
                : "/loading.svg"
            }
            className={`w-7 h-7 select-none ${
              status.status === "success" ? "" : "animate-spin"
            }`}
            alt={status.status}
          />
          <div className="font-Pixel select-none">{status.message}</div>
        </div>
      )}
    </>
  );
}
