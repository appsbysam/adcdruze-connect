import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { getRouter } from "./router";
import "./styles.css";

const APP_VERSION = "0.1.0.1";
const router = getRouter();

function AppVersion() {
  return (
    <div
      aria-label={`App version ${APP_VERSION}`}
      style={{
        position: "fixed",
        right: 10,
        bottom: "calc(env(safe-area-inset-bottom, 0px) + 76px)",
        zIndex: 9998,
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: "0.02em",
        color: "rgba(15, 23, 42, 0.58)",
        background: "rgba(255,255,255,.72)",
        border: "1px solid rgba(148,163,184,.28)",
        borderRadius: 999,
        padding: "3px 7px",
        backdropFilter: "blur(8px)",
      }}
    >
      v{APP_VERSION}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
    <AppVersion />
  </React.StrictMode>,
);

requestAnimationFrame(() => {
  const splash = document.getElementById("app-splash");
  if (splash) {
    splash.classList.add("hide");
    window.setTimeout(() => splash.remove(), 300);
  }
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`, {
      scope: import.meta.env.BASE_URL,
    }).catch((error) => console.warn("Service worker registration failed", error));
  });
}
