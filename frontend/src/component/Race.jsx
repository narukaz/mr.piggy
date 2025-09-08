import React, { useState, useEffect } from "react";
import { useAccount, useConfig } from "wagmi";
import {
  useSimulateContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import master_abi from "../ABI/abi.json";
import contract from "../contract/contract.json";
import { formatEther, parseEther } from "viem";
import { readContract } from "wagmi/actions";
import PiggyImage from "./PiggyImage";

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

const JoinRaceButton = ({ onStatusChange, onSuccess }) => {
  const { data: simulation, error: simulationError } = useSimulateContract({
    address: contract.contract_address,
    abi: master_abi,
    functionName: "JoinRace",
    value: parseEther("0.5"),
  });

  const { data: hash, isPending, writeContract } = useWriteContract();
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    let timer;
    if (isSuccess) {
      onStatusChange({
        status: "success",
        message: "Successfully joined the race!",
      });
      onSuccess();
      timer = setTimeout(() => onStatusChange(null), 3000);
    }
    const error = simulationError;
    if (error) {
      onStatusChange({
        status: "error",
        message: error.shortMessage || "Cannot join race.",
      });
      timer = setTimeout(() => onStatusChange(null), 5000);
    }
    return () => clearTimeout(timer);
  }, [isSuccess, simulationError, onStatusChange, onSuccess]);

  const handleJoin = () => {
    if (simulation?.request) {
      writeContract(simulation.request);
    }
  };

  return (
    <div
      className="absolute right-7 top-11 hover:scale-110 transition-all cursor-pointer"
      onClick={handleJoin}
    >
      <img src="/race_active.svg" className="w-40" alt="Join Race" />
      <h3 className="absolute top-4 left-7 font-bold text-2xl text-white text-center font-Pixel">
        {isPending ? "Confirm..." : isLoading ? "Joining..." : "Join Race"}
      </h3>
    </div>
  );
};

const PigInRaceButton = ({
  tokenId,
  pledgeAmount,
  onStatusChange,
  onSuccess,
  isRaceActive,
}) => {
  const { data: simulation, error: simulationError } = useSimulateContract({
    address: contract.contract_address,
    abi: master_abi,
    functionName: "depositToPiggy",
    args: [tokenId],
    value: pledgeAmount,
  });

  const { data: hash, isPending, writeContract } = useWriteContract();
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    let timer;
    if (isSuccess) {
      onStatusChange({
        status: "success",
        message: `Deposit for #${tokenId} successful!`,
      });
      onSuccess();
      timer = setTimeout(() => onStatusChange(null), 3000);
    }
    const error = simulationError;
    if (error) {
      onStatusChange({
        status: "error",
        message: error.shortMessage || `Deposit for #${tokenId} failed.`,
      });
      timer = setTimeout(() => onStatusChange(null), 5000);
    }
    return () => clearTimeout(timer);
  }, [isSuccess, simulationError, onStatusChange, onSuccess, tokenId]);

  const handlePigIn = () => {
    if (simulation?.request) {
      writeContract(simulation.request);
    }
  };

  return (
    <button
      onClick={handlePigIn}
      disabled={isRaceActive}
      className={`relative hover:scale-110 w-24 h-10 md:w-32 md:h-12 cursor-pointer font-Pixel bg-contain bg-center bg-no-repeat flex items-center justify-center text-white font-bold text-sm md:text-base transition-opacity disabled:opacity-50 ${
        isRaceActive ? "cursor-not-allowed" : "cursor-pointer"
      }`}
      style={{ backgroundImage: "url(/add_to_piggy.svg)" }}
    >
      {isPending ? "Confirm..." : isLoading ? "Depositing..." : "Pig In"}
    </button>
  );
};

