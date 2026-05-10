"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Check,
  Crown,
  Zap,
  Users,
  Loader2,
  ArrowLeft,
  Lock,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { ApiError } from "@/types";

type Plan = "personal" | "family";
type Cycle = "monthly" | "annual";

interface AccessStatus {
  hasAccess: boolean;
  plan: string;
  isSubscribed: boolean;
  isTrial: boolean;
  isExpired: boolean;
  daysRemaining: number | null;
  subscriptionExpiresAt: string | null;
}

const PLANS = {
  personal: {
    name: "Personal",
    icon: Zap,
    color: "#0284c7",
    monthly: 1500,
    annual: 15000,
    annualMonthly: 1250,
    savings: 3000,
    description: "For individuals serious about budgeting",
    features: [
      { text: "Unlimited budget buckets", ok: true },
      { text: "Full ledger audit trail (all time)", ok: true },
      { text: "Sinking fund / rolling balance", ok: true },
      { text: "Unlimited subcategories", ok: true },
      { text: "Data export (CSV)", ok: true },
      { text: "Priority support", ok: true },
    ],
  },
  family: {
    name: "Family",
    icon: Users,
    color: "#7c3aed",
    monthly: 3500,
    annual: 36000,
    annualMonthly: 3000,
    savings: 6000,
    description: "For households managing shared finances",
    features: [
      { text: "Everything in Personal", ok: true },
      { text: "Up to 3 budget profiles", ok: true },
      { text: "Shared Pulse view (family)", ok: true },
      { text: "WhatsApp expense logging bot", ok: true },
      { text: "Budget templates", ok: true },
      { text: "Dedicated support", ok: true },
    ],
  },
};

const FREE_FEATURES = [
  { text: "4 budget buckets", ok: true },
  { text: "Income & expense logging", ok: true },
  { text: "Basic dashboard", ok: true },
  { text: "30-day transaction history", ok: true },
  { text: "Unlimited buckets", ok: false },
  { text: "Full ledger history", ok: false },
];

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
  warn: "#d97706",
  danger: "#e11d48",
};

