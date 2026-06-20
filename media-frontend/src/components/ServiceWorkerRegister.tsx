"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          // registration successful
          // console.log('SW registered', reg);
        })
        .catch((err) => {
          // console.warn('SW registration failed', err);
        });
    }
  }, []);

  return null;
}
