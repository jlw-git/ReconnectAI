import { ImageResponse } from "next/og"

export const alt = "ReconnectAI — Intelligent CRM for Real Estate"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          background:
            "radial-gradient(ellipse at top left, #1e1b4b 0%, #0f172a 60%, #020617 100%)",
          padding: "80px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              width: "88px",
              height: "88px",
              borderRadius: "20px",
              background: "#6366f1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 20px 60px rgba(99, 102, 241, 0.45)",
            }}
          >
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <span
            style={{
              fontSize: "60px",
              fontWeight: 700,
              color: "white",
              letterSpacing: "-0.02em",
            }}
          >
            ReconnectAI
          </span>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: "56px",
            fontWeight: 700,
            color: "white",
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
            maxWidth: "1000px",
            marginBottom: "24px",
          }}
        >
          Intelligent CRM for Real Estate
        </div>

        <div
          style={{
            display: "flex",
            fontSize: "28px",
            color: "#94a3b8",
            lineHeight: 1.4,
            maxWidth: "900px",
          }}
        >
          Reactivate dormant clients with personalized market insights and
          automated outreach.
        </div>
      </div>
    ),
    { ...size },
  )
}
