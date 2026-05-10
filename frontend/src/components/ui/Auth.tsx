export const AuthShell = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      position: "relative",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
      overflow: "hidden",
      background: "linear-gradient(160deg,#0c1e40 0%,#0a2a52 50%,#0c2244 100%)",
    }}
  >
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        backgroundImage:
          "linear-gradient(rgba(2,132,199,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(2,132,199,0.04) 1px,transparent 1px)",
        backgroundSize: "48px 48px",
      }}
    />
    <div
      style={{
        position: "absolute",
        top: "-15%",
        left: "-10%",
        width: 560,
        height: 560,
        borderRadius: "50%",
        background:
          "radial-gradient(circle,rgba(2,132,199,0.12) 0%,transparent 65%)",
        pointerEvents: "none",
      }}
    />
    <div
      style={{
        position: "absolute",
        bottom: "-15%",
        right: "-10%",
        width: 480,
        height: 480,
        borderRadius: "50%",
        background:
          "radial-gradient(circle,rgba(8,145,178,0.09) 0%,transparent 65%)",
        pointerEvents: "none",
      }}
    />
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 1,
        background:
          "linear-gradient(90deg,transparent,rgba(14,165,233,0.60),rgba(56,189,248,0.40),transparent)",
        pointerEvents: "none",
      }}
    />
    {children}
  </div>
);

export const AuthCard = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      position: "relative",
      width: "100%",
      maxWidth: 440,
      borderRadius: 22,
      padding: 32,
      background:
        "linear-gradient(135deg,rgba(10,22,40,0.97),rgba(6,13,31,0.99))",
      border: "1px solid rgba(14,165,233,0.16)",
      boxShadow: "0 40px 80px rgba(0,0,0,0.60),0 0 60px rgba(2,132,199,0.08)",
    }}
  >
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 32,
        right: 32,
        height: 1,
        background:
          "linear-gradient(90deg,transparent,rgba(14,165,233,0.60),rgba(56,189,248,0.40),transparent)",
      }}
    />
    {children}
  </div>
);

export const LogoMark = () => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      marginBottom: 28,
    }}
  >
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: 12,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg,rgba(2,132,199,0.28),rgba(8,145,178,0.20))",
        border: "1px solid rgba(14,165,233,0.35)",
        boxShadow: "0 0 22px rgba(2,132,199,0.25)",
      }}
    >
      <span style={{ fontSize: 16 }}>⚡</span>
    </div>
    <h1
      style={{
        fontSize: 20,
        fontWeight: 800,
        fontFamily: "'Syne',sans-serif",
        color: "#f0f9ff",
        lineHeight: 1,
      }}
    >
      SpendNub<span style={{ color: "#38bdf8" }}>.</span>
    </h1>
  </div>
);

export const Divider = () => (
  <div
    style={{ margin: "24px 0", height: 1, background: "rgba(2,132,199,0.12)" }}
  />
);
