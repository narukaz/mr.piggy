import React, { useState } from "react";
import Navbar from "./Header/Navbar";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

function Header() {
  const { isConnected, _ } = useAccount();

  return (
    <div className="flex w-full items-center">
      <div className="absolute right-8 top-[42px] bg-[#1A1B1F] p-1 z-10">
        <ConnectButton
          className={"bg-black"}
          accountStatus="avatar"
          label="Connect Wallet"
          showBalance={true}
        />
      </div>
      <div
        className={`absolute  ${
          isConnected
            ? "right-13 top-[33px] bg-[#1A1B1F] px-14"
            : "right-13 top-[33px] bg-[#1A1B1F] px-14"
        } py-[33.5px]`}
      ></div>

      <Navbar />
    </div>
  );
}

export default Header;
