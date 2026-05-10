"use client";
import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowRight,
  Home,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import api from "@/lib/api";

type Stage = "verifying" | "success" | "failed" | "already_active";

interface ActivationResult {
  plan: string;
  billingCycle: string;
  expiresAt: string;
}

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const PLAN_LABELS: Record<string, string> = {
  personal: "Personal",
  family: "Family",
};
const CYCLE_LABELS: Record<string, string> = {
  monthly: "Monthly",
  annual: "Annual",
};

function SuccessRing() {
  return (
    <div style={{ position: "relative", width: 80, height: 80, flexShrink: 0 }}>
      {[1, 2].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            inset: -(i * 8),
            borderRadius: "50%",
            border: "1px solid rgba(2,132,199,0.20)",
            animation: `pulse-ring ${1.2 + i * 0.4}s ease-out infinite`,
          }}
        />
      ))}
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          background:
            "linear-gradient(135deg,rgba(2,132,199,0.14),rgba(14,165,233,0.07))",
          border: "2px solid rgba(2,132,199,0.40)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 0 40px rgba(2,132,199,0.22)",
        }}
      >
        <CheckCircle2 size={36} color="#0284c7" strokeWidth={1.5} />
      </div>
      <style>{`
        @keyframes pulse-ring { 0% { transform:scale(1); opacity:0.4; } 100% { transform:scale(1.5); opacity:0; } }
        @keyframes fade-up    { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .anim-1 { animation: fade-up 0.5s 0.10s ease both; }
        .anim-2 { animation: fade-up 0.5s 0.25s ease both; }
        .anim-3 { animation: fade-up 0.5s 0.40s ease both; }
        .anim-4 { animation: fade-up 0.5s 0.55s ease both; }
      `}</style>
    </div>
  );
}

