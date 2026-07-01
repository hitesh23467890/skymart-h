// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App.tsx";
import { SocketProvider } from "./context/SocketContext";
import "leaflet/dist/leaflet.css";
import "./index.css";

// HashRouter works fine with base path
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HashRouter>
      <SocketProvider>
        <App />
      </SocketProvider>
    </HashRouter>
  </StrictMode>,
);
