"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { toast } from "sonner";
import { ApiError } from "@/types";
import { Loader2, ShieldCheck, RotateCcw } from "lucide-react";

const C = {
  bg: "#e0f2fe",
  card: "#f0f9ff",
  cardHi: "#ffffff",
  border: "rgba(2,132,199,0.12)",
  borderM: "rgba(2,132,199,0.22)",
  text1: "#0c1a35",
  text2: "rgba(12,26,53,0.58)",
  text3: "rgba(12,26,53,0.38)",
  blue: "#0284c7",
  blueB: "#0ea5e9",
  success: "#059669",
};

// ─── OTP Input ────────────────────────────────────────────────────────────────
function OtpInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const digits = Array.from({ length: 6 }, (_, i) => value[i] || "");

  const handleKey = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !e.currentTarget.value && index > 0) {
      const prev = document.getElementById(
        `otp-${index - 1}`
      ) as HTMLInputElement;
      if (prev) {
        prev.focus();
        prev.select();
      }
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const raw = e.target.value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = raw;
    onChange(next.join(""));
    if (raw && index < 5) {
      const el = document.getElementById(
        `otp-${index + 1}`
      ) as HTMLInputElement;
      if (el) el.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    onChange(pasted.padEnd(6, "").slice(0, 6));
    const el = document.getElementById(
      `otp-${Math.min(pasted.length, 5)}`
    ) as HTMLInputElement;
    if (el) el.focus();
  };

  return (
    <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
      {digits.map((d, i) => (
        <input
          key={i}
          id={`otp-${i}`}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={d}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKey(e, i)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          style={{
            width: 52,
            height: 60,
            borderRadius: 14,
            textAlign: "center",
            fontSize: 24,
            fontWeight: 800,
            fontFamily: "'Syne',sans-serif",
            background: d ? "rgba(2,132,199,0.09)" : C.cardHi,
            border: d
              ? "1.5px solid rgba(2,132,199,0.40)"
              : `1.5px solid ${C.border}`,
            color: d ? C.blue : C.text1,
            outline: "none",
            caretColor: C.blue,
            boxShadow: d ? "0 0 14px rgba(2,132,199,0.14)" : "none",
            transition: "all 0.2s",
          }}
        />
      ))}
    </div>
  );
}

// ─── Countdown Ring ───────────────────────────────────────────────────────────
function CountdownRing({ seconds, total }: { seconds: number; total: number }) {
  const r = 22;
  const circ = 2 * Math.PI * r;
  const dash = circ * (seconds / total);
  return (
    <svg width={52} height={52} style={{ transform: "rotate(-90deg)" }}>
      <circle
        cx={26}
        cy={26}
        r={r}
        fill="none"
        stroke="rgba(2,132,199,0.10)"
        strokeWidth={3}
      />
      <circle
        cx={26}
        cy={26}
        r={r}
        fill="none"
        stroke={seconds > 0 ? C.blue : C.text3}
        strokeWidth={3}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 1s linear" }}
      />
    </svg>
  );
}