const QuitRaceButton = ({ tokenId, onStatusChange, onSuccess }) => {
  const { data: simulation, error: simulationError } = useSimulateContract({
    address: contract.contract_address,
    abi: master_abi,
    functionName: "quit_race",
    args: [tokenId],
  });

  const { data: hash, isPending, writeContract } = useWriteContract();
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash });

  React.useEffect(() => {
    let timer;
    if (isSuccess) {
      onStatusChange({
        status: "success",
        message: `Quit race for #${tokenId}!`,
      });
      onSuccess();
      timer = setTimeout(() => onStatusChange(null), 3000);
    }
    const error = simulationError;
    if (error) {
      onStatusChange({
        status: "error",
        message: error.shortMessage || `Failed to quit race.`,
      });
      timer = setTimeout(() => onStatusChange(null), 5000);
    }
    return () => clearTimeout(timer);
  }, [isSuccess, simulationError, onStatusChange, onSuccess, tokenId]);

  const handleQuit = () => {
    if (simulation?.request) {
      writeContract(simulation.request);
    }
  };

  return (
    <button
      onClick={handleQuit}
      disabled={!simulation?.request || isPending || isLoading}
      className="relative w-24 h-10 md:w-32 hover:scale-110 md:h-12 cursor-pointer font-Pixel bg-contain bg-center bg-no-repeat flex items-center justify-center text-white font-bold text-sm md:text-base transition-opacity disabled:opacity-50"
      style={{ backgroundImage: "url(/break_button.svg)" }}
    >
      {isPending ? "Confirm..." : isLoading ? "Quitting..." : "Quit"}
    </button>
  );
};

