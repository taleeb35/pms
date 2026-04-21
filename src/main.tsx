import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerPWA } from "./lib/registerPWA";

createRoot(document.getElementById("root")!).render(<App />);

// Register the PWA service worker (no-op in preview/iframe).
registerPWA();
