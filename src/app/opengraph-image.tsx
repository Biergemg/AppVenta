import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "POS Evento Minibasket";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #f7faf6 0%, #ffffff 58%, #edf8e8 100%)",
          color: "#071522",
          padding: 72,
          fontFamily: "Arial",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div
            style={{
              background: "#d8f4cf",
              color: "#2c6508",
              borderRadius: 999,
              padding: "16px 28px",
              fontSize: 30,
              fontWeight: 900,
            }}
          >
            Sede activa
          </div>
          <div style={{ color: "#2c6508", fontSize: 34, fontWeight: 900 }}>POS Evento</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 78, fontWeight: 900, lineHeight: 1.02 }}>
            Minibasket Tampico
          </div>
          <div style={{ width: 820, color: "#445464", fontSize: 38, fontWeight: 700, lineHeight: 1.2 }}>
            Ventas, inflable, caja e inventario en una app clara para celular.
          </div>
        </div>

        <div style={{ display: "flex", gap: 18 }}>
          {["Vender", "Inflable", "Resumen", "Caja"].map((label) => (
            <div
              key={label}
              style={{
                background: label === "Vender" ? "#347a05" : "#ffffff",
                color: label === "Vender" ? "#ffffff" : "#071522",
                border: "2px solid #d6ddd2",
                borderRadius: 28,
                padding: "22px 34px",
                fontSize: 32,
                fontWeight: 900,
                boxShadow: "0 16px 34px rgba(7, 21, 34, 0.08)",
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    size
  );
}
