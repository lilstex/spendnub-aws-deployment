import React, { useRef, useEffect } from "react";
import { Loader2 } from "lucide-react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "violet";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}
export const Button = ({
  variant = "primary",
  size = "md",
  isLoading,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) => {
  const v: Record<ButtonVariant, React.CSSProperties> = {
    primary: {
      background: "linear-gradient(135deg,#0284c7,#0ea5e9)",
      color: "white",
      border: "none",
      boxShadow:
        "0 4px 16px rgba(2,132,199,0.35),inset 0 1px 0 rgba(255,255,255,0.15)",
    },
    secondary: {
      background: "rgba(2,132,199,0.08)",
      color: "#0284c7",
      border: "1.5px solid rgba(2,132,199,0.28)",
    },
    ghost: {
      background: "transparent",
      color: "#1e4976",
      border: "1.5px solid rgba(2,132,199,0.18)",
    },
    danger: {
      background: "linear-gradient(135deg,#e11d48,#f43f5e)",
      color: "white",
      border: "none",
      boxShadow: "0 4px 14px rgba(225,29,72,0.28)",
    },
    violet: {
      background: "linear-gradient(135deg,#7c3aed,#8b5cf6)",
      color: "white",
      border: "none",
      boxShadow: "0 4px 16px rgba(124,58,237,0.30)",
    },
  };
  const s: Record<ButtonSize, React.CSSProperties> = {
    sm: { padding: "7px 14px", fontSize: 12, borderRadius: 10 },
    md: { padding: "11px 22px", fontSize: 13, borderRadius: 12 },
    lg: { padding: "14px 28px", fontSize: 14, borderRadius: 14 },
  };
  return (
    <button
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Syne',sans-serif",
        fontWeight: 700,
        letterSpacing: "0.02em",
        cursor: disabled || isLoading ? "not-allowed" : "pointer",
        opacity: disabled || isLoading ? 0.45 : 1,
        transition: "all 0.2s",
        ...v[variant],
        ...s[size],
      }}
      disabled={disabled || isLoading}
      className={className}
      {...props}
    >
      {isLoading && (
        <Loader2
          style={{
            marginRight: 6,
            width: 15,
            height: 15,
            animation: "spin 1s linear infinite",
          }}
        />
      )}
      {children}
    </button>
  );
};

export const Badge = ({
  children,
  variant = "blue",
}: {
  children: React.ReactNode;
  variant?:
    | "blue"
    | "cyan"
    | "violet"
    | "success"
    | "warning"
    | "danger"
    | "muted";
}) => {
  const s: Record<string, React.CSSProperties> = {
    blue: {
      background: "rgba(2,132,199,0.10)",
      color: "#0284c7",
      border: "1px solid rgba(2,132,199,0.25)",
    },
    cyan: {
      background: "rgba(8,145,178,0.10)",
      color: "#0891b2",
      border: "1px solid rgba(8,145,178,0.25)",
    },
    violet: {
      background: "rgba(124,58,237,0.08)",
      color: "#7c3aed",
      border: "1px solid rgba(124,58,237,0.22)",
    },
    success: {
      background: "rgba(5,150,105,0.10)",
      color: "#059669",
      border: "1px solid rgba(5,150,105,0.25)",
    },
    warning: {
      background: "rgba(217,119,6,0.10)",
      color: "#d97706",
      border: "1px solid rgba(217,119,6,0.25)",
    },
    danger: {
      background: "rgba(225,29,72,0.08)",
      color: "#e11d48",
      border: "1px solid rgba(225,29,72,0.22)",
    },
    muted: {
      background: "rgba(2,132,199,0.06)",
      color: "#4a7fa5",
      border: "1px solid rgba(2,132,199,0.14)",
    },
  };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "3px 10px",
        borderRadius: 99,
        fontSize: 10,
        fontWeight: 700,
        fontFamily: "'Syne',sans-serif",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        ...s[variant],
      }}
    >
      {children}
    </span>
  );
};
