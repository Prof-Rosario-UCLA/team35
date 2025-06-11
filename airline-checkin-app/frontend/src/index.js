import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import SeatSelection from "./pages/SeatSelection";
import Login from "./pages/Login";
import AuthProvider, { AuthContext } from "./AuthContext";
import Admin from "./pages/Admin";
import Register from "./pages/Register";

import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import { ThemeProvider } from "./ThemeContext";
import CookieBanner from "./components/CookieBanner";
import { loadWasm } from "./utils/wasm";

loadWasm().then(() => {
  console.log("✅ WASM module loaded");
});


function PrivateRoute({ element }) {
  const { token } = React.useContext(AuthContext);
  return token ? element : <Navigate to="/login" replace />;
}

serviceWorkerRegistration.register();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<PrivateRoute element={<Dashboard />} />} />
              <Route path="/select-seat/:flightId" element={<PrivateRoute element={<SeatSelection />} />} />
              <Route path="/admin" element={<PrivateRoute element={<Admin />} />} />
              <Route path="*" element={<p className="container">404</p>} />
            </Routes>
            <CookieBanner />
          </>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>
);