// ─── Main content ─────────────────────────────────────────────────────────────
function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams?.get("email") || "";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(60);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => {
    if (timer <= 0) return;
    const id = setInterval(() => setTimer((p) => p - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error("Enter the 6-digit code");
      return;
    }
    setLoading(true);
    try {
      await api.post("/users/verify-otp", { email, otp: Number(otp) });
      toast.success("Identity verified!");
      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch (err) {
      const e = err as ApiError;
      toast.error(e.response?.data?.message || "Invalid or expired code");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await api.post("/users/forgot-password", { email });
      toast.success("New code sent to your email");
      setTimer(60);
      setOtp("");
    } catch (err) {
      const e = err as ApiError;
      toast.error(e.response?.data?.message || "Failed to resend code");
    } finally {
      setResending(false);
    }
  };

  if (!mounted) return <div style={{ minHeight: "100vh", background: C.bg }} />;

  const isComplete = otp.length === 6;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: C.bg,
        backgroundImage:
          "linear-gradient(rgba(2,132,199,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(2,132,199,0.03) 1px,transparent 1px)",
        backgroundSize: "60px 60px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ambient orbs */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "5%",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background:
            "radial-gradient(circle,rgba(2,132,199,0.06) 0%,transparent 65%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "5%",
          right: "5%",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background:
            "radial-gradient(circle,rgba(124,58,237,0.04) 0%,transparent 65%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          width: "100%",
          maxWidth: 440,
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 4,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 11,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background:
                  "linear-gradient(135deg,rgba(2,132,199,0.15),rgba(14,165,233,0.10))",
                border: "1px solid rgba(2,132,199,0.30)",
                boxShadow: "0 0 18px rgba(2,132,199,0.18)",
                fontSize: 16,
              }}
            >
              ⚡
            </div>
            <span
              style={{
                fontFamily: "'Syne',sans-serif",
                fontSize: 20,
                fontWeight: 800,
                color: C.text1,
              }}
            >
              SpendNub<span style={{ color: C.blue }}>.</span>
            </span>
          </div>
        </div>

        {/* Card */}
        <div
          style={{
            padding: 36,
            borderRadius: 24,
            background: C.cardHi,
            border: C.border,
            boxShadow: "0 20px 60px rgba(2,132,199,0.10)",
          }}
        >
          {/* Shield icon */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: 24,
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 20,
                background: "rgba(2,132,199,0.08)",
                border: "1px solid rgba(2,132,199,0.20)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 28px rgba(2,132,199,0.12)",
              }}
            >
              <ShieldCheck size={30} style={{ color: C.blue }} />
            </div>
          </div>

          {/* Title */}
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <h1
              style={{
                fontFamily: "'Syne',sans-serif",
                fontSize: 26,
                fontWeight: 800,
                color: C.text1,
                letterSpacing: "-0.5px",
                marginBottom: 10,
              }}
            >
              Verify Identity
            </h1>
            <p
              style={{
                fontSize: 14,
                color: C.text2,
                lineHeight: 1.6,
                fontFamily: "'DM Sans',sans-serif",
              }}
            >
              We sent a 6-digit code to
            </p>
            <p
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: C.text1,
                fontFamily: "'Syne',sans-serif",
                marginTop: 2,
              }}
            >
              {email}
            </p>
          </div>

          {/* OTP form */}
          <form onSubmit={handleVerify}>
            <div style={{ marginBottom: 24 }}>
              <OtpInput value={otp} onChange={setOtp} />
            </div>
            <button
              type="submit"
              disabled={!isComplete || loading}
              style={{
                width: "100%",
                padding: "15px",
                borderRadius: 14,
                background: isComplete
                  ? "linear-gradient(135deg,#0284c7,#0ea5e9)"
                  : C.card,
                border: isComplete ? "none" : C.border,
                color: isComplete ? "white" : C.text3,
                fontSize: 14,
                fontWeight: 700,
                fontFamily: "'Syne',sans-serif",
                cursor: isComplete ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                boxShadow: isComplete
                  ? "0 6px 22px rgba(2,132,199,0.32)"
                  : "none",
                transition: "all 0.3s",
                letterSpacing: "0.05em",
                textTransform: "uppercase" as const,
              }}
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <ShieldCheck size={18} />
              )}
              {loading ? "Verifying…" : "Verify Code"}
            </button>
          </form>

          {/* Divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              margin: "24px 0",
            }}
          >
            <div style={{ flex: 1, height: 1, background: C.border }} />
            <span
              style={{
                fontSize: 11,
                color: C.text3,
                fontFamily: "'DM Sans',sans-serif",
              }}
            >
              didn&apos;t receive it?
            </span>
            <div style={{ flex: 1, height: 1, background: C.border }} />
          </div>

          {/* Resend row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 18px",
              borderRadius: 14,
              background: C.card,
              border: C.border,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  position: "relative",
                  width: 52,
                  height: 52,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CountdownRing seconds={timer} total={60} />
                <span
                  style={{
                    position: "absolute",
                    fontSize: 11,
                    fontWeight: 700,
                    color: timer > 0 ? C.blue : C.text3,
                    fontFamily: "'Syne',sans-serif",
                  }}
                >
                  {timer > 0 ? timer : "—"}
                </span>
              </div>
              <div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: C.text2,
                    fontFamily: "'DM Sans',sans-serif",
                  }}
                >
                  {timer > 0 ? "Resend available in" : "Code expired"}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: C.text3,
                    fontFamily: "'DM Sans',sans-serif",
                  }}
                >
                  {timer > 0 ? `${timer} seconds` : "Request a new one"}
                </div>
              </div>
            </div>
            <button
              onClick={handleResend}
              disabled={timer > 0 || resending}
              style={{
                padding: "9px 16px",
                borderRadius: 10,
                background: timer === 0 ? "rgba(2,132,199,0.09)" : C.bg,
                border: `1px solid ${
                  timer === 0 ? "rgba(2,132,199,0.25)" : C.border
                }`,
                color: timer === 0 ? C.blue : C.text3,
                fontSize: 12,
                fontWeight: 700,
                fontFamily: "'Syne',sans-serif",
                cursor: timer === 0 ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                gap: 6,
                transition: "all 0.2s",
              }}
            >
              {resending ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <RotateCcw size={12} />
              )}{" "}
              Resend
            </button>
          </div>
        </div>

        {/* Back */}
        <p
          style={{
            textAlign: "center",
            marginTop: 24,
            fontSize: 13,
            color: C.text3,
            fontFamily: "'DM Sans',sans-serif",
          }}
        >
          <Link
            href="/login"
            style={{ color: C.blue, fontWeight: 600, textDecoration: "none" }}
          >
            ← Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense
      fallback={<div style={{ minHeight: "100vh", background: C.bg }} />}
    >
      <VerifyOtpContent />
    </Suspense>
  );
}
