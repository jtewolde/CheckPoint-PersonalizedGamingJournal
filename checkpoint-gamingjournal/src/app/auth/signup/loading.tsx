"use client";

import { LoadingOverlay } from "@mantine/core";

export default function Loading() {
  return (
    <div style={{ position: "relative", height: "100vh" }}>
      <LoadingOverlay
          visible
          zIndex={1000}
          overlayProps={{
              radius: "sm",
              blur: 2,
              backgroundOpacity: 0.7,
              color: "#282828ff" // consistent dark background
          }}
          loaderProps={{
              color: "grape", // consistent loader color
              type: "bars"
          }}
        />
    </div>
  );
}