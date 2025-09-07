import React, { useState } from "react";
import Navbar from "./Header/Navbar";
import { ConnectButton } from "@rainbow-me/rainbowkit";

function Header() {
  function onHover() {}
  return (
    <div className="flex w-full items-center">
      <div className="text-white px-4 py-5 absolute right-48  top-8 bg-black  -translate-x-1/2 text-xl font-medium cursor-pointer">
        <div className="py-2 ml-auto flex gap-5 items-center">
          <ConnectButton
            accountStatus="avatar"
            label="Connect Wallet"
            showBalance={true}
          />
        </div>
      </div>
      <Navbar />
    </div>
  );
}

export default Header;
