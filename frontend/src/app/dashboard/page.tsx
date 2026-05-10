"use client";
import { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowRight,
  History,
  Zap,
  Activity,
  Lock,
  Crown,
  AlertTriangle,
  Sparkles,
  PlusCircle,
  BarChart2,
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────
interface AccessStatus {
  hasAccess: boolean;
  plan: string;
  isSubscribed: boolean;
  isTrial: boolean;
  isExpired: boolean;
  trialExpiration: string | null;
  subscriptionExpiresAt: string | null;
  bucketLimit: number;
  daysRemaining: number | null;
}
interface Bucket {
  _id: string;
  name: string;
  percentage: number;
  allocated: number;
  spent: number;
  remaining: number;
  isLocked?: boolean;
}
interface IncomeSplit {
  categoryName: string;
  allocatedAmount: number;
  _id: string;
}
interface Transaction {
  _id: string;
  type: "income" | "expense";
  amount?: number;
  description?: string;
  category?: string;
  subCategory?: string;
  date?: string;
  totalAmount?: number;
  splits?: IncomeSplit[];
  createdAt?: string;
}
interface DashboardData {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  buckets: Bucket[];
  recentTransactions: Transaction[];
  lockedCount?: number;
  upgradeRequired?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  n.toLocaleString("en-NG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
const txAmount = (tx: Transaction) =>
  tx.type === "income" ? tx.totalAmount ?? 0 : tx.amount ?? 0;
const txDesc = (tx: Transaction) => tx.description ?? "Transaction";
const txCat = (tx: Transaction) => {
  if (tx.type === "income") {
    const c = tx.splits?.length ?? 0;
    return `Split across ${c} bucket${c !== 1 ? "s" : ""}`;
  }
  return tx.subCategory
    ? `${tx.category} · ${tx.subCategory}`
    : tx.category ?? "General";
};
const txDate = (tx: Transaction) => {
  const raw = tx.date ?? tx.createdAt;
  return raw
    ? new Date(raw).toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short",
      })
    : "";
};

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg: "#e0f2fe",
  card: "#f0f9ff",
  cardHi: "#ffffff",
  border: "rgba(2,132,199,0.12)",
  borderM: "rgba(2,132,199,0.22)",
  text1: "#0c1a35",
  text2: "rgba(12,26,53,0.60)",
  text3: "rgba(12,26,53,0.38)",
  blue: "#0284c7",
  blueB: "#0ea5e9",
  blueL: "#38bdf8",
  success: "#059669",
  warn: "#d97706",
  danger: "#e11d48",
};

// ─── Plan Badge ───────────────────────────────────────────────────────────────
function PlanBadge({ status }: { status: AccessStatus }) {
  const label = status.isTrial
    ? "Trial"
    : status.plan.charAt(0).toUpperCase() + status.plan.slice(1);
  const color = status.isExpired
    ? C.danger
    : status.isTrial
    ? C.warn
    : status.isSubscribed
    ? C.success
    : C.danger;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 10px",
        borderRadius: 99,
        background: `${color}18`,
        border: `1px solid ${color}35`,
      }}
    >
      {status.isSubscribed && !status.isTrial && (
        <Crown size={9} color={color} />
      )}
      <span
        style={{
          fontSize: 9,
          fontWeight: 700,
          color,
          fontFamily: "'Syne',sans-serif",
          letterSpacing: "0.1em",
          textTransform: "uppercase" as const,
        }}
      >
        {label}
        {status.daysRemaining !== null && !status.isSubscribed && status.isTrial
          ? ` · ${status.daysRemaining}d`
          : ""}
      </span>
    </div>
  );
}

