import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <>
      <div className="flex justify-between items-center gap-6 text-white text-base md:text-xl bg-transparent py-2 px-6 max-w-4xl absolute left-1/2 top-9 -translate-x-1/2 rounded-4xl shadow-md z-20">
        <Link
          to="market"
          className="cursor-pointer font-medium px-5 py-2 hover:text-white hover:bg-[#F8A4B6]  transition-all"
        >
          Market
        </Link>

        <Link
          to="farm"
          className="cursor-pointer font-medium px-5 py-2 hover:text-white hover:bg-[#F8A4B6]  transition-all"
        >
          Farm
        </Link>

        <Link
          to="race"
          className="cursor-pointer font-medium px-5 py-2 hover:text-white hover:bg-[#F8A4B6]  transition-all"
        >
          Race
        </Link>
      </div>
      <img
        src="/navbar.svg"
        className="absolute max-w-[450px] left-1/2 top-8 -translate-x-1/2  "
        alt="search bar bg"
      />
    </>
  );
}

export default Navbar;
