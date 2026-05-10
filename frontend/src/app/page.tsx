"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuthStore } from "@/store/useAuthStore";

function PricingSection() {
  const [annual, setAnnual] = useState(false);

  const plans = [
    {
      tier: "Free",
      color: "rgba(255,255,255,0.50)",
      featured: false,
      monthly: 0,
      annualTotal: 0,
      annualMonthly: 0,
      savings: 0,
      cta: "Start Free Trial",
      href: "/signup",
      features: [
        { text: "4 budget buckets", ok: true },
        { text: "Income & expense logging", ok: true },
        { text: "Basic dashboard (current month)", ok: true },
        { text: "30-day transaction history", ok: true },
        { text: "Unlimited buckets", ok: false },
        { text: "Full ledger audit trail", ok: false },
      ],
    },
    {
      tier: "Personal",
      color: "#38bdf8",
      featured: true,
      monthly: 1500,
      annualTotal: 15000,
      annualMonthly: 1250,
      savings: 3000,
      cta: "Get Personal",
      href: "/signup",
      features: [
        { text: "Unlimited budget buckets", ok: true },
        { text: "Full ledger history — all time", ok: true },
        { text: "Sinking fund / rolling balance", ok: true },
        { text: "Unlimited subcategories", ok: true },
        { text: "Data export (CSV)", ok: true },
        { text: "Priority support", ok: true },
      ],
    },
    {
      tier: "Family",
      color: "#818cf8",
      featured: false,
      monthly: 3500,
      annualTotal: 36000,
      annualMonthly: 3000,
      savings: 6000,
      cta: "Get Family",
      href: "/signup",
      features: [
        { text: "Everything in Personal", ok: true },
        { text: "Up to 3 budget profiles", ok: true },
        { text: "Shared SpendNub view", ok: true },
        { text: "Budget templates", ok: true },
        { text: "Dedicated support", ok: true },
      ],
    },
  ];

  return (
    <section id="pricing" className="lp-section" style={{ padding: "100px 0" }}>
      <div className="lp-container">
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 16,
              justifyContent: "center",
            }}
          >
            <div style={{ width: 20, height: 1, background: "#0ea5e9" }} />
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                color: "rgba(56,189,248,0.8)",
                fontFamily: "'Syne',sans-serif",
              }}
            >
              Pricing
            </span>
            <div style={{ width: 20, height: 1, background: "#0ea5e9" }} />
          </div>
          <h2
            style={{
              fontFamily: "'Syne',sans-serif",
              fontSize: "clamp(32px,4vw,52px)",
              fontWeight: 800,
              letterSpacing: "-1px",
              color: "white",
              marginBottom: 16,
              lineHeight: 1.1,
            }}
          >
            Simple pricing.{" "}
            <span
              style={{
                background: "linear-gradient(135deg,#38bdf8,#818cf8)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Serious value.
            </span>
          </h2>
          <p
            style={{
              fontSize: 15,
              color: "rgba(255,255,255,0.38)",
              maxWidth: 420,
              margin: "0 auto 32px",
            }}
          >
            90 days free — no credit card needed. Upgrade when you&apos;re
            ready.
          </p>

          {/* Toggle */}
          <div
            style={{
              display: "inline-flex",
              padding: 4,
              borderRadius: 12,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              gap: 2,
            }}
          >
            {(["monthly", "annual"] as const).map((c) => (
              <button
                key={c}
                onClick={() => setAnnual(c === "annual")}
                style={{
                  padding: "8px 22px",
                  borderRadius: 9,
                  fontSize: 12,
                  fontWeight: 700,
                  fontFamily: "'Syne',sans-serif",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  background:
                    (c === "annual") === annual
                      ? "linear-gradient(135deg,#0284c7,#0ea5e9)"
                      : "transparent",
                  color:
                    (c === "annual") === annual
                      ? "white"
                      : "rgba(255,255,255,0.38)",
                  boxShadow:
                    (c === "annual") === annual
                      ? "0 2px 14px rgba(2,132,199,0.45)"
                      : "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {c.charAt(0).toUpperCase() + c.slice(1)}
                {c === "annual" && (
                  <span
                    style={{
                      fontSize: 9,
                      background: annual
                        ? "rgba(255,255,255,0.22)"
                        : "rgba(56,189,248,0.15)",
                      color: annual ? "white" : "#38bdf8",
                      padding: "2px 6px",
                      borderRadius: 4,
                      fontWeight: 800,
                      border: annual
                        ? "none"
                        : "1px solid rgba(56,189,248,0.25)",
                    }}
                  >
                    SAVE 2 MO
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Cards */}
        <div className="lp-pricing-grid">
          {plans.map((plan, i) => {
            const displayMonthly =
              plan.monthly === 0
                ? 0
                : annual
                ? plan.annualMonthly
                : plan.monthly;
            const isFree = plan.monthly === 0;
            const c = plan.color;
            return (
              <div
                key={i}
                className={plan.featured ? "lp-price-featured" : ""}
                style={{
                  padding: "32px 28px",
                  borderRadius: 20,
                  background: plan.featured
                    ? "linear-gradient(135deg,#0a1e3d,#071628)"
                    : "linear-gradient(135deg,#0d1b35,#0a1528)",
                  border: plan.featured
                    ? `1px solid rgba(56,189,248,0.30)`
                    : "1px solid rgba(255,255,255,0.06)",
                  boxShadow: plan.featured
                    ? "0 0 60px rgba(14,165,233,0.14)"
                    : "none",
                  transform: plan.featured ? "scale(1.04)" : "none",
                  position: "relative",
                }}
              >
                {plan.featured && (
                  <div
                    style={{
                      position: "absolute",
                      top: -12,
                      left: "50%",
                      transform: "translateX(-50%)",
                      padding: "4px 16px",
                      borderRadius: 99,
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.15em",
                      background: "linear-gradient(135deg,#0284c7,#0ea5e9)",
                      color: "white",
                      fontFamily: "'Syne',sans-serif",
                      boxShadow: "0 4px 18px rgba(2,132,199,0.50)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Most Popular
                  </div>
                )}
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.2em",
                    color: plan.featured
                      ? "rgba(56,189,248,0.90)"
                      : "rgba(255,255,255,0.30)",
                    marginBottom: 12,
                    fontFamily: "'Syne',sans-serif",
                  }}
                >
                  {plan.tier}
                </div>
                <div
                  style={{
                    fontFamily: "'Syne',sans-serif",
                    fontSize: 42,
                    fontWeight: 800,
                    color: "white",
                    lineHeight: 1,
                  }}
                >
                  {isFree ? "₦0" : `₦${displayMonthly.toLocaleString()}`}
                  <span
                    style={{
                      fontSize: 15,
                      fontWeight: 500,
                      color: "rgba(255,255,255,0.35)",
                    }}
                  >
                    /mo
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "rgba(255,255,255,0.28)",
                    margin: "7px 0 0",
                    minHeight: 32,
                    lineHeight: 1.5,
                  }}
                >
                  {isFree ? (
                    "90-day trial · no credit card"
                  ) : annual ? (
                    <span>
                      ₦{plan.annualTotal.toLocaleString()} billed once ·{" "}
                      <span style={{ color: c, fontWeight: 700 }}>
                        save ₦{plan.savings.toLocaleString()}
                      </span>
                    </span>
                  ) : (
                    "billed monthly · cancel anytime"
                  )}
                </div>
                <div
                  style={{
                    height: 1,
                    background: plan.featured
                      ? "rgba(56,189,248,0.18)"
                      : "rgba(255,255,255,0.06)",
                    margin: "20px 0",
                  }}
                />
                <ul
                  style={{
                    listStyle: "none",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    marginBottom: 28,
                  }}
                >
                  {plan.features.map((f, j) => (
                    <li
                      key={j}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        fontSize: 13,
                        color: f.ok
                          ? "rgba(255,255,255,0.55)"
                          : "rgba(255,255,255,0.18)",
                      }}
                    >
                      <span
                        style={{
                          color: f.ok ? c : "rgba(255,255,255,0.12)",
                          fontSize: 14,
                          flexShrink: 0,
                          fontWeight: 700,
                        }}
                      >
                        {f.ok ? "✓" : "✗"}
                      </span>
                      {f.text}
                    </li>
                  ))}
                </ul>
                <a
                  href={plan.href}
                  style={{
                    display: "block",
                    textAlign: "center",
                    padding: "13px",
                    borderRadius: 12,
                    fontSize: 12,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    fontFamily: "'Syne',sans-serif",
                    textDecoration: "none",
                    background: plan.featured
                      ? "linear-gradient(135deg,#0284c7,#0ea5e9)"
                      : "rgba(255,255,255,0.05)",
                    color: plan.featured ? "white" : "rgba(255,255,255,0.50)",
                    border: plan.featured
                      ? "none"
                      : "1px solid rgba(255,255,255,0.10)",
                    boxShadow: plan.featured
                      ? "0 4px 22px rgba(2,132,199,0.45)"
                      : "none",
                  }}
                >
                  {plan.cta}
                </a>
              </div>
            );
          })}
        </div>

        <p
          style={{
            textAlign: "center",
            marginTop: 36,
            fontSize: 12,
            color: "rgba(255,255,255,0.20)",
            fontFamily: "'DM Sans',sans-serif",
          }}
        >
          🔒 Payments via Paystack · SSL encrypted · Cancel anytime · Your data
          is always yours
        </p>
      </div>
    </section>
  );
}

// ─── Home ─────────────────────────────────────────────────────────────────────
export default function Home() {
  const { token } = useAuthStore();
  const isLoggedIn = !!token;
  return (
    <>
      <style>{`
        html, body { overflow-x: hidden; max-width: 100vw; }
        *, *::before, *::after { box-sizing: border-box; }

        @keyframes ticker   { from { transform: translateX(0); }    to { transform: translateX(-50%); } }
        @keyframes float    { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes fadeUp   { from { opacity:0; transform: translateY(22px); } to { opacity:1; transform: translateY(0); } }
        @keyframes scanLine { 0% { top: 0; } 100% { top: 100%; } }
        @keyframes badgePulse { 0%,100% { opacity:0.5; } 50% { opacity:1; } }

        .lp-ticker-track   { animation: ticker 28s linear infinite; }
        .lp-preview-float  { animation: float 6s ease-in-out infinite; }
        .lp-scan           { animation: scanLine 4s linear infinite; }
        .lp-badge-dot      { animation: badgePulse 1.5s ease infinite; }
        .au-1 { animation: fadeUp 0.7s 0.05s ease both; }
        .au-2 { animation: fadeUp 0.7s 0.18s ease both; }
        .au-3 { animation: fadeUp 0.7s 0.32s ease both; }
        .au-4 { animation: fadeUp 0.7s 0.46s ease both; }
        .au-5 { animation: fadeUp 0.7s 0.62s ease both; }

        .lp-preview-wrap { width: 100%; max-width: min(820px, calc(100vw - 48px)); margin-top: 64px; }
        @media (max-width: 768px) { .lp-preview-wrap { max-width: calc(100vw - 32px); margin-top: 40px; } }

        .lp-nav-links { display: flex; gap: 28px; }
        @media (max-width: 768px) { .lp-nav-links { display: none; } .lp-nav { padding: 0 20px !important; } }

        .lp-steps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; }
        @media (max-width: 900px) {
          .lp-steps-grid { grid-template-columns: 1fr; gap: 8px; }
          .lp-step-first,.lp-step-last,.lp-step-mid { border-radius: 18px !important; }
          .lp-step-connector { display: none !important; }
        }

        .lp-features-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        @media (max-width: 900px) {
          .lp-features-grid { grid-template-columns: 1fr; }
          .lp-feature-wide  { grid-column: span 1 !important; }
          .lp-wide-inner    { grid-template-columns: 1fr !important; }
        }

        .lp-pricing-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; align-items: start; }
        @media (max-width: 900px) { .lp-pricing-grid { grid-template-columns: 1fr; } .lp-price-featured { transform: none !important; } }

        .lp-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); max-width: 900px; margin: 0 auto; padding: 0 24px; width: 100%; }
        @media (max-width: 640px) { .lp-stats-grid { grid-template-columns: repeat(2, 1fr); padding: 0 16px; } .lp-stat-border-2 { border-right: none !important; } }

        .lp-preview-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 10px; }
        @media (max-width: 640px) { .lp-preview-grid { grid-template-columns: 1fr; } .lp-preview-activity { display: none; } }

        .lp-mini-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 12px; }

        .lp-footer { padding: 32px 40px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; border-top: 1px solid rgba(255,255,255,0.05); }
        .lp-container { max-width: 1100px; margin: 0 auto; padding: 0 40px; width: 100%; }
        @media (max-width: 1160px) { .lp-container { padding: 0 24px; } }
        @media (max-width: 768px) {
          .lp-container { padding: 0 16px; }
          .lp-hero      { padding: 80px 16px 60px !important; min-height: auto !important; }
          .lp-section   { padding: 72px 0 !important; }
          .lp-footer    { padding: 28px 16px !important; flex-direction: column !important; text-align: center !important; }
          .lp-footer-links { justify-content: center; }
          .lp-cta-section  { padding: 80px 0 !important; }
          .lp-wide-inner   { gap: 20px !important; }
        }
      `}</style>

      <div
        style={{
          background: "#060d1f",
          minHeight: "100vh",
          overflowX: "hidden",
          width: "100%",
          maxWidth: "100vw",
          fontFamily: "'DM Sans',sans-serif",
          backgroundImage:
            "linear-gradient(rgba(14,165,233,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(14,165,233,0.03) 1px,transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      >
        {/* ── NAV ── */}
        <nav
          className="lp-nav"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            height: 68,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 48px",
            background: "rgba(6,13,31,0.88)",
            backdropFilter: "blur(24px)",
            borderBottom: "1px solid rgba(14,165,233,0.10)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Image
              src="/spendnub-64x64.png"
              alt="SpendNub"
              width={34}
              height={34}
              style={{ borderRadius: 10 }}
              priority
            />
            <span
              style={{
                fontFamily: "'Syne',sans-serif",
                fontSize: 18,
                fontWeight: 800,
                color: "white",
              }}
            >
              SpendNub<span style={{ color: "#38bdf8" }}>.</span>
            </span>
          </div>
          <div className="lp-nav-links">
            {["How It Works", "Features", "Pricing"].map((l) => (
              <a
                key={l}
                href={`#${l.toLowerCase().replace(/ /g, "")}`}
                style={{
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: 13,
                  fontWeight: 500,
                  color: "rgba(255,255,255,0.38)",
                  textDecoration: "none",
                }}
              >
                {l}
              </a>
            ))}
          </div>
          <Link
            href={isLoggedIn ? "/dashboard" : "/signup"}
            style={{
              padding: "9px 22px",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              fontFamily: "'Syne',sans-serif",
              letterSpacing: "0.02em",
              background: "linear-gradient(135deg,#0284c7,#0ea5e9)",
              color: "white",
              textDecoration: "none",
              boxShadow: "0 4px 18px rgba(2,132,199,0.45)",
              whiteSpace: "nowrap",
            }}
          >
            {isLoggedIn ? "Dashboard →" : "Get Started →"}
          </Link>
        </nav>

        {/* ── TICKER ── */}
        <div style={{ paddingTop: 68 }}>
          <div
            style={{
              overflow: "hidden",
              padding: "10px 0",
              background: "rgba(14,165,233,0.04)",
              borderTop: "1px solid rgba(14,165,233,0.10)",
              borderBottom: "1px solid rgba(14,165,233,0.10)",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: 0,
                width: 80,
                zIndex: 1,
                background: "linear-gradient(90deg,#060d1f,transparent)",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                right: 0,
                width: 80,
                zIndex: 1,
                background: "linear-gradient(270deg,#060d1f,transparent)",
              }}
            />
            <div
              className="lp-ticker-track"
              style={{ display: "flex", width: "max-content" }}
            >
              {(
                [
                  { label: "Needs Bucket", val: "₦276,000 left", up: true },
                  { label: "Savings Rate", val: "20% →", up: true },
                  { label: "Utility Bucket", val: "90% used ⚠", up: false },
                  { label: "Total Balance", val: "₦842,500", up: true },
                  { label: "50/30/20 Split", val: "Active", neutral: true },
                  { label: "Monthly Income", val: "₦1,200,000", up: true },
                  { label: "Monthly Expenses", val: "₦357,500", up: false },
                  {
                    label: "Ledger Entries",
                    val: "1,248 records",
                    neutral: true,
                  },
                ] as {
                  label: string;
                  val: string;
                  up?: boolean;
                  neutral?: boolean;
                }[]
              )
                .concat([
                  { label: "Needs Bucket", val: "₦276,000 left", up: true },
                  { label: "Savings Rate", val: "20% →", up: true },
                  { label: "Utility Bucket", val: "90% used ⚠", up: false },
                  { label: "Total Balance", val: "₦842,500", up: true },
                  { label: "50/30/20 Split", val: "Active", neutral: true },
                  { label: "Monthly Income", val: "₦1,200,000", up: true },
                  { label: "Monthly Expenses", val: "₦357,500", up: false },
                  {
                    label: "Ledger Entries",
                    val: "1,248 records",
                    neutral: true,
                  },
                ])
                .map((item, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "0 28px",
                      borderRight: "1px solid rgba(255,255,255,0.05)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {!item.neutral && (
                      <span
                        style={{
                          width: 5,
                          height: 5,
                          borderRadius: "50%",
                          background: item.up ? "#38bdf8" : "#f43f5e",
                          display: "inline-block",
                        }}
                      />
                    )}
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        textTransform: "uppercase" as const,
                        letterSpacing: "0.15em",
                        color: "rgba(255,255,255,0.25)",
                        fontFamily: "'Syne',sans-serif",
                      }}
                    >
                      {item.label}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        fontFamily: "'Syne',sans-serif",
                        color: item.neutral
                          ? "rgba(255,255,255,0.40)"
                          : item.up
                          ? "#38bdf8"
                          : "#f43f5e",
                      }}
                    >
                      {item.val}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* ── HERO ── */}
        <section
          className="lp-hero"
          style={{
            minHeight: "92vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "100px 24px 80px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Orbs */}
          <div
            style={{
              position: "absolute",
              top: "-20%",
              left: "-15%",
              width: 700,
              height: 700,
              borderRadius: "50%",
              background:
                "radial-gradient(circle,rgba(2,132,199,0.09) 0%,transparent 65%)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-20%",
              right: "-15%",
              width: 600,
              height: 600,
              borderRadius: "50%",
              background:
                "radial-gradient(circle,rgba(99,102,241,0.07) 0%,transparent 65%)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "30%",
              left: "60%",
              width: 400,
              height: 400,
              borderRadius: "50%",
              background:
                "radial-gradient(circle,rgba(6,182,212,0.05) 0%,transparent 65%)",
              pointerEvents: "none",
            }}
          />

          {/* Badge */}
          <div
            className="au-1"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "7px 16px",
              borderRadius: 99,
              background: "rgba(14,165,233,0.08)",
              border: "1px solid rgba(14,165,233,0.22)",
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase" as const,
              letterSpacing: "0.15em",
              color: "rgba(56,189,248,0.90)",
              fontFamily: "'Syne',sans-serif",
              marginBottom: 32,
            }}
          >
            <span
              className="lp-badge-dot"
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#38bdf8",
                display: "inline-block",
              }}
            />
            Now in Beta — Claim Your Spot
          </div>

          <h1
            className="au-2"
            style={{
              fontFamily: "'Syne',sans-serif",
              fontSize: "clamp(40px,7vw,88px)",
              fontWeight: 800,
              lineHeight: 1.0,
              letterSpacing: "-2px",
              color: "white",
              maxWidth: 860,
              marginBottom: 28,
            }}
          >
            Your Money.{" "}
            <span
              style={{
                background:
                  "linear-gradient(135deg,#38bdf8 0%,#818cf8 50%,#22d3ee 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                display: "block",
              }}
            >
              Fully Engineered.
            </span>
          </h1>

          <p
            className="au-3"
            style={{
              fontSize: 17,
              lineHeight: 1.75,
              color: "rgba(255,255,255,0.38)",
              maxWidth: 500,
              margin: "0 auto 48px",
            }}
          >
            A{" "}
            <strong
              style={{ color: "rgba(255,255,255,0.75)", fontWeight: 600 }}
            >
              rule-based financial engine
            </strong>{" "}
            that splits your income into smart budget buckets and tracks every
            naira with ledger-grade precision.
          </p>

          <div
            className="au-4"
            style={{
              display: "flex",
              gap: 14,
              flexWrap: "wrap",
              justifyContent: "center",
              marginBottom: 28,
            }}
          >
            <Link
              href={isLoggedIn ? "/dashboard" : "/signup"}
              style={{
                padding: "16px 36px",
                borderRadius: 14,
                fontSize: 14,
                fontWeight: 700,
                textTransform: "uppercase" as const,
                letterSpacing: "0.1em",
                background: "linear-gradient(135deg,#0284c7,#0ea5e9)",
                color: "white",
                textDecoration: "none",
                boxShadow: "0 6px 28px rgba(2,132,199,0.50)",
                fontFamily: "'Syne',sans-serif",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {isLoggedIn ? "Go to Dashboard →" : "Start Free Trial →"}
            </Link>
            {!isLoggedIn && (
              <Link
                href="/login"
                style={{
                  padding: "16px 36px",
                  borderRadius: 14,
                  fontSize: 14,
                  fontWeight: 700,
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.1em",
                  background: "rgba(255,255,255,0.05)",
                  color: "rgba(255,255,255,0.65)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  textDecoration: "none",
                  fontFamily: "'Syne',sans-serif",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                Log In
              </Link>
            )}
          </div>

          <p
            className="au-4"
            style={{ fontSize: 12, color: "rgba(255,255,255,0.22)" }}
          >
            <span style={{ color: "#38bdf8" }}>✓</span> 3-month free trial
            &nbsp;·&nbsp;
            <span style={{ color: "#38bdf8" }}>✓</span> No credit card
            &nbsp;·&nbsp;
            <span style={{ color: "#38bdf8" }}>✓</span> Built for Nigeria
          </p>

          {/* Dashboard preview */}
          <div className="au-5 lp-preview-float lp-preview-wrap">
            <div
              style={{
                borderRadius: 20,
                border: "1px solid rgba(56,189,248,0.12)",
                overflow: "hidden",
                boxShadow:
                  "0 80px 160px rgba(0,0,0,0.70), 0 0 80px rgba(2,132,199,0.10)",
                background: "#070f24",
                position: "relative",
              }}
            >
              <div
                className="lp-scan"
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  height: 2,
                  background:
                    "linear-gradient(90deg,transparent,rgba(56,189,248,0.40),transparent)",
                  pointerEvents: "none",
                  zIndex: 2,
                }}
              />
              {/* Browser chrome */}
              <div
                style={{
                  padding: "13px 18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "rgba(255,255,255,0.025)",
                  borderBottom: "1px solid rgba(56,189,248,0.08)",
                }}
              >
                <div style={{ display: "flex", gap: 6 }}>
                  {[
                    "rgba(244,63,94,0.7)",
                    "rgba(245,158,11,0.6)",
                    "rgba(56,189,248,0.6)",
                  ].map((bg, i) => (
                    <div
                      key={i}
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: bg,
                      }}
                    />
                  ))}
                </div>
                <div
                  style={{
                    padding: "3px 14px",
                    borderRadius: 6,
                    background: "rgba(255,255,255,0.04)",
                    fontSize: 11,
                    color: "rgba(255,255,255,0.22)",
                  }}
                >
                  spendnub.shotnubsolutions.com — Financial Pulse
                </div>
                <span
                  style={{
                    fontSize: 10,
                    color: "rgba(56,189,248,0.70)",
                    fontFamily: "'Syne',sans-serif",
                    fontWeight: 700,
                  }}
                >
                  ● LIVE
                </span>
              </div>
              <div style={{ padding: 18 }}>
                {/* Mini stat cards */}
                <div className="lp-mini-stats">
                  {[
                    {
                      label: "Balance",
                      val: "₦842K",
                      color: "linear-gradient(135deg,#0ea5e9,#38bdf8)",
                    },
                    {
                      label: "Income",
                      val: "₦1.2M",
                      color: "linear-gradient(135deg,#818cf8,#a5b4fc)",
                    },
                    {
                      label: "Expenses",
                      val: "₦357K",
                      color: "linear-gradient(135deg,#94a3b8,#cbd5e1)",
                    },
                  ].map((s, i) => (
                    <div
                      key={i}
                      style={{
                        padding: 14,
                        borderRadius: 12,
                        background: "linear-gradient(135deg,#0d1b35,#0a1528)",
                        border: "1px solid rgba(56,189,248,0.08)",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 8,
                          fontWeight: 700,
                          textTransform: "uppercase" as const,
                          letterSpacing: "0.18em",
                          color: "rgba(255,255,255,0.25)",
                          marginBottom: 6,
                          fontFamily: "'Syne',sans-serif",
                        }}
                      >
                        {s.label}
                      </div>
                      <div
                        style={{
                          fontSize: 18,
                          fontWeight: 800,
                          fontFamily: "'Syne',sans-serif",
                          background: s.color,
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          backgroundClip: "text",
                        }}
                      >
                        {s.val}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="lp-preview-grid">
                  {/* Bucket bars */}
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                  >
                    {[
                      {
                        name: "Needs",
                        amt: "₦276K",
                        pct: 54,
                        color: "linear-gradient(90deg,#0ea5e9,#38bdf8)",
                        critical: false,
                      },
                      {
                        name: "Wants",
                        amt: "₦168K",
                        pct: 53,
                        color: "linear-gradient(90deg,#818cf8,#a5b4fc)",
                        critical: false,
                      },
                      {
                        name: "Savings",
                        amt: "₦240K",
                        pct: 0,
                        color: "linear-gradient(90deg,#06b6d4,#22d3ee)",
                        critical: false,
                      },
                      {
                        name: "Utility",
                        amt: "₦6K",
                        pct: 90,
                        color: "linear-gradient(90deg,#f43f5e,#e11d48)",
                        critical: true,
                      },
                    ].map((b, i) => (
                      <div
                        key={i}
                        style={{
                          padding: "10px 12px",
                          borderRadius: 10,
                          background: "linear-gradient(135deg,#0d1b35,#0a1528)",
                          border: `1px solid ${
                            b.critical
                              ? "rgba(244,63,94,0.22)"
                              : "rgba(56,189,248,0.07)"
                          }`,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: 7,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 8,
                              fontWeight: 700,
                              textTransform: "uppercase" as const,
                              letterSpacing: "0.18em",
                              color: "rgba(255,255,255,0.28)",
                              fontFamily: "'Syne',sans-serif",
                            }}
                          >
                            {b.name}
                          </span>
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 800,
                              fontFamily: "'Syne',sans-serif",
                              color: b.critical
                                ? "#f43f5e"
                                : "rgba(255,255,255,0.85)",
                            }}
                          >
                            {b.amt}
                          </span>
                        </div>
                        <div
                          style={{
                            height: 4,
                            borderRadius: 99,
                            background: "rgba(255,255,255,0.06)",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${b.pct}%`,
                              borderRadius: 99,
                              background: b.color,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Activity */}
                  <div
                    className="lp-preview-activity"
                    style={{
                      padding: 12,
                      borderRadius: 10,
                      background: "linear-gradient(135deg,#0d1b35,#0a1528)",
                      border: "1px solid rgba(56,189,248,0.07)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 8,
                        fontWeight: 700,
                        textTransform: "uppercase" as const,
                        letterSpacing: "0.18em",
                        color: "rgba(255,255,255,0.25)",
                        marginBottom: 8,
                        fontFamily: "'Syne',sans-serif",
                      }}
                    >
                      Activity
                    </div>
                    {[
                      { name: "Freelance", amt: "+₦450K", up: true },
                      { name: "Rent", amt: "-₦150K", up: false },
                      { name: "Groceries", amt: "-₦28K", up: false },
                      { name: "Salary", amt: "+₦750K", up: true },
                      { name: "Netflix", amt: "-₦5.4K", up: false },
                    ].map((tx, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "5px 0",
                          borderBottom:
                            i < 4 ? "1px solid rgba(255,255,255,0.04)" : "none",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <span
                            style={{
                              width: 5,
                              height: 5,
                              borderRadius: "50%",
                              background: tx.up ? "#38bdf8" : "#f43f5e",
                              display: "inline-block",
                              flexShrink: 0,
                            }}
                          />
                          <span
                            style={{
                              fontSize: 9,
                              color: "rgba(255,255,255,0.45)",
                              fontFamily: "'DM Sans',sans-serif",
                            }}
                          >
                            {tx.name}
                          </span>
                        </div>
                        <span
                          style={{
                            fontSize: 9,
                            fontWeight: 700,
                            fontFamily: "'Syne',sans-serif",
                            color: tx.up ? "#38bdf8" : "#f43f5e",
                          }}
                        >
                          {tx.amt}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── STATS BAND ── */}
        <div
          style={{
            padding: "56px 0",
            background:
              "linear-gradient(135deg,rgba(14,165,233,0.05),rgba(99,102,241,0.03))",
            borderTop: "1px solid rgba(14,165,233,0.10)",
            borderBottom: "1px solid rgba(14,165,233,0.10)",
          }}
        >
          <div className="lp-stats-grid">
            {[
              { num: "₦∞", label: "Tracked per user", blue: true },
              { num: "50/30", label: "Default split rule", blue: false },
              { num: "100%", label: "Ledger accuracy", blue: true },
              { num: "0₦", label: "Cost to start today", blue: false },
            ].map((s, i) => (
              <div
                key={i}
                className={i === 1 ? "lp-stat-border-2" : ""}
                style={{
                  textAlign: "center",
                  padding: "16px 20px",
                  borderRight:
                    i < 3 ? "1px solid rgba(255,255,255,0.05)" : "none",
                }}
              >
                <div
                  style={{
                    fontFamily: "'Syne',sans-serif",
                    fontSize: 38,
                    fontWeight: 800,
                    lineHeight: 1.1,
                    background: s.blue
                      ? "linear-gradient(135deg,#0ea5e9,#38bdf8)"
                      : "linear-gradient(135deg,#818cf8,#a5b4fc)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {s.num}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.28)",
                    marginTop: 6,
                  }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── HOW IT WORKS ── */}
        <section
          id="howitworks"
          className="lp-section"
          style={{ padding: "100px 0" }}
        >
          <div className="lp-container">
            <div style={{ marginBottom: 56 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 16,
                }}
              >
                <div style={{ width: 20, height: 1, background: "#0ea5e9" }} />
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: "uppercase" as const,
                    letterSpacing: "0.2em",
                    color: "rgba(56,189,248,0.80)",
                    fontFamily: "'Syne',sans-serif",
                  }}
                >
                  How It Works
                </span>
              </div>
              <h2
                style={{
                  fontFamily: "'Syne',sans-serif",
                  fontSize: "clamp(32px,4vw,52px)",
                  fontWeight: 800,
                  letterSpacing: "-1px",
                  color: "white",
                  marginBottom: 16,
                  lineHeight: 1.1,
                }}
              >
                From income to insight
                <br />
                <span
                  style={{
                    background: "linear-gradient(135deg,#38bdf8,#818cf8)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  in three steps.
                </span>
              </h2>
            </div>
            <div className="lp-steps-grid">
              {[
                {
                  num: "01",
                  icon: "💰",
                  title: "Log Your Income",
                  body: "Enter a single income transaction and SpendNub instantly applies your budget rules — splitting funds across Needs, Wants, Savings, and custom buckets.",
                  cls: "lp-step-first",
                  radius: "18px 0 0 18px",
                },
                {
                  num: "02",
                  icon: "⚙️",
                  title: "Engine Distributes",
                  body: "The InsightService intercepts each transaction and writes atomic ledger entries for every category. Every naira is accounted for with a unique Ledger ID.",
                  cls: "lp-step-mid",
                  radius: "0",
                },
                {
                  num: "03",
                  icon: "📡",
                  title: "Pulse Your Dashboard",
                  body: "Watch your Financial Pulse in real-time. Monitor bucket health, track rolling balances, and catch overspending before it becomes a problem.",
                  cls: "lp-step-last",
                  radius: "0 18px 18px 0",
                },
              ].map((step, i) => (
                <div
                  key={i}
                  className={step.cls}
                  style={{
                    padding: "40px 32px",
                    background:
                      "linear-gradient(135deg,rgba(13,27,53,0.80),rgba(10,21,40,0.90))",
                    border: "1px solid rgba(56,189,248,0.08)",
                    borderRadius: step.radius,
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Syne',sans-serif",
                      fontSize: 52,
                      fontWeight: 800,
                      lineHeight: 1,
                      background:
                        "linear-gradient(135deg,rgba(56,189,248,0.12),transparent)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                      marginBottom: 20,
                    }}
                  >
                    {step.num}
                  </div>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 14,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 22,
                      marginBottom: 20,
                      background: "rgba(14,165,233,0.10)",
                      border: "1px solid rgba(14,165,233,0.22)",
                    }}
                  >
                    {step.icon}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Syne',sans-serif",
                      fontSize: 18,
                      fontWeight: 700,
                      color: "white",
                      marginBottom: 10,
                    }}
                  >
                    {step.title}
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      color: "rgba(255,255,255,0.35)",
                      lineHeight: 1.75,
                    }}
                  >
                    {step.body}
                  </div>
                  {i < 2 && (
                    <div
                      className="lp-step-connector"
                      style={{
                        position: "absolute",
                        right: -1,
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: 2,
                        height: 40,
                        background:
                          "linear-gradient(180deg,transparent,rgba(56,189,248,0.40),transparent)",
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section
          id="features"
          className="lp-section"
          style={{ padding: "100px 0" }}
        >
          <div className="lp-container">
            <div style={{ marginBottom: 56 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 16,
                }}
              >
                <div style={{ width: 20, height: 1, background: "#0ea5e9" }} />
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: "uppercase" as const,
                    letterSpacing: "0.2em",
                    color: "rgba(56,189,248,0.80)",
                    fontFamily: "'Syne',sans-serif",
                  }}
                >
                  Features
                </span>
              </div>
              <h2
                style={{
                  fontFamily: "'Syne',sans-serif",
                  fontSize: "clamp(32px,4vw,52px)",
                  fontWeight: 800,
                  letterSpacing: "-1px",
                  color: "white",
                  marginBottom: 16,
                  lineHeight: 1.1,
                }}
              >
                A finance engine,
                <br />
                <span
                  style={{
                    background: "linear-gradient(135deg,#38bdf8,#818cf8)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  not just a tracker.
                </span>
              </h2>
            </div>
            <div className="lp-features-grid">
              {[
                {
                  icon: "🧮",
                  title: "Smart Income Splitting",
                  body: "Log once — the engine auto-distributes across your budget buckets using custom percentage rules. No manual math, ever.",
                  tag: "✦ Automated",
                  blue: true,
                },
                {
                  icon: "💎",
                  title: "Sinking Fund Engine",
                  body: "Unspent money rolls over month to month. Your buckets accumulate wealth instead of resetting to zero like traditional apps.",
                  tag: "✦ Rolling Balance",
                  blue: false,
                },
              ].map((f, i) => (
                <div
                  key={i}
                  style={{
                    padding: 36,
                    borderRadius: 20,
                    background: "linear-gradient(135deg,#0d1b35,#0a1528)",
                    border: "1px solid rgba(56,189,248,0.08)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      width: 120,
                      height: 120,
                      background: f.blue
                        ? "radial-gradient(circle at top right,rgba(14,165,233,0.08),transparent 70%)"
                        : "radial-gradient(circle at top right,rgba(99,102,241,0.08),transparent 70%)",
                      pointerEvents: "none",
                    }}
                  />
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 16,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 24,
                      marginBottom: 24,
                      background: f.blue
                        ? "rgba(14,165,233,0.10)"
                        : "rgba(99,102,241,0.10)",
                      border: `1px solid ${
                        f.blue
                          ? "rgba(14,165,233,0.22)"
                          : "rgba(99,102,241,0.22)"
                      }`,
                    }}
                  >
                    {f.icon}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Syne',sans-serif",
                      fontSize: 20,
                      fontWeight: 700,
                      color: "white",
                      marginBottom: 12,
                    }}
                  >
                    {f.title}
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      color: "rgba(255,255,255,0.38)",
                      lineHeight: 1.75,
                    }}
                  >
                    {f.body}
                  </div>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      marginTop: 20,
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: "uppercase" as const,
                      letterSpacing: "0.15em",
                      fontFamily: "'Syne',sans-serif",
                      padding: "5px 12px",
                      borderRadius: 99,
                      color: f.blue
                        ? "rgba(56,189,248,0.80)"
                        : "rgba(129,140,248,0.80)",
                      background: f.blue
                        ? "rgba(14,165,233,0.08)"
                        : "rgba(99,102,241,0.08)",
                      border: `1px solid ${
                        f.blue
                          ? "rgba(14,165,233,0.18)"
                          : "rgba(99,102,241,0.18)"
                      }`,
                    }}
                  >
                    {f.tag}
                  </div>
                </div>
              ))}
              {/* Wide ledger feature */}
              <div
                className="lp-feature-wide"
                style={{
                  gridColumn: "span 2",
                  padding: 36,
                  borderRadius: 20,
                  background: "linear-gradient(135deg,#0d1b35,#0a1528)",
                  border: "1px solid rgba(56,189,248,0.08)",
                  overflow: "hidden",
                }}
              >
                <div
                  className="lp-wide-inner"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 32,
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: 16,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 24,
                        marginBottom: 24,
                        background: "rgba(14,165,233,0.10)",
                        border: "1px solid rgba(14,165,233,0.22)",
                      }}
                    >
                      📒
                    </div>
                    <div
                      style={{
                        fontFamily: "'Syne',sans-serif",
                        fontSize: 20,
                        fontWeight: 700,
                        color: "white",
                        marginBottom: 12,
                      }}
                    >
                      Double-Entry Ledger Architecture
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        color: "rgba(255,255,255,0.38)",
                        lineHeight: 1.75,
                      }}
                    >
                      Every transaction creates an immutable audit trail. Delete
                      an income? The engine automatically writes a perfect
                      reversal entry. Your balance is never wrong.
                    </div>
                    <div
                      style={{
                        display: "inline-flex",
                        marginTop: 20,
                        fontSize: 10,
                        fontWeight: 700,
                        textTransform: "uppercase" as const,
                        letterSpacing: "0.15em",
                        fontFamily: "'Syne',sans-serif",
                        padding: "5px 12px",
                        borderRadius: 99,
                        color: "rgba(56,189,248,0.80)",
                        background: "rgba(14,165,233,0.08)",
                        border: "1px solid rgba(14,165,233,0.18)",
                      }}
                    >
                      ✦ Audit Grade
                    </div>
                  </div>
                  <div
                    style={{
                      padding: 20,
                      borderRadius: 16,
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(56,189,248,0.07)",
                    }}
                  >
                    {[
                      {
                        id: "LDG-001",
                        desc: "Salary — Oct",
                        amt: "+₦750,000",
                        pos: true,
                      },
                      {
                        id: "LDG-002",
                        desc: "Needs Split 50%",
                        amt: "+₦375,000",
                        pos: true,
                      },
                      {
                        id: "LDG-003",
                        desc: "Rent · Needs",
                        amt: "-₦150,000",
                        pos: false,
                      },
                      {
                        id: "LDG-004",
                        desc: "Wants Split 30%",
                        amt: "+₦225,000",
                        pos: true,
                      },
                      {
                        id: "LDG-005",
                        desc: "Savings Split 20%",
                        amt: "+₦150,000",
                        pos: true,
                      },
                    ].map((row, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "10px 14px",
                          borderRadius: 10,
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(56,189,248,0.06)",
                          marginBottom: i < 4 ? 6 : 0,
                        }}
                      >
                        <span
                          style={{
                            color: "rgba(56,189,248,0.55)",
                            fontFamily: "'Syne',sans-serif",
                            fontSize: 9,
                            fontWeight: 700,
                          }}
                        >
                          {row.id}
                        </span>
                        <span
                          style={{
                            fontSize: 11,
                            color: "rgba(255,255,255,0.50)",
                            fontFamily: "'DM Sans',sans-serif",
                          }}
                        >
                          {row.desc}
                        </span>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            fontFamily: "'Syne',sans-serif",
                            color: row.pos ? "#38bdf8" : "#f43f5e",
                          }}
                        >
                          {row.amt}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── PRICING ── */}
        <PricingSection />

        {/* ── CTA ── */}
        <section
          className="lp-cta-section"
          style={{
            padding: "120px 0",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
              width: 700,
              height: 700,
              borderRadius: "50%",
              background:
                "radial-gradient(circle,rgba(2,132,199,0.08) 0%,transparent 65%)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "40%",
              left: "60%",
              width: 400,
              height: 400,
              borderRadius: "50%",
              background:
                "radial-gradient(circle,rgba(99,102,241,0.06) 0%,transparent 65%)",
              pointerEvents: "none",
            }}
          />
          <div
            className="lp-container"
            style={{ position: "relative", zIndex: 1 }}
          >
            <h2
              style={{
                fontFamily: "'Syne',sans-serif",
                fontSize: "clamp(36px,5vw,64px)",
                fontWeight: 800,
                letterSpacing: "-1.5px",
                color: "white",
                marginBottom: 20,
              }}
            >
              Ready to take{" "}
              <span
                style={{
                  background: "linear-gradient(135deg,#38bdf8,#818cf8)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                control?
              </span>
            </h2>
            <p
              style={{
                fontSize: 16,
                color: "rgba(255,255,255,0.35)",
                maxWidth: 480,
                margin: "0 auto 40px",
                lineHeight: 1.7,
              }}
            >
              Join finance-minded Nigerians who track every naira with
              precision.
            </p>
            <div
              style={{
                display: "flex",
                gap: 14,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <Link
                href={isLoggedIn ? "/dashboard" : "/signup"}
                style={{
                  padding: "16px 36px",
                  borderRadius: 14,
                  fontSize: 14,
                  fontWeight: 700,
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.1em",
                  background: "linear-gradient(135deg,#0284c7,#0ea5e9)",
                  color: "white",
                  textDecoration: "none",
                  fontFamily: "'Syne',sans-serif",
                  boxShadow: "0 6px 28px rgba(2,132,199,0.50)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                {isLoggedIn
                  ? "Go to Dashboard →"
                  : "Start Free — No Card Needed →"}
              </Link>
              {!isLoggedIn && (
                <Link
                  href="/login"
                  style={{
                    padding: "16px 36px",
                    borderRadius: 14,
                    fontSize: 14,
                    fontWeight: 700,
                    textTransform: "uppercase" as const,
                    letterSpacing: "0.1em",
                    background: "rgba(255,255,255,0.05)",
                    color: "rgba(255,255,255,0.60)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    textDecoration: "none",
                    fontFamily: "'Syne',sans-serif",
                  }}
                >
                  I Already Have an Account
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="lp-footer">
          <div>
            <div
              style={{
                fontFamily: "'Syne',sans-serif",
                fontSize: 16,
                fontWeight: 800,
                color: "white",
              }}
            >
              SpendNub<span style={{ color: "#38bdf8" }}>.</span>
            </div>
            <div
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.22)",
                marginTop: 2,
              }}
            >
              Financial Engineering for the Modern Person
            </div>
          </div>
          <div className="lp-footer-links" style={{ display: "flex", gap: 24 }}>
            {["Privacy", "Terms", "GitHub", "Contact"].map((l) => (
              <a
                key={l}
                href="#"
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,0.28)",
                  textDecoration: "none",
                }}
              >
                {l}
              </a>
            ))}
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.18)" }}>
            © 2026 ShotNub Solutions · Nigeria 🇳🇬
          </div>
        </footer>
      </div>
    </>
  );
}
