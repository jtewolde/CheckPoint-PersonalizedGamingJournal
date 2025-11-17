"use client";

import GlobalLoader from "@/components/GlobalLoader/GlobalLoader";

export default function Loading() {
  return (
    <div style={{ position: "relative", height: "100vh" }}>
      <GlobalLoader
        visible
      />
    </div>
  );
}