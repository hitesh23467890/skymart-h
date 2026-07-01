// src/Routes.tsx

import React from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import App from "./App";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/catalog" element={<App />} />
      <Route path="/wishlist" element={<App />} />
      <Route path="/cart" element={<App />} />
      <Route path="/dashboard" element={<App />} />
      <Route path="/designer-hub" element={<App />} />
      <Route path="/login" element={<App />} />
      <Route path="/register" element={<App />} />
      <Route path="/product/:id" element={<App />} />
      <Route path="/shop-together" element={<App />} />
      <Route path="/shop-together/:roomId" element={<App />} />
      <Route path="/skycoins" element={<App />} />
    </Routes>
  );
}