// --- Main Race Component ---
function Race() {
  const [raceDetails, setRaceDetails] = useState(null);
  const [userRacingPiggies, setUserRacingPiggies] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [status, setStatus] = React.useState(null);

  const account = useAccount();
  const config = useConfig();

  const isRaceActive =
    raceDetails &&
    !raceDetails.finished &&
    Date.now() >= raceDetails.startTime * 1000;

  const fetchRaceData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const totalRaces = await readContract(config, {
        address: contract.contract_address,
        abi: master_abi,
        functionName: "total_races",
      });
      const raceCount = Number(totalRaces);

      if (raceCount > 0) {
        const latestRaceIndex = raceCount - 1;
        const data = await readContract(config, {
          address: contract.contract_address,
          abi: master_abi,
          functionName: "getRace",
          args: [latestRaceIndex],
        });
        setRaceDetails({
          startTime: Number(data.startTime),
          endTime: Number(data.endTime),
          goalAmount: data.goalAmount,
          cycleAmount: data.cycleAmount,
          cycle: Number(data.cycle),
          finished: data.finished,
          participantCount: data.participants.length,
          reward: data.reward,
        });
      }

      if (account.status === "connected") {
        const userPiggiesRaw = await readContract(config, {
          address: contract.contract_address,
          abi: master_abi,
          functionName: "getUserRacingPiggies",
          args: [account.address],
        });
        const [tokenIds, piggyData] = userPiggiesRaw;
        const formattedPiggies = tokenIds.map((id, index) => ({
          tokenId: Number(id),
          ...piggyData[index],
        }));
        setUserRacingPiggies(formattedPiggies);
      }
    } catch (error) {
      console.error("Failed to fetch race data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [account.status, config]);

  React.useEffect(() => {
    fetchRaceData();
  }, [fetchRaceData]);

  const canJoinRace =
    raceDetails &&
    !raceDetails.finished &&
    Date.now() < raceDetails.startTime * 1000;

  if (isLoading) {
    return (
      <div className="text-center p-12 font-Pixel">Loading Race Details...</div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 mt-25">
      <div className="flex flex-col gap-8 bg-[#F7F7F7] rounded-3xl px-8 md:px-16 py-12 w-full max-w-5xl">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#F8A4B6] mb-2 font-Pixel">
            Let's go Oink-Oink
          </h1>
          <p className="text-lg md:text-xl text-gray-500 font-medium mb-4">
            One person’s penalty is another person’s reward
          </p>
        </div>

        {!raceDetails ? (
          <div className="text-center text-gray-500 font-Pixel">
            No active race found.
          </div>
        ) : (
          <div className="relative">
            <img src="/race_card.svg" alt="Race Information" />
            {canJoinRace ? (
              <JoinRaceButton
                onStatusChange={setStatus}
                onSuccess={fetchRaceData}
              />
            ) : (
              <div className="absolute right-7 top-11 cursor-not-allowed">
                <img
                  src="/race_disabled.svg"
                  className="w-40"
                  alt="Race Disabled"
                />
                <h3 className="absolute top-4 left-10 font-bold text-2xl text-white text-center font-Pixel">
                  {raceDetails.finished ? "Finished" : "Begun"}
                </h3>
              </div>
            )}
            <div className="absolute px-7 left-20 top-9 flex gap-10 scale-75">
              <div className="flex flex-col gap-3">
                <h3 className="text-[#ED981D] text-2xl select-none font-Pixel">
                  Start Time:{" "}
                  <span className="font-sans">
                    {new Date(raceDetails.startTime * 1000).toLocaleString()}
                  </span>
                </h3>
                <h3 className="text-[#ED981D] text-2xl select-none font-Pixel">
                  End Time:{" "}
                  <span className="font-sans">
                    {new Date(raceDetails.endTime * 1000).toLocaleString()}
                  </span>
                </h3>
              </div>
              <div className="flex flex-col gap-4">
                <h3 className="text-[#ED981D] text-2xl select-none font-Pixel">
                  Participants:{" "}
                  <span className=" font-sans">
                    {raceDetails.participantCount}
                  </span>
                </h3>
                <h3 className="text-[#ED981D] text-2xl select-none font-Pixel">
                  Rewards:{" "}
                  <span className="font-sans">
                    {formatEther(raceDetails.reward)} Sonics
                  </span>
                </h3>
              </div>
            </div>
          </div>
        )}

        <div>
          <p className="text-lg md:text-xl text-gray-500 font-medium mb-4 text-center">
            Your Racing Piggies
          </p>
          {userRacingPiggies.length > 0 ? (
            userRacingPiggies.map((pig) => (
              <div
                key={pig.tokenId}
                className="relative flex items-stretch gap-4 md:gap-6 p-4 md:p-6 bg-white rounded-xl shadow-sm border border-gray-200"
              >
                <div
                  className="absolute inset-0 bg-no-repeat bg-contain bg-center z-0"
                  style={{ backgroundImage: `url(/diamond_frame.svg)` }}
                />
                <div className="flex items-center justify-between gap-4 md:gap-6 relative z-10 w-full px-2 md:px-4">
                  <div className="flex items-center gap-4 md:gap-6 flex-grow">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-400 rounded-full flex items-center justify-center flex-shrink-0">
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
                          Piggy #{pig.tokenId}
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
                          label="Balance"
                          value={`${formatEther(pig.totalSaved)} Sonics`}
                        />
                        <StatItem
                          icon="/goal.svg"
                          label="Goal"
                          value={`${formatEther(pig.goalAmount)} Sonics`}
                        />
                        <StatItem
                          icon="/pigin.svg"
                          label="Pledge"
                          value={`${formatEther(pig.pledgeAmount)} Sonics`}
                        />
                        <StatItem
                          icon="/cycle.svg"
                          label="Next Cycle"
                          value={new Date(
                            Number(pig.nextExpectedPaymentTimeRange) * 1000
                          ).toLocaleDateString()}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0 relative z-10">
                    <PigInRaceButton
                      tokenId={pig.tokenId}
                      pledgeAmount={pig.pledgeAmount}
                      onStatusChange={setStatus}
                      onSuccess={fetchRaceData}
                      isRaceActive={!isRaceActive}
                    />
                    <QuitRaceButton
                      tokenId={pig.tokenId}
                      onStatusChange={setStatus}
                      onSuccess={fetchRaceData}
                    />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-400">
              You have no piggies in the current race.
            </p>
          )}
        </div>
      </div>
      {status && (
        <div className="px-5 py-5 bg-white fixed bottom-10 right-5 w-fit max-w-[300px] flex gap-3 rounded-3xl shadow-2xl items-center select-none z-50">
          <img
            src={
              status.status === "success"
                ? "/success-check.svg"
                : "/loading.svg"
            }
            className={`w-7 h-7 ${
              status.status !== "success" && "animate-spin"
            }`}
            alt="status icon"
          />
          <div className="font-Pixel">{status.message}</div>
        </div>
      )}
    </div>
  );
}

export default Race;