// ─── Sub Banner ───────────────────────────────────────────────────────────────
function SubBanner({ status }: { status: AccessStatus }) {
  if (status.isExpired)
    return (
      <div
        style={{
          padding: "14px 18px",
          borderRadius: 14,
          background: "rgba(225,29,72,0.07)",
          border: "1px solid rgba(225,29,72,0.18)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 20,
          flexWrap: "wrap" as const,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              background: "rgba(225,29,72,0.09)",
              border: "1px solid rgba(225,29,72,0.20)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <AlertTriangle size={15} color={C.danger} />
          </div>
          <div>
            <p
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: C.text1,
                fontFamily: "'Syne',sans-serif",
                marginBottom: 1,
              }}
            >
              Trial Expired
            </p>
            <p
              style={{
                fontSize: 11,
                color: C.text2,
                fontFamily: "'DM Sans',sans-serif",
              }}
            >
              Buckets beyond the free limit are locked. Your data is safe.
            </p>
          </div>
        </div>
        <Link
          href="/subscribe"
          style={{
            padding: "9px 20px",
            borderRadius: 10,
            background: "linear-gradient(135deg,#0284c7,#0ea5e9)",
            color: "white",
            textDecoration: "none",
            fontSize: 12,
            fontWeight: 700,
            fontFamily: "'Syne',sans-serif",
            whiteSpace: "nowrap" as const,
            boxShadow: "0 4px 14px rgba(2,132,199,0.32)",
          }}
        >
          Upgrade Now →
        </Link>
      </div>
    );
  if (
    status.isTrial &&
    status.daysRemaining !== null &&
    status.daysRemaining <= 7
  )
    return (
      <div
        style={{
          padding: "14px 18px",
          borderRadius: 14,
          background: "rgba(217,119,6,0.07)",
          border: "1px solid rgba(217,119,6,0.18)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 20,
          flexWrap: "wrap" as const,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              background: "rgba(217,119,6,0.09)",
              border: "1px solid rgba(217,119,6,0.20)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Sparkles size={15} color={C.warn} />
          </div>
          <div>
            <p
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: C.text1,
                fontFamily: "'Syne',sans-serif",
                marginBottom: 1,
              }}
            >
              Trial ends in {status.daysRemaining} day
              {status.daysRemaining !== 1 ? "s" : ""}
            </p>
            <p
              style={{
                fontSize: 11,
                color: C.text2,
                fontFamily: "'DM Sans',sans-serif",
              }}
            >
              Subscribe to keep full access — Personal from ₦1,500/mo.
            </p>
          </div>
        </div>
        <Link
          href="/subscribe"
          style={{
            padding: "9px 20px",
            borderRadius: 10,
            background: "linear-gradient(135deg,#d97706,#b45309)",
            color: "white",
            textDecoration: "none",
            fontSize: 12,
            fontWeight: 700,
            fontFamily: "'Syne',sans-serif",
            whiteSpace: "nowrap" as const,
          }}
        >
          Subscribe →
        </Link>
      </div>
    );
  if (
    status.isSubscribed &&
    status.daysRemaining !== null &&
    status.daysRemaining <= 7
  )
    return (
      <div
        style={{
          padding: "12px 16px",
          borderRadius: 12,
          background: "rgba(217,119,6,0.06)",
          border: "1px solid rgba(217,119,6,0.16)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Crown size={13} color={C.warn} />
          <p
            style={{
              fontSize: 12,
              color: C.text2,
              fontFamily: "'DM Sans',sans-serif",
            }}
          >
            <span style={{ color: C.text1, fontWeight: 600 }}>
              {status.plan.charAt(0).toUpperCase() + status.plan.slice(1)}
            </span>{" "}
            plan renews in {status.daysRemaining} days
          </p>
        </div>
        <Link
          href="/subscribe"
          style={{
            fontSize: 11,
            color: C.warn,
            fontWeight: 700,
            textDecoration: "none",
            fontFamily: "'Syne',sans-serif",
          }}
        >
          Renew →
        </Link>
      </div>
    );
  return null;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  title,
  value,
  icon,
  trend,
  accent,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  trend?: string;
  accent: "blue" | "green" | "red";
}) {
  const A = {
    blue: {
      border: "rgba(2,132,199,0.20)",
      ibg: "rgba(2,132,199,0.09)",
      ib: "rgba(2,132,199,0.22)",
      ic: C.blue,
      tc: C.blue,
      vg: `linear-gradient(135deg,${C.blue},${C.blueB})`,
    },
    green: {
      border: "rgba(5,150,105,0.18)",
      ibg: "rgba(5,150,105,0.08)",
      ib: "rgba(5,150,105,0.20)",
      ic: C.success,
      tc: C.success,
      vg: "linear-gradient(135deg,#059669,#10b981)",
    },
    red: {
      border: "rgba(225,29,72,0.15)",
      ibg: "rgba(225,29,72,0.07)",
      ib: "rgba(225,29,72,0.18)",
      ic: C.danger,
      tc: C.danger,
      vg: "linear-gradient(135deg,#e11d48,#f43f5e)",
    },
  }[accent];
  return (
    <div
      style={{
        padding: 22,
        borderRadius: 18,
        background: C.cardHi,
        border: `1px solid ${A.border}`,
        boxShadow: "0 2px 12px rgba(2,132,199,0.07)",
        transition: "all 0.2s",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.boxShadow = "0 6px 20px rgba(2,132,199,0.12)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.boxShadow = "0 2px 12px rgba(2,132,199,0.07)")
      }
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 18,
        }}
      >
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 13,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: A.ibg,
            border: `1px solid ${A.ib}`,
          }}
        >
          <span style={{ color: A.ic }}>{icon}</span>
        </div>
        {trend && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              textTransform: "uppercase" as const,
              letterSpacing: "0.08em",
              color: A.tc,
              background: `${A.tc}12`,
              padding: "3px 8px",
              borderRadius: 6,
              fontFamily: "'Syne',sans-serif",
            }}
          >
            {trend}
          </span>
        )}
      </div>
      <p
        style={{
          fontSize: 10,
          fontWeight: 700,
          textTransform: "uppercase" as const,
          letterSpacing: "0.16em",
          color: C.text3,
          fontFamily: "'Syne',sans-serif",
          marginBottom: 6,
        }}
      >
        {title}
      </p>
      <h2
        style={{
          fontSize: 26,
          fontWeight: 800,
          fontFamily: "'Syne',sans-serif",
          background: A.vg,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        ₦{fmt(value)}
      </h2>
    </div>
  );
}

