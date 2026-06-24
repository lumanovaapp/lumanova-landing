"use client";

import { Toaster } from "react-hot-toast";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 5000,
          style: {
            background: "#1A1A1A",
            color: "#F8F4E3",
            border: "1px solid rgba(244, 196, 48, 0.2)",
            borderRadius: "14px",
            fontFamily: "var(--font-inter)",
            fontSize: "14px",
            padding: "14px 18px",
          },
        }}
      />
    </>
  );
}
