import React, { useState, useEffect } from "react";
import { useReadContract } from "wagmi";
import master_abi from "../ABI/abi.json";
import contract from "../contract/contract.json";

function PiggyImage({ tokenId }) {
  const [imageUrl, setImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const { data: tokenUri, error: uriError } = useReadContract({
    address: contract.contract_address,
    abi: master_abi,
    functionName: "tokenURI",
    args: [tokenId],
  });

  useEffect(() => {
    if (!tokenUri) return;

    const fetchMetadata = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(tokenUri);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const metadata = await response.json();

        if (metadata.image) {
          setImageUrl(metadata.image);
        } else {
          throw new Error("Image field not found in metadata");
        }
      } catch (err) {
        console.error("Failed to fetch metadata:", err);
        setError("Could not load image.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetadata();
  }, [tokenUri]);

  if (isLoading) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-200 rounded-full w-full h-full`}
      >
        <img src="/success-check.svg" />
      </div>
    );
  }

  if (error || uriError) {
    return (
      <div
        className={`flex items-center justify-center bg-red-100 rounded-full w-full h-full`}
      >
        <span className="text-red-500 text-xs text-center">Load Failed</span>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={`Piggy #${tokenId}`}
      className={`object-cover rounded-full w-full h-full`}
    />
  );
}

export default PiggyImage;