export default function SubscribePage() {
  const router = useRouter();
  const [sub, setSub] = useState<AccessStatus | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan>("personal");
  const [cycle, setCycle] = useState<Cycle>("monthly");
  const [loading, setLoading] = useState<Plan | null>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    api
      .get("/subscription/status")
      .then((r) => setSub(r.data))
      .catch(() => null)
      .finally(() => setFetching(false));
  }, []);

  const handleSubscribe = async (plan: Plan) => {
    setLoading(plan);
    try {
      const { data } = await api.post("/subscription/initiate", {
        gateway: "paystack",
        plan,
        billingCycle: cycle,
      });
      // Use assign() instead of direct href assignment — avoids ESLint immutability rule
      window.location.assign(data.url);
    } catch (err) {
      const e = err as ApiError;
      toast.error(
        e.response?.data?.message ||
          "Could not initiate payment. Please try again."
      );
      setLoading(null);
    }
  };

  if (fetching)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: C.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Loader2 size={32} className="animate-spin" style={{ color: C.blue }} />
      </div>
    );

  const isCurrentPlan = (plan: Plan) => sub?.isSubscribed && sub?.plan === plan;
  const currentAmount = (plan: Plan) =>
    cycle === "annual" ? PLANS[plan].annual : PLANS[plan].monthly;
  const monthlyEquiv = (plan: Plan) =>
    cycle === "annual" ? PLANS[plan].annualMonthly : PLANS[plan].monthly;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        backgroundImage:
          "linear-gradient(rgba(2,132,199,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(2,132,199,0.03) 1px,transparent 1px)",
        backgroundSize: "48px 48px",
      }}
    >
      {/* Subtle ambient orbs */}
      <div
        style={{
          position: "fixed",
          top: "-20%",
          right: "-10%",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background:
            "radial-gradient(circle,rgba(2,132,199,0.06) 0%,transparent 65%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "fixed",
          bottom: "-20%",
          left: "-10%",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background:
            "radial-gradient(circle,rgba(124,58,237,0.04) 0%,transparent 65%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          maxWidth: 1000,
          margin: "0 auto",
          padding: "48px 24px 100px",
          position: "relative",
        }}
      >
        {/* Back nav */}
        <Link
          href="/dashboard"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12,
            color: C.text3,
            textDecoration: "none",
            fontFamily: "'DM Sans',sans-serif",
            marginBottom: 40,
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLAnchorElement).style.color = C.text1)
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLAnchorElement).style.color = C.text3)
          }
        >
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          {sub && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "5px 14px",
                borderRadius: 99,
                background: sub.isExpired
                  ? "rgba(225,29,72,0.08)"
                  : sub.isTrial
                  ? "rgba(217,119,6,0.08)"
                  : "rgba(2,132,199,0.09)",
                border: `1px solid ${
                  sub.isExpired
                    ? "rgba(225,29,72,0.20)"
                    : sub.isTrial
                    ? "rgba(217,119,6,0.20)"
                    : "rgba(2,132,199,0.22)"
                }`,
                marginBottom: 20,
              }}
            >
              {sub.isSubscribed && !sub.isTrial && (
                <Crown size={11} color={C.blue} />
              )}
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  fontFamily: "'Syne',sans-serif",
                  color: sub.isExpired
                    ? C.danger
                    : sub.isTrial
                    ? C.warn
                    : C.blue,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase" as const,
                }}
              >
                {sub.isExpired
                  ? "Trial Expired"
                  : sub.isTrial
                  ? `Trial · ${sub.daysRemaining}d left`
                  : `${
                      sub.plan.charAt(0).toUpperCase() + sub.plan.slice(1)
                    } Plan`}
              </span>
            </div>
          )}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              justifyContent: "center",
              marginBottom: 12,
            }}
          >
            <div style={{ width: 28, height: 1, background: C.blue }} />
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                textTransform: "uppercase" as const,
                letterSpacing: "0.2em",
                color: "rgba(2,132,199,0.75)",
                fontFamily: "'Syne',sans-serif",
              }}
            >
              Upgrade
            </span>
            <div style={{ width: 28, height: 1, background: C.blue }} />
          </div>
          <h1
            style={{
              fontFamily: "'Syne',sans-serif",
              fontSize: "clamp(28px,4vw,44px)",
              fontWeight: 800,
              color: C.text1,
              letterSpacing: "-1px",
              marginBottom: 12,
            }}
          >
            Simple pricing.{" "}
            <span
              style={{
                background: "linear-gradient(135deg,#0284c7,#7c3aed)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Serious value.
            </span>
          </h1>
          <p
            style={{
              fontSize: 15,
              color: C.text2,
              maxWidth: 420,
              margin: "0 auto",
              fontFamily: "'DM Sans',sans-serif",
            }}
          >
            Start free, upgrade when you need more. No hidden fees. Cancel
            anytime.
          </p>
        </div>

        {/* Billing toggle */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 40,
          }}
        >
          <div
            style={{
              display: "flex",
              padding: 4,
              borderRadius: 12,
              background: C.card,
              border: C.border,
              gap: 2,
            }}
          >
            {(["monthly", "annual"] as Cycle[]).map((c) => (
              <button
                key={c}
                onClick={() => setCycle(c)}
                style={{
                  padding: "8px 22px",
                  borderRadius: 9,
                  fontSize: 12,
                  fontWeight: 700,
                  fontFamily: "'Syne',sans-serif",
                  border: "none",
                  cursor: "pointer",
                  letterSpacing: "0.05em",
                  textTransform: "capitalize" as const,
                  transition: "all 0.2s",
                  background:
                    cycle === c
                      ? "linear-gradient(135deg,#0284c7,#0ea5e9)"
                      : "transparent",
                  color: cycle === c ? "white" : C.text3,
                  boxShadow:
                    cycle === c ? "0 2px 14px rgba(2,132,199,0.32)" : "none",
                }}
              >
                {c}
                {c === "annual" && (
                  <span
                    style={{
                      marginLeft: 6,
                      fontSize: 9,
                      background:
                        cycle === c
                          ? "rgba(255,255,255,0.22)"
                          : "rgba(2,132,199,0.14)",
                      color: cycle === c ? "white" : C.blue,
                      padding: "1px 5px",
                      borderRadius: 4,
                      fontWeight: 700,
                    }}
                  >
                    SAVE 2 MO
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Plan cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.08fr 1fr",
            gap: 16,
            marginBottom: 48,
            alignItems: "start",
          }}
        >
          {/* Free */}
          <div
            style={{
              padding: "28px 24px",
              borderRadius: 20,
              background: C.cardHi,
              border: C.border,
              boxShadow: "0 2px 12px rgba(2,132,199,0.06)",
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                textTransform: "uppercase" as const,
                letterSpacing: "0.2em",
                color: C.text3,
                fontFamily: "'Syne',sans-serif",
                marginBottom: 10,
              }}
            >
              Free Forever
            </div>
            <div
              style={{
                fontFamily: "'Syne',sans-serif",
                fontSize: 36,
                fontWeight: 800,
                color: C.text1,
                lineHeight: 1,
                marginBottom: 4,
              }}
            >
              ₦0
              <span style={{ fontSize: 14, fontWeight: 500, color: C.text3 }}>
                /mo
              </span>
            </div>
            <div
              style={{
                fontSize: 12,
                color: C.text3,
                marginBottom: 20,
                fontFamily: "'DM Sans',sans-serif",
              }}
            >
              4-bucket limit
            </div>
            <div
              style={{ height: 1, background: C.border, marginBottom: 18 }}
            />
            <ul
              style={{
                listStyle: "none",
                display: "flex",
                flexDirection: "column",
                gap: 9,
                marginBottom: 24,
              }}
            >
              {FREE_FEATURES.map((f, i) => (
                <li
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 12,
                    color: f.ok ? C.text2 : C.text3,
                  }}
                >
                  <span
                    style={{
                      color: f.ok ? C.success : "rgba(12,26,53,0.20)",
                      fontSize: 13,
                      flexShrink: 0,
                    }}
                  >
                    {f.ok ? "✓" : "✗"}
                  </span>
                  {f.text}
                </li>
              ))}
            </ul>
            <div
              style={{
                display: "block",
                textAlign: "center",
                padding: "11px",
                borderRadius: 11,
                fontSize: 12,
                fontWeight: 700,
                textTransform: "uppercase" as const,
                letterSpacing: "0.08em",
                fontFamily: "'Syne',sans-serif",
                background: C.card,
                color: C.text3,
                border: C.border,
                cursor: "default",
              }}
            >
              {sub?.isExpired || (!sub?.isSubscribed && !sub?.isTrial)
                ? "Current Plan"
                : "Free Tier"}
            </div>
          </div>

          {/* Personal & Family */}
          {(["personal", "family"] as Plan[]).map((plan) => {
            const P = PLANS[plan];
            const Icon = P.icon;
            const isCurrent = isCurrentPlan(plan);
            const featured = plan === "personal";
            return (
              <div
                key={plan}
                style={{
                  position: "relative",
                  padding: "28px 24px",
                  borderRadius: 20,
                  background: C.cardHi,
                  border: `1.5px solid ${P.color}${featured ? "40" : "28"}`,
                  boxShadow: featured
                    ? `0 4px 28px ${P.color}14`
                    : "0 2px 12px rgba(2,132,199,0.06)",
                  transform: featured ? "scale(1.02)" : "none",
                }}
              >
                {featured && (
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
                      textTransform: "uppercase" as const,
                      letterSpacing: "0.15em",
                      background: "linear-gradient(135deg,#0284c7,#0ea5e9)",
                      color: "white",
                      fontFamily: "'Syne',sans-serif",
                      boxShadow: "0 4px 16px rgba(2,132,199,0.38)",
                      whiteSpace: "nowrap" as const,
                    }}
                  >
                    Most Popular
                  </div>
                )}
                {isCurrent && (
                  <div
                    style={{
                      position: "absolute",
                      top: -12,
                      right: 16,
                      padding: "4px 12px",
                      borderRadius: 99,
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: "uppercase" as const,
                      letterSpacing: "0.1em",
                      background: `${P.color}14`,
                      border: `1px solid ${P.color}35`,
                      color: P.color,
                      fontFamily: "'Syne',sans-serif",
                    }}
                  >
                    Active
                  </div>
                )}
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: "uppercase" as const,
                    letterSpacing: "0.2em",
                    color: P.color,
                    fontFamily: "'Syne',sans-serif",
                    marginBottom: 6,
                  }}
                >
                  {P.name}
                </div>
                <p
                  style={{
                    fontSize: 12,
                    color: C.text2,
                    fontFamily: "'DM Sans',sans-serif",
                    marginBottom: 12,
                  }}
                >
                  {P.description}
                </p>
                <div
                  style={{
                    fontFamily: "'Syne',sans-serif",
                    fontSize: 36,
                    fontWeight: 800,
                    color: C.text1,
                    lineHeight: 1,
                  }}
                >
                  ₦{monthlyEquiv(plan).toLocaleString()}
                  <span
                    style={{ fontSize: 14, fontWeight: 500, color: C.text3 }}
                  >
                    /mo
                  </span>
                </div>
                {cycle === "annual" && (
                  <div
                    style={{
                      fontSize: 12,
                      color: P.color,
                      marginTop: 4,
                      marginBottom: 4,
                      fontFamily: "'DM Sans',sans-serif",
                      fontWeight: 600,
                    }}
                  >
                    ₦{P.annual.toLocaleString()} billed annually · save ₦
                    {P.savings.toLocaleString()}
                  </div>
                )}
                <div
                  style={{
                    fontSize: 11,
                    color: C.text3,
                    marginBottom: 20,
                    fontFamily: "'DM Sans',sans-serif",
                  }}
                >
                  {cycle === "monthly"
                    ? "Billed monthly"
                    : `₦${currentAmount(plan).toLocaleString()} billed once`}
                </div>
                <div
                  style={{
                    height: 1,
                    background: `${P.color}18`,
                    marginBottom: 18,
                  }}
                />
                <ul
                  style={{
                    listStyle: "none",
                    display: "flex",
                    flexDirection: "column",
                    gap: 9,
                    marginBottom: 24,
                  }}
                >
                  {P.features.map((f, i) => (
                    <li
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        fontSize: 12,
                        color: C.text2,
                      }}
                    >
                      <Check
                        size={13}
                        style={{ color: P.color, flexShrink: 0 }}
                      />
                      {f.text}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => !isCurrent && handleSubscribe(plan)}
                  disabled={isCurrent || loading !== null}
                  style={{
                    width: "100%",
                    padding: "13px",
                    borderRadius: 12,
                    fontSize: 12,
                    fontWeight: 700,
                    textTransform: "uppercase" as const,
                    letterSpacing: "0.08em",
                    fontFamily: "'Syne',sans-serif",
                    border: "none",
                    cursor: isCurrent ? "default" : "pointer",
                    background: isCurrent
                      ? `${P.color}12`
                      : `linear-gradient(135deg,${P.color},${P.color}cc)`,
                    color: isCurrent ? P.color : "white",
                    boxShadow: isCurrent ? "none" : `0 4px 18px ${P.color}32`,
                    transition: "all 0.2s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  {loading === plan ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : isCurrent ? (
                    <Crown size={14} />
                  ) : null}
                  {loading === plan
                    ? "Redirecting…"
                    : isCurrent
                    ? "Current Plan"
                    : `Subscribe · ₦${currentAmount(plan).toLocaleString()}`}
                </button>
              </div>
            );
          })}
        </div>

        {/* Payment note */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            marginBottom: 32,
          }}
        >
          <Lock size={12} color={C.text3} />
          <p
            style={{
              fontSize: 12,
              color: C.text3,
              fontFamily: "'DM Sans',sans-serif",
              textAlign: "center",
            }}
          >
            Payments powered by Paystack · Secure 256-bit SSL encryption ·
            Cancel anytime
          </p>
        </div>

        {/* Data safety note */}
        <div
          style={{
            padding: "20px 24px",
            borderRadius: 16,
            background: "rgba(2,132,199,0.05)",
            border: "1px solid rgba(2,132,199,0.14)",
            maxWidth: 600,
            margin: "0 auto",
          }}
        >
          <p
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: C.blue,
              fontFamily: "'Syne',sans-serif",
              marginBottom: 6,
            }}
          >
            Your data is always safe
          </p>
          <p
            style={{
              fontSize: 12,
              color: C.text2,
              lineHeight: 1.7,
              fontFamily: "'DM Sans',sans-serif",
            }}
          >
            If your subscription lapses, buckets beyond the free limit are{" "}
            <strong style={{ color: C.text1 }}>soft-locked</strong> — not
            deleted. All transactions, labels, and history are preserved.
            Resubscribe anytime to instantly restore full access.
          </p>
        </div>
      </div>
    </div>
  );
}