// ─── Inner component (uses useSearchParams — must be inside Suspense) ─────────
function CallbackContent() {
  const searchParams = useSearchParams();
  const reference =
    searchParams.get("reference") ?? searchParams.get("trxref") ?? null;

  const [stage, setStage] = useState<Stage>(reference ? "verifying" : "failed");
  const [result, setResult] = useState<ActivationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState(
    reference
      ? "Payment could not be verified."
      : "No payment reference found in the URL."
  );
  const hasFired = useRef(false);

  useEffect(() => {
    if (!reference || hasFired.current) return;
    hasFired.current = true;
    api
      .post("/subscription/activate", { reference })
      .then((res) => {
        const d = res.data;
        if (d.alreadyActive) {
          setStage("already_active");
          return;
        }
        setResult({
          plan: d.plan ?? "personal",
          billingCycle: d.billingCycle ?? "monthly",
          expiresAt: d.expiresAt ?? "",
        });
        setStage("success");
      })
      .catch((err) => {
        setErrorMsg(
          err?.response?.data?.message ??
            "Payment verification failed. Please contact support."
        );
        setStage("failed");
      });
  }, [reference]);

  // Shared card wrapper
  const C = {
    bg: "#e0f2fe",
    card: "#f0f9ff",
    cardHi: "#ffffff",
    border: "rgba(2,132,199,0.12)",
    text1: "#0c1a35",
    text2: "rgba(12,26,53,0.58)",
    text3: "rgba(12,26,53,0.38)",
    blue: "#0284c7",
    blueB: "#0ea5e9",
    success: "#059669",
    danger: "#e11d48",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        backgroundImage:
          "linear-gradient(rgba(2,132,199,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(2,132,199,0.03) 1px,transparent 1px)",
        backgroundSize: "48px 48px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ambient orbs */}
      <div
        style={{
          position: "fixed",
          top: "-15%",
          right: "-10%",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background:
            "radial-gradient(circle,rgba(2,132,199,0.08) 0%,transparent 65%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "fixed",
          bottom: "-20%",
          left: "-10%",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background:
            "radial-gradient(circle,rgba(124,58,237,0.05) 0%,transparent 65%)",
          pointerEvents: "none",
        }}
      />

      {/* Top accent */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 1,
          background:
            "linear-gradient(90deg,transparent,rgba(2,132,199,0.50),rgba(14,165,233,0.35),transparent)",
          pointerEvents: "none",
        }}
      />

      {/* Logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 9,
          marginBottom: 48,
        }}
      >
        <Image
          src="/spendnub-64x64.png"
          alt="SpendNub"
          width={32}
          height={32}
          style={{ borderRadius: 10 }}
          priority
        />
        <span
          style={{
            fontFamily: "'Syne',sans-serif",
            fontSize: 18,
            fontWeight: 800,
            color: C.text1,
          }}
        >
          SpendNub<span style={{ color: C.blue }}>.</span>
        </span>
      </div>

      {/* Card */}
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          borderRadius: 24,
          background: C.cardHi,
          border: C.border,
          boxShadow: "0 20px 60px rgba(2,132,199,0.10)",
          padding: "40px 36px",
          position: "relative",
          overflow: "hidden",
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
              "linear-gradient(90deg,transparent,rgba(2,132,199,0.40),transparent)",
          }}
        />

        {/* VERIFYING */}
        {stage === "verifying" && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 20,
              padding: "20px 0",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: "rgba(2,132,199,0.08)",
                border: "1px solid rgba(2,132,199,0.22)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Loader2
                size={28}
                color={C.blue}
                style={{ animation: "spin 1s linear infinite" }}
              />
            </div>
            <div>
              <h2
                style={{
                  fontFamily: "'Syne',sans-serif",
                  fontSize: 22,
                  fontWeight: 800,
                  color: C.text1,
                  marginBottom: 8,
                }}
              >
                Verifying payment…
              </h2>
              <p
                style={{
                  fontSize: 14,
                  color: C.text2,
                  fontFamily: "'DM Sans',sans-serif",
                  lineHeight: 1.6,
                }}
              >
                Confirming your transaction with Paystack. This takes just a
                moment.
              </p>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* SUCCESS */}
        {stage === "success" && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 0,
              textAlign: "center",
            }}
          >
            <div className="anim-1" style={{ marginBottom: 28 }}>
              <SuccessRing />
            </div>
            <div className="anim-2" style={{ marginBottom: 8 }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 14px",
                  borderRadius: 99,
                  background: "rgba(2,132,199,0.09)",
                  border: "1px solid rgba(2,132,199,0.25)",
                  marginBottom: 14,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: C.blue,
                    display: "inline-block",
                  }}
                />
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: C.blue,
                    fontFamily: "'Syne',sans-serif",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase" as const,
                  }}
                >
                  Payment Confirmed
                </span>
              </div>
              <h2
                style={{
                  fontFamily: "'Syne',sans-serif",
                  fontSize: 26,
                  fontWeight: 800,
                  color: C.text1,
                  letterSpacing: "-0.5px",
                  marginBottom: 10,
                }}
              >
                Welcome to{" "}
                <span
                  style={{
                    background: "linear-gradient(135deg,#0284c7,#7c3aed)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {result
                    ? PLAN_LABELS[result.plan] ?? result.plan
                    : "Personal"}
                </span>
              </h2>
              <p
                style={{
                  fontSize: 14,
                  color: C.text2,
                  fontFamily: "'DM Sans',sans-serif",
                  lineHeight: 1.6,
                }}
              >
                Your subscription is now active. All features are unlocked.
              </p>
            </div>

            {result && (
              <div
                className="anim-3"
                style={{
                  width: "100%",
                  padding: "18px 20px",
                  borderRadius: 16,
                  background: "rgba(2,132,199,0.06)",
                  border: "1px solid rgba(2,132,199,0.18)",
                  margin: "24px 0",
                  textAlign: "left",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 14,
                  }}
                >
                  {(
                    [
                      {
                        label: "Plan",
                        value: PLAN_LABELS[result.plan] ?? result.plan,
                        span: false,
                      },
                      {
                        label: "Billing",
                        value:
                          CYCLE_LABELS[result.billingCycle] ??
                          result.billingCycle,
                        span: false,
                      },
                      {
                        label: "Renews",
                        value: result.expiresAt
                          ? fmtDate(result.expiresAt)
                          : "—",
                        span: true,
                      },
                    ] as { label: string; value: string; span: boolean }[]
                  ).map((row, i) => (
                    <div
                      key={i}
                      style={{ gridColumn: row.span ? "1 / -1" : undefined }}
                    >
                      <p
                        style={{
                          fontSize: 9,
                          fontWeight: 700,
                          textTransform: "uppercase" as const,
                          letterSpacing: "0.16em",
                          color: C.text3,
                          fontFamily: "'Syne',sans-serif",
                          marginBottom: 4,
                        }}
                      >
                        {row.label}
                      </p>
                      <p
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: C.text1,
                          fontFamily: "'Syne',sans-serif",
                        }}
                      >
                        {row.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div
              className="anim-4"
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <Link
                href="/dashboard"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "14px",
                  borderRadius: 14,
                  background: "linear-gradient(135deg,#0284c7,#0ea5e9)",
                  color: "white",
                  textDecoration: "none",
                  fontSize: 13,
                  fontWeight: 700,
                  fontFamily: "'Syne',sans-serif",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase" as const,
                  boxShadow: "0 6px 24px rgba(2,132,199,0.32)",
                }}
              >
                Go to Dashboard <ArrowRight size={16} />
              </Link>
              <Link
                href="/budget/config"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "13px",
                  borderRadius: 14,
                  background: C.card,
                  border: C.border,
                  color: C.text2,
                  textDecoration: "none",
                  fontSize: 13,
                  fontWeight: 700,
                  fontFamily: "'Syne',sans-serif",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase" as const,
                }}
              >
                Configure Budget Rules
              </Link>
            </div>
          </div>
        )}

        {/* ALREADY ACTIVE */}
        {stage === "already_active" && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 20,
              padding: "10px 0",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: "rgba(2,132,199,0.08)",
                border: "1px solid rgba(2,132,199,0.22)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CheckCircle2 size={32} color={C.blue} strokeWidth={1.5} />
            </div>
            <div>
              <h2
                style={{
                  fontFamily: "'Syne',sans-serif",
                  fontSize: 22,
                  fontWeight: 800,
                  color: C.text1,
                  marginBottom: 8,
                }}
              >
                Already Active
              </h2>
              <p
                style={{
                  fontSize: 14,
                  color: C.text2,
                  fontFamily: "'DM Sans',sans-serif",
                  lineHeight: 1.6,
                }}
              >
                This payment has already been applied to your account.
                You&apos;re all set.
              </p>
            </div>
            <Link
              href="/dashboard"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "13px 28px",
                borderRadius: 14,
                background: "linear-gradient(135deg,#0284c7,#0ea5e9)",
                color: "white",
                textDecoration: "none",
                fontSize: 13,
                fontWeight: 700,
                fontFamily: "'Syne',sans-serif",
                boxShadow: "0 4px 20px rgba(2,132,199,0.30)",
              }}
            >
              Go to Dashboard <ArrowRight size={15} />
            </Link>
          </div>
        )}

        {/* FAILED */}
        {stage === "failed" && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 20,
              padding: "10px 0",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: "rgba(225,29,72,0.08)",
                border: "1px solid rgba(225,29,72,0.22)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <XCircle size={32} color={C.danger} strokeWidth={1.5} />
            </div>
            <div>
              <h2
                style={{
                  fontFamily: "'Syne',sans-serif",
                  fontSize: 22,
                  fontWeight: 800,
                  color: C.text1,
                  marginBottom: 8,
                }}
              >
                Payment Failed
              </h2>
              <p
                style={{
                  fontSize: 14,
                  color: C.text2,
                  fontFamily: "'DM Sans',sans-serif",
                  lineHeight: 1.6,
                }}
              >
                {errorMsg}
              </p>
            </div>
            <div
              style={{
                padding: "16px 18px",
                borderRadius: 14,
                background: "rgba(225,29,72,0.05)",
                border: "1px solid rgba(225,29,72,0.16)",
                width: "100%",
                textAlign: "left",
              }}
            >
              <p
                style={{
                  fontSize: 12,
                  color: C.text2,
                  fontFamily: "'DM Sans',sans-serif",
                  lineHeight: 1.7,
                }}
              >
                Your account has{" "}
                <strong style={{ color: C.text1 }}>not been charged</strong>. If
                you believe this is an error, contact{" "}
                <a
                  href="mailto:support@spendnub.ng"
                  style={{
                    color: C.blue,
                    textDecoration: "none",
                    fontWeight: 600,
                  }}
                >
                  support@spendnub.ng
                </a>{" "}
                with your payment reference.
              </p>
            </div>
            <div
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <Link
                href="/subscribe"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "14px",
                  borderRadius: 14,
                  background: "linear-gradient(135deg,#0284c7,#0ea5e9)",
                  color: "white",
                  textDecoration: "none",
                  fontSize: 13,
                  fontWeight: 700,
                  fontFamily: "'Syne',sans-serif",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase" as const,
                  boxShadow: "0 6px 24px rgba(2,132,199,0.28)",
                }}
              >
                <RefreshCw size={15} /> Try Again
              </Link>
              <Link
                href="/dashboard"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "13px",
                  borderRadius: 14,
                  background: C.card,
                  border: C.border,
                  color: C.text2,
                  textDecoration: "none",
                  fontSize: 13,
                  fontWeight: 700,
                  fontFamily: "'Syne',sans-serif",
                }}
              >
                <Home size={14} /> Back to Dashboard
              </Link>
            </div>
          </div>
        )}
      </div>

      <p
        style={{
          marginTop: 32,
          fontSize: 11,
          color: C.text3,
          fontFamily: "'DM Sans',sans-serif",
          textAlign: "center",
        }}
      >
        Payments secured by Paystack · 256-bit SSL
      </p>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            background: "#e0f2fe",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              border: "3px solid rgba(2,132,199,0.20)",
              borderTop: "3px solid #0284c7",
              animation: "spin 1s linear infinite",
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
