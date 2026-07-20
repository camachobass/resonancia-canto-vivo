import { ImageResponse } from "next/og";

export const alt = "Resonance: The Living Song — listen, create, compare, restore";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        overflow: "hidden",
        color: "#f4f0df",
        background:
          "radial-gradient(circle at 77% 48%, #34745c 0%, #102c22 29%, transparent 54%), linear-gradient(135deg, #061611, #0c281f)",
        fontFamily: "Georgia, serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 470,
          height: 470,
          right: 80,
          top: 75,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid rgba(200,240,90,.38)",
          borderRadius: "50%",
          boxShadow: "inset 0 0 90px rgba(126,228,186,.14), 0 0 90px rgba(126,228,186,.12)",
        }}
      >
        <div
          style={{
            width: 240,
            height: 240,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            background: "radial-gradient(circle, #dfff91 0 12%, #7ee4ba 13% 34%, #246b51 35% 100%)",
            fontSize: 72,
            color: "#11291f",
          }}
        >
          ♪
        </div>
      </div>

      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          width: 760,
          padding: "70px 0 65px 75px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 42 }}>
          <div
            style={{
              width: 48,
              height: 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid #c8f05a",
              borderRadius: "50%",
              color: "#c8f05a",
              fontSize: 24,
            }}
          >
            R
          </div>
          <div style={{ display: "flex", fontFamily: "Arial", fontSize: 16, fontWeight: 700, letterSpacing: 5 }}>
            RESONANCE
          </div>
        </div>
        <div style={{ display: "flex", fontFamily: "monospace", color: "#c8f05a", fontSize: 17, fontWeight: 700, letterSpacing: 5 }}>
          THE LIVING
        </div>
        <div style={{ display: "flex", color: "#c8f05a", fontSize: 118, lineHeight: 0.9, letterSpacing: -7 }}>
          SONG
        </div>
        <div style={{ display: "flex", marginTop: 34, fontFamily: "Arial", color: "rgba(244,240,223,.78)", fontSize: 23 }}>
          Listen · Create · Compare · Restore
        </div>
        <div style={{ display: "flex", marginTop: "auto", fontFamily: "monospace", color: "rgba(244,240,223,.5)", fontSize: 14, letterSpacing: 3 }}>
          OPENAI BUILD WEEK · BILINGUAL MUSICAL ADVENTURE
        </div>
      </div>
    </div>,
    size,
  );
}
