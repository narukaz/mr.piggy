import React from "react";

function Navbar() {
  return (
    <div className="flex justify-between gap-3 text-white text-2xl bg-[#2E2E2E] py-3 px-3 max-w-5xl absolute left-1/2 top-12 -translate-x-1/2 rounded-4xl  ">
      <button className="cursor-pointer px-4 hover:text-amber-50 hover:bg-[#70625e] hover:rounded-4xl transition-all">
        Market
      </button>

      <button className="cursor-pointer px-4 hover:text-amber-50 hover:bg-[#70625e] hover:rounded-4xl transition-all">
        Farm
      </button>

      <button className="cursor-pointer px-4 hovser:text-amber-50 hover:bg-[#70625e] hover:rounded-4xl transition-all">
        Scoreboard
      </button>
    </div>
  );
}

export default Navbar;