// ─── Empty Buckets ────────────────────────────────────────────────────────────
function EmptyBuckets() {
  return (
    <div
      style={{
        gridColumn: "1 / -1",
        padding: "48px 32px",
        borderRadius: 18,
        background: C.cardHi,
        border: `2px dashed rgba(2,132,199,0.20)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 16,
          background: "rgba(2,132,199,0.08)",
          border: "1px solid rgba(2,132,199,0.18)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <BarChart2 size={22} color={C.blue} />
      </div>
      <div>
        <p
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: C.text1,
            fontFamily: "'Syne',sans-serif",
            marginBottom: 6,
          }}
        >
          No budget buckets yet
        </p>
        <p
          style={{
            fontSize: 13,
            color: C.text2,
            fontFamily: "'DM Sans',sans-serif",
            lineHeight: 1.6,
            maxWidth: 300,
          }}
        >
          Set up your budget rules to start splitting income automatically.
        </p>
      </div>
      <Link
        href="/budget/config"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "10px 20px",
          borderRadius: 12,
          background: "linear-gradient(135deg,#0284c7,#0ea5e9)",
          color: "white",
          textDecoration: "none",
          fontSize: 13,
          fontWeight: 700,
          fontFamily: "'Syne',sans-serif",
          boxShadow: "0 4px 14px rgba(2,132,199,0.30)",
        }}
      >
        <PlusCircle size={15} /> Set Up Budget Rules
      </Link>
    </div>
  );
}

// ─── Bucket colors ────────────────────────────────────────────────────────────
const BCOLORS = [
  "#0284c7",
  "#059669",
  "#7c3aed",
  "#d97706",
  "#0891b2",
  "#db2777",
  "#16a34a",
  "#9333ea",
];

// ─── Bucket Card ──────────────────────────────────────────────────────────────
function BucketCard({ bucket, index }: { bucket: Bucket; index: number }) {
  const { allocated, spent, isLocked } = bucket;
  const remaining =
    bucket.remaining > 0
      ? bucket.remaining
      : allocated > 0
      ? Math.max(allocated - spent, 0)
      : 0;
  const progress = allocated > 0 ? Math.min((spent / allocated) * 100, 100) : 0;
  const isCritical = progress > 90;
  const isWarning = progress > 65 && !isCritical;
  const isEmpty = spent === 0;
  const accent = BCOLORS[index % BCOLORS.length];
  const barColor = isCritical ? C.danger : isWarning ? C.warn : accent;

  if (isLocked)
    return (
      <div
        style={{
          position: "relative",
          borderRadius: 16,
          overflow: "hidden",
          border: "1px solid rgba(217,119,6,0.22)",
          background: "linear-gradient(135deg,#fffbeb,#fef3c7)",
          minHeight: 148,
        }}
      >
        <div
          style={{
            padding: 18,
            filter: "blur(3px)",
            opacity: 0.3,
            pointerEvents: "none",
          }}
        >
          <p
            style={{
              fontSize: 9,
              fontWeight: 700,
              textTransform: "uppercase" as const,
              letterSpacing: "0.2em",
              color: C.text3,
              fontFamily: "'Syne',sans-serif",
              marginBottom: 6,
            }}
          >
            {bucket.name}
          </p>
          <p
            style={{
              fontSize: 20,
              fontWeight: 800,
              color: C.text1,
              fontFamily: "'Syne',sans-serif",
              marginBottom: 10,
            }}
          >
            ₦{fmt(allocated)}
          </p>
          <div
            style={{
              height: 5,
              borderRadius: 99,
              background: "rgba(2,132,199,0.12)",
            }}
          />
        </div>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            background: "rgba(255,251,235,0.88)",
            backdropFilter: "blur(2px)",
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "rgba(217,119,6,0.10)",
              border: "1px solid rgba(217,119,6,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Lock size={16} color={C.warn} />
          </div>
          <p
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: C.text1,
              fontFamily: "'Syne',sans-serif",
            }}
          >
            {bucket.name}
          </p>
          <p
            style={{
              fontSize: 10,
              color: C.text2,
              fontFamily: "'DM Sans',sans-serif",
            }}
          >
            Free plan · 4 buckets max
          </p>
          <Link
            href="/subscribe"
            style={{
              marginTop: 2,
              fontSize: 11,
              fontWeight: 700,
              color: C.warn,
              textDecoration: "none",
              fontFamily: "'Syne',sans-serif",
              background: "rgba(217,119,6,0.08)",
              padding: "4px 14px",
              borderRadius: 99,
              border: "1px solid rgba(217,119,6,0.22)",
            }}
          >
            Unlock with Personal →
          </Link>
        </div>
      </div>
    );

  return (
    <div
      style={{
        padding: 18,
        borderRadius: 16,
        background: C.cardHi,
        border: isCritical ? "1px solid rgba(225,29,72,0.22)" : C.border,
        boxShadow: "0 1px 6px rgba(2,132,199,0.06)",
        transition: "all 0.2s",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.boxShadow = "0 4px 16px rgba(2,132,199,0.10)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.boxShadow = "0 1px 6px rgba(2,132,199,0.06)")
      }
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 14,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: accent,
              boxShadow: `0 0 6px ${accent}70`,
            }}
          />
          <div>
            <p
              style={{
                fontSize: 9,
                fontWeight: 700,
                textTransform: "uppercase" as const,
                letterSpacing: "0.18em",
                color: C.text3,
                fontFamily: "'Syne',sans-serif",
                marginBottom: 3,
              }}
            >
              {bucket.name}
            </p>
            <h4
              style={{
                fontSize: 20,
                fontWeight: 800,
                fontFamily: "'Syne',sans-serif",
                color: C.text1,
              }}
            >
              ₦{fmt(allocated)}
            </h4>
            <p
              style={{
                fontSize: 10,
                color: C.text3,
                fontFamily: "'DM Sans',sans-serif",
              }}
            >
              allocated
            </p>
          </div>
        </div>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            padding: "3px 8px",
            borderRadius: 8,
            background: `${accent}12`,
            color: accent,
            border: `1px solid ${accent}25`,
            fontFamily: "'Syne',sans-serif",
          }}
        >
          {bucket.percentage}%
        </span>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
          marginBottom: 14,
        }}
      >
        <div
          style={{
            padding: "8px 10px",
            borderRadius: 10,
            background: "rgba(225,29,72,0.05)",
            border: "1px solid rgba(225,29,72,0.12)",
          }}
        >
          <p
            style={{
              fontSize: 8,
              fontWeight: 700,
              textTransform: "uppercase" as const,
              letterSpacing: "0.15em",
              color: "rgba(225,29,72,0.55)",
              fontFamily: "'Syne',sans-serif",
              marginBottom: 3,
            }}
          >
            Spent
          </p>
          <p
            style={{
              fontSize: 14,
              fontWeight: 800,
              fontFamily: "'Syne',sans-serif",
              color: spent > 0 ? C.danger : C.text3,
            }}
          >
            ₦{fmt(spent)}
          </p>
        </div>
        <div
          style={{
            padding: "8px 10px",
            borderRadius: 10,
            background: `${barColor}08`,
            border: `1px solid ${barColor}18`,
          }}
        >
          <p
            style={{
              fontSize: 8,
              fontWeight: 700,
              textTransform: "uppercase" as const,
              letterSpacing: "0.15em",
              color: `${barColor}90`,
              fontFamily: "'Syne',sans-serif",
              marginBottom: 3,
            }}
          >
            Remaining
          </p>
          <p
            style={{
              fontSize: 14,
              fontWeight: 800,
              fontFamily: "'Syne',sans-serif",
              color: isEmpty ? C.text3 : barColor,
            }}
          >
            ₦{fmt(remaining)}
          </p>
        </div>
      </div>
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 6,
          }}
        >
          <span
            style={{
              fontSize: 9,
              fontWeight: 700,
              textTransform: "uppercase" as const,
              letterSpacing: "0.12em",
              color: C.text3,
              fontFamily: "'Syne',sans-serif",
            }}
          >
            Usage
          </span>
          <span
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: isEmpty ? C.text3 : barColor,
              fontFamily: "'Syne',sans-serif",
            }}
          >
            {progress.toFixed(0)}%
          </span>
        </div>
        <div
          style={{
            height: 6,
            borderRadius: 99,
            background: "rgba(2,132,199,0.10)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              borderRadius: 99,
              background: isEmpty
                ? "rgba(2,132,199,0.10)"
                : `linear-gradient(90deg,${barColor},${barColor}cc)`,
              boxShadow: isEmpty ? "none" : `0 0 8px ${barColor}50`,
              transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)",
            }}
          />
        </div>
        {isEmpty && (
          <p
            style={{
              fontSize: 9,
              color: C.text3,
              fontFamily: "'DM Sans',sans-serif",
              marginTop: 4,
            }}
          >
            No expenses logged yet
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Tx Row ───────────────────────────────────────────────────────────────────
function TxRow({ tx }: { tx: Transaction }) {
  const amount = txAmount(tx);
  const isInc = tx.type === "income";
  return (
    <div
      style={{
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: `1px solid ${C.border}`,
        transition: "background 0.15s",
        cursor: "default",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = "rgba(2,132,199,0.04)")
      }
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            background: isInc ? "rgba(5,150,105,0.09)" : "rgba(225,29,72,0.08)",
            border: `1px solid ${
              isInc ? "rgba(5,150,105,0.20)" : "rgba(225,29,72,0.18)"
            }`,
          }}
        >
          {isInc ? (
            <TrendingUp size={13} style={{ color: C.success }} />
          ) : (
            <TrendingDown size={13} style={{ color: C.danger }} />
          )}
        </div>
        <div>
          <p
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: C.text1,
              fontFamily: "'DM Sans',sans-serif",
              lineHeight: 1.3,
            }}
          >
            {txDesc(tx)}
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginTop: 2,
            }}
          >
            <p
              style={{
                fontSize: 10,
                color: C.text3,
                fontFamily: "'DM Sans',sans-serif",
              }}
            >
              {txCat(tx)}
            </p>
            {txDate(tx) && (
              <>
                <span style={{ color: C.border, fontSize: 8 }}>·</span>
                <p
                  style={{
                    fontSize: 10,
                    color: C.text3,
                    fontFamily: "'DM Sans',sans-serif",
                  }}
                >
                  {txDate(tx)}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <p
          style={{
            fontSize: 13,
            fontWeight: 800,
            fontFamily: "'Syne',sans-serif",
            color: isInc ? C.success : C.danger,
          }}
        >
          {isInc ? "+" : "-"}₦{fmt(amount)}
        </p>
        {isInc && tx.splits && (
          <p
            style={{
              fontSize: 9,
              color: C.blue,
              fontFamily: "'Syne',sans-serif",
              marginTop: 1,
            }}
          >
            {tx.splits.length} splits
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Empty Transactions ───────────────────────────────────────────────────────
function EmptyTransactions() {
  return (
    <div
      style={{
        padding: "36px 24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          background: "rgba(2,132,199,0.07)",
          border: C.border,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <History size={17} color={C.blue} />
      </div>
      <div>
        <p
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: C.text2,
            fontFamily: "'Syne',sans-serif",
            marginBottom: 4,
          }}
        >
          No transactions yet
        </p>
        <p
          style={{
            fontSize: 11,
            color: C.text3,
            fontFamily: "'DM Sans',sans-serif",
            lineHeight: 1.5,
          }}
        >
          Log your first income to get started.
        </p>
      </div>
      <Link
        href="/income"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          padding: "8px 16px",
          borderRadius: 10,
          background: "rgba(2,132,199,0.08)",
          border: "1px solid rgba(2,132,199,0.18)",
          color: C.blue,
          textDecoration: "none",
          fontSize: 11,
          fontWeight: 700,
          fontFamily: "'Syne',sans-serif",
        }}
      >
        <PlusCircle size={13} /> Log Income
      </Link>
    </div>
  );
}

// ─── Welcome Banner ───────────────────────────────────────────────────────────
function WelcomeBanner() {
  return (
    <div
      style={{
        padding: "20px 24px",
        borderRadius: 16,
        background:
          "linear-gradient(135deg,rgba(2,132,199,0.08),rgba(14,165,233,0.04))",
        border: "1px solid rgba(2,132,199,0.18)",
        marginBottom: 20,
        display: "flex",
        alignItems: "center",
        gap: 16,
        flexWrap: "wrap" as const,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          background: "rgba(2,132,199,0.10)",
          border: "1px solid rgba(2,132,199,0.22)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Zap size={18} color={C.blue} />
      </div>
      <div style={{ flex: 1, minWidth: 200 }}>
        <p
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: C.text1,
            fontFamily: "'Syne',sans-serif",
            marginBottom: 3,
          }}
        >
          Welcome to SpendNub 👋
        </p>
        <p
          style={{
            fontSize: 12,
            color: C.text2,
            fontFamily: "'DM Sans',sans-serif",
            lineHeight: 1.5,
          }}
        >
          Start by setting up your budget buckets, then log your income to see
          the magic happen.
        </p>
      </div>
      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        <Link
          href="/budget/config"
          style={{
            padding: "9px 16px",
            borderRadius: 10,
            background: "linear-gradient(135deg,#0284c7,#0ea5e9)",
            color: "white",
            textDecoration: "none",
            fontSize: 12,
            fontWeight: 700,
            fontFamily: "'Syne',sans-serif",
            whiteSpace: "nowrap" as const,
            boxShadow: "0 4px 14px rgba(2,132,199,0.28)",
          }}
        >
          Set Up Budget
        </Link>
        <Link
          href="/income"
          style={{
            padding: "9px 16px",
            borderRadius: 10,
            background: C.cardHi,
            border: C.border,
            color: C.text2,
            textDecoration: "none",
            fontSize: 12,
            fontWeight: 700,
            fontFamily: "'Syne',sans-serif",
            whiteSpace: "nowrap" as const,
          }}
        >
          Log Income
        </Link>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [sub, setSub] = useState<AccessStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSub = api
      .get("/subscription/status")
      .then((s) => setSub(s.data))
      .catch(() => null);
    const fetchDashboard = api
      .get("/dashboard/summary")
      .then((d) => setData(d.data))
      .catch((err) => {
        if (err?.response?.status === 403) {
          setData({
            totalBalance: 0,
            totalIncome: 0,
            totalExpenses: 0,
            buckets: [],
            recentTransactions: [],
            upgradeRequired: true,
            lockedCount: 0,
          });
        } else {
          toast.error("Dashboard sync failed");
        }
      });
    Promise.all([fetchSub, fetchDashboard]).finally(() => setLoading(false));
  }, []);

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading)
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
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(2,132,199,0.10)",
              border: "1px solid rgba(2,132,199,0.22)",
            }}
          >
            <Zap
              size={20}
              style={{ color: C.blue, animation: "pulse 1.5s ease infinite" }}
            />
          </div>
          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              textTransform: "uppercase" as const,
              letterSpacing: "0.2em",
              color: C.text3,
              fontFamily: "'Syne',sans-serif",
            }}
          >
            Syncing pulse…
          </p>
        </div>
      </div>
    );

  // ── No data ───────────────────────────────────────────────────────────────
  if (!data)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: C.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <div style={{ maxWidth: 480, width: "100%", textAlign: "center" }}>
          {sub && <SubBanner status={sub} />}
          <p
            style={{
              fontSize: 13,
              color: C.text3,
              fontFamily: "'DM Sans',sans-serif",
              marginTop: 16,
            }}
          >
            Restore your subscription to access your dashboard.
          </p>
        </div>
      </div>
    );

  const isNewAccount =
    data.totalIncome === 0 &&
    data.totalExpenses === 0 &&
    data.buckets.length === 0;
  const hasBuckets = data.buckets.length > 0;
  const totalAllocated = data.buckets.reduce((s, b) => s + b.allocated, 0);
  const locked = data.buckets.filter((b) => b.isLocked);
  const active = data.buckets.filter((b) => !b.isLocked);

  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>
      {/* Subtle grid */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          opacity: 0.4,
          backgroundImage:
            "linear-gradient(rgba(2,132,199,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(2,132,199,0.04) 1px,transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div
        style={{
          position: "relative",
          maxWidth: 1200,
          margin: "0 auto",
          padding: "40px 24px 120px",
        }}
      >
        {/* Header */}
        <header
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 20,
            marginBottom: 24,
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 6,
              }}
            >
              <Activity size={13} style={{ color: C.blue }} />
              <p
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.2em",
                  color: C.blue,
                  fontFamily: "'Syne',sans-serif",
                }}
              >
                Live Overview
              </p>
              {sub && <PlanBadge status={sub} />}
            </div>
            <h1
              style={{
                fontFamily: "'Syne',sans-serif",
                fontSize: "clamp(24px,4vw,32px)",
                fontWeight: 800,
                color: C.text1,
                letterSpacing: "-0.5px",
                marginBottom: 4,
              }}
            >
              Financial Pulse
            </h1>
            <p
              style={{
                fontSize: 14,
                color: C.text2,
                fontFamily: "'DM Sans',sans-serif",
              }}
            >
              Here&apos;s what&apos;s happening with your money today.
            </p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Link href="/income">
              <button
                style={{
                  padding: "10px 18px",
                  borderRadius: 12,
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: "uppercase" as const,
                  fontFamily: "'Syne',sans-serif",
                  background: "linear-gradient(135deg,#0284c7,#0ea5e9)",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(2,132,199,0.28)",
                  letterSpacing: "0.04em",
                }}
              >
                + Income
              </button>
            </Link>
            <Link href="/expenses">
              <button
                style={{
                  padding: "10px 18px",
                  borderRadius: 12,
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: "uppercase" as const,
                  fontFamily: "'Syne',sans-serif",
                  background: C.cardHi,
                  border: `1.5px solid ${C.borderM}`,
                  color: C.text2,
                  cursor: "pointer",
                  letterSpacing: "0.04em",
                }}
              >
                + Expense
              </button>
            </Link>
          </div>
        </header>

        {/* Banners */}
        {sub && <SubBanner status={sub} />}
        {isNewAccount && <WelcomeBanner />}
        {!isNewAccount && data.upgradeRequired && locked.length > 0 && (
          <div
            style={{
              padding: "12px 16px",
              borderRadius: 14,
              background: "rgba(217,119,6,0.07)",
              border: "1px solid rgba(217,119,6,0.18)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              marginBottom: 20,
              flexWrap: "wrap" as const,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Lock size={13} color={C.warn} />
              <p
                style={{
                  fontSize: 12,
                  color: C.text2,
                  fontFamily: "'DM Sans',sans-serif",
                }}
              >
                <span style={{ color: C.text1, fontWeight: 600 }}>
                  {locked.length} bucket{locked.length !== 1 ? "s" : ""} locked
                </span>{" "}
                — free plan includes 4 active buckets.
              </p>
            </div>
            <Link
              href="/subscribe"
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: C.warn,
                textDecoration: "none",
                fontFamily: "'Syne',sans-serif",
                padding: "5px 14px",
                borderRadius: 8,
                background: "rgba(217,119,6,0.08)",
                border: "1px solid rgba(217,119,6,0.20)",
                whiteSpace: "nowrap" as const,
              }}
            >
              Unlock All →
            </Link>
          </div>
        )}

        {/* Stat Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
            gap: 16,
            marginBottom: 32,
          }}
        >
          <StatCard
            title="Total Balance"
            value={data.totalBalance}
            icon={<Wallet size={18} />}
            accent="blue"
          />
          <StatCard
            title="Total Income"
            value={data.totalIncome}
            icon={<TrendingUp size={18} />}
            trend="This Month"
            accent="green"
          />
          <StatCard
            title="Total Expenses"
            value={data.totalExpenses}
            icon={<TrendingDown size={18} />}
            trend="This Month"
            accent="red"
          />
        </div>

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24 }}
          className="lg:grid-cols-[1fr_340px]"
        >
          {/* Buckets */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 14,
                paddingLeft: 4,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 3,
                    height: 18,
                    borderRadius: 99,
                    background: `linear-gradient(180deg,${C.blue},${C.blueL})`,
                  }}
                />
                <h3
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: "uppercase" as const,
                    letterSpacing: "0.2em",
                    color: C.text2,
                    fontFamily: "'Syne',sans-serif",
                  }}
                >
                  Bucket Allocation
                </h3>
                {locked.length > 0 && (
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      color: C.warn,
                      background: "rgba(217,119,6,0.10)",
                      padding: "2px 8px",
                      borderRadius: 99,
                      border: "1px solid rgba(217,119,6,0.22)",
                      fontFamily: "'Syne',sans-serif",
                    }}
                  >
                    {locked.length} locked
                  </span>
                )}
              </div>
              {hasBuckets && (
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      color: C.blue,
                      fontFamily: "'Syne',sans-serif",
                    }}
                  >
                    ₦{fmt(totalAllocated)} total
                  </span>
                  <Link
                    href="/budget/config"
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: "uppercase" as const,
                      letterSpacing: "0.08em",
                      color: C.blue,
                      fontFamily: "'Syne',sans-serif",
                      textDecoration: "none",
                    }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLAnchorElement).style.opacity =
                        "0.7")
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLAnchorElement).style.opacity =
                        "1")
                    }
                  >
                    Adjust Rules →
                  </Link>
                </div>
              )}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))",
                gap: 12,
              }}
            >
              {hasBuckets ? (
                [...active, ...locked].map((b, i) => (
                  <BucketCard key={b._id} bucket={b} index={i} />
                ))
              ) : (
                <EmptyBuckets />
              )}
            </div>
          </div>

          {/* Activity */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 14,
                paddingLeft: 4,
              }}
            >
              <div
                style={{
                  width: 3,
                  height: 18,
                  borderRadius: 99,
                  background: `linear-gradient(180deg,${C.blue},${C.blueL})`,
                }}
              />
              <History size={13} style={{ color: C.text3 }} />
              <h3
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.2em",
                  color: C.text2,
                  fontFamily: "'Syne',sans-serif",
                }}
              >
                Activity
              </h3>
            </div>
            <div
              style={{
                borderRadius: 18,
                overflow: "hidden",
                background: C.cardHi,
                border: C.border,
                boxShadow: "0 2px 12px rgba(2,132,199,0.07)",
              }}
            >
              {data.recentTransactions.length === 0 ? (
                <EmptyTransactions />
              ) : (
                <div>
                  {data.recentTransactions.map((tx) => (
                    <TxRow key={tx._id} tx={tx} />
                  ))}
                </div>
              )}
              {data.recentTransactions.length > 0 && (
                <Link
                  href="/transactions"
                  style={{
                    width: "100%",
                    padding: "14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: "uppercase" as const,
                    letterSpacing: "0.12em",
                    fontFamily: "'Syne',sans-serif",
                    color: C.text3,
                    borderTop: `1px solid ${C.border}`,
                    textDecoration: "none",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.color = C.blue;
                    (e.currentTarget as HTMLAnchorElement).style.background =
                      "rgba(2,132,199,0.04)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.color =
                      C.text3;
                    (e.currentTarget as HTMLAnchorElement).style.background =
                      "transparent";
                  }}
                >
                  View All History <ArrowRight size={11} />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
