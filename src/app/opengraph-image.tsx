import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "グリーン車通勤損益計算アプリ";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#10b981",
          backgroundImage: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "24px",
            padding: "80px",
          }}
        >
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              color: "white",
              textAlign: "center",
              lineHeight: 1.3,
            }}
          >
            通勤時間を価値に変えて、
            <br />
            グリーン車利用を賢く判断
          </div>
          <div
            style={{
              fontSize: 40,
              color: "rgba(255, 255, 255, 0.95)",
              textAlign: "center",
              lineHeight: 1.4,
              marginTop: "16px",
            }}
          >
            副業時給3000円なら年間26万円得する計算🚄
          </div>
          <div
            style={{
              fontSize: 32,
              color: "rgba(255, 255, 255, 0.85)",
              textAlign: "center",
              marginTop: "32px",
            }}
          >
            通勤時間の価値を可視化
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
