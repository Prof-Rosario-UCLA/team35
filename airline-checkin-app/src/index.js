import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import SeatSelection from "./pages/SeatSelection";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/select-seat/:flightId" element={<SeatSelection />} />
        <Route path="*" element={<p style={{ padding: "2rem", textAlign: "center" }}>404</p>} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
