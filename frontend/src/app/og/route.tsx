import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

const gradient = "linear-gradient(135deg, #2563EB 0%, #7C3AED 60%, #F43F5E 100%)";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title")?.slice(0, 60) || "Blue Archive API";
  const subtitle = searchParams.get("subtitle")?.slice(0, 120) || "ブルーアーカイブの生徒データベース";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          backgroundImage: gradient,
          color: "white",
        }}
      >
        <div
          style={{
            fontSize: 36,
            fontWeight: 500,
            opacity: 0.85,
            marginBottom: 20,
          }}
        >
          {subtitle}
        </div>
        <div
          style={{
            fontSize: 88,
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            textShadow: "0 12px 30px rgba(15, 23, 42, 0.35)",
          }}
        >
          {title}
        </div>
        <div
          style={{
            marginTop: "auto",
            fontSize: 28,
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            gap: 12,
            opacity: 0.9,
          }}
        >
          <span
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 48,
              height: 48,
              borderRadius: "50%",
              backgroundColor: "rgba(255,255,255,0.16)",
              fontSize: 28,
            }}
          >
            🔎
          </span>
          bluearchive-api.skyia.jp
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
