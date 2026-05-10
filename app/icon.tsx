import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0a0a0a",
          color: "#fbbf24",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "monospace",
          fontWeight: 700,
          fontSize: 22,
          letterSpacing: -1,
        }}
      >
        AD
      </div>
    ),
    { ...size },
  );
}
