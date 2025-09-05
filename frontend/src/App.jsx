import { Outlet, Route, Routes } from "react-router-dom";
import "./App.css";
import Header from "./component/Header";
import Scoreboard from "./component/Scoreboard";
import Farm from "./component/Farm";
import Market from "./component/Market";
import Home from "./component/Home";

function App() {
  return (
    <>
      <Routes>
        {/* <Route path="scoreboard" element={<Scoreboard />} />
        <Route path="farm" element={<Farm />} />
        <Route path="market" element={<Market />} />
        <Route path="home" element={<Home />} /> */}
      </Routes>
      <div className="bg-[#FFF8F5]">
        <Header />
        <Outlet />
        <div class="bg-[url('/bg.jpg')] bg-center bg-cover bg-no-repeat bg-fixed h-screen"></div>
      </div>
    </>
  );
}

export default App;
