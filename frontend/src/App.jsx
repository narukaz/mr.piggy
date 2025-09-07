import { Outlet, Route, Routes } from "react-router-dom";
import "./App.css";
import Header from "./component/Header";
import Race from "./component/Race";
import Farm from "./component/Farm";
import Market from "./component/Market";
import Home from "./component/Home";

function App() {
  return (
    <div className="bg-[url('/bg.jpg')] bg-center bg-cover bg-no-repeat bg-fixed min-h-screen">
      <Header />
      <Routes>
        <Route path="Race" element={<Race />} />
        <Route path="farm" element={<Farm />} />
        <Route path="market" element={<Market />} />
        <Route path="/" element={<Home />} />
      </Routes>
      <Outlet />
    </div>
  );
}

export default App;
