export const Card = ({
  children,
  className = "",
  glow = "none",
  style,
}: {
  children: React.ReactNode;
  className?: string;
  glow?: "blue" | "cyan" | "none";
  style?: React.CSSProperties;
}) => {
  const g: React.CSSProperties =
    glow === "blue"
      ? {
          boxShadow: "0 0 28px rgba(2,132,199,0.14)",
          borderColor: "rgba(2,132,199,0.28)",
        }
      : glow === "cyan"
      ? {
          boxShadow: "0 0 28px rgba(8,145,178,0.12)",
          borderColor: "rgba(8,145,178,0.25)",
        }
      : {};
  return (
    <div
      className={className}
      style={{
        background: "#f0f9ff",
        border: "1px solid rgba(2,132,199,0.14)",
        borderRadius: 16,
        boxShadow: "0 1px 6px rgba(2,132,199,0.07)",
        overflow: "hidden",
        position: "relative",
        transition: "all 0.2s",
        ...g,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
