import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import B7Suplementos from "./app/page";
import "./app/globals.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <B7Suplementos />
  </StrictMode>,
);
