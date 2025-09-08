import React, { useState, useEffect } from "react";
import { useReadContract } from "wagmi";
import master_abi from "../ABI/abi.json"; //
import contract from "../contract/contract.json"; // Adjust path to your contract address

/**
 * A component that fetches and displays the image for a specific NFT tokenId.
 * @param {object} props
 * @param {number} props.tokenId - The ID of the token to display the image for.
 */
function PiggyImage({ tokenId }) {
  // --- STATE MANAGEMENT ---
  const [imageUrl, setImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- WAGMI HOOK TO GET THE TOKEN URI ---
  // This hook calls the `tokenURI(tokenId)` function from your smart contract.
  const { data: tokenUri, error: uriError } = useReadContract({
    address: contract.contract_address,
    abi: master_abi,
    functionName: "tokenURI",
    args: [tokenId],
  });

  // --- USEEFFECT TO FETCH METADATA FROM THE URI ---
  useEffect(() => {
    // This effect runs whenever the tokenUri is successfully fetched.
    if (!tokenUri) return;

    const fetchMetadata = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch the JSON file from the URI provided by the contract.
        const response = await fetch(tokenUri);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const metadata = await response.json();

        // Extract the 'image' field from the JSON and update our state.
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
  }, [tokenUri]); // Dependency array ensures this runs when tokenUri changes.

  // --- RENDER LOGIC ---

  // Show a loading placeholder
  if (isLoading) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-200 rounded-full w-full h-full`}
      >
        <svg
          className="w-8 h-8 text-gray-400 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </div>
    );
  }

  // Show an error message
  if (error || uriError) {
    return (
      <div
        className={`flex items-center justify-center bg-red-100 rounded-full w-full h-full`}
      >
        <span className="text-red-500 text-xs text-center">Load Failed</span>
      </div>
    );
  }

  // Display the final image
  return (
    <img
      src={imageUrl}
      alt={`Piggy #${tokenId}`}
      className={`object-cover rounded-full w-full h-full`}
    />
  );
}

export default PiggyImage;
