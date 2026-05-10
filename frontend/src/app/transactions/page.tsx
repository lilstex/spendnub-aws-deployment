"use client";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Download,
  Loader2,
  FileText,
  Lock,
  Crown,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Calendar,
  X,
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";

interface Transaction {
  _id: string;
  type: "income" | "expense";
  description: string;
  amount?: number;
  totalAmount?: number;
  category: string;
  subCategory?: string;
  date?: string;
  createdAt: string;
}
interface PageMeta {
  total: number;
  page: number;
  pages: number;
  isLimited: boolean;
  limitNote: string | null;
}
interface AccessStatus {
  isSubscribed: boolean;
  isTrial: boolean;
  isExpired: boolean;
  plan: string;
  bucketLimit: number;
}

const fmt = (n: number) =>
  "₦" + n.toLocaleString("en-NG", { minimumFractionDigits: 0 });
const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
const getAmount = (tx: Transaction) =>
  tx.type === "income" ? tx.totalAmount ?? 0 : tx.amount ?? 0;
const getDate = (tx: Transaction) => tx.date ?? tx.createdAt;

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

const CATEGORY_COLORS: Record<string, string> = {
  income: "#059669",
  needs: "#0284c7",
  wants: "#d97706",
  savings: "#7c3aed",
  investment: "#0891b2",
  utility: "#e11d48",
  feeding: "#16a34a",
  transport: "#9333ea",
  default: "#4a7fa5",
};
const catColor = (cat: string) =>
  CATEGORY_COLORS[cat?.toLowerCase()] ?? CATEGORY_COLORS.default;

// ─── Filter Bar ───────────────────────────────────────────────────────────────
function FilterBar({
  typeFilter,
  setTypeFilter,
  from,
  setFrom,
  to,
  setTo,
  onReset,
}: {
  typeFilter: string;
  setTypeFilter: (v: string) => void;
  from: string;
  setFrom: (v: string) => void;
  to: string;
  setTo: (v: string) => void;
  onReset: () => void;
}) {
  const hasFilters = typeFilter !== "all" || from || to;
  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        alignItems: "center",
        flexWrap: "wrap" as const,
        marginBottom: 24,
      }}
    >
      <div
        style={{
          display: "inline-flex",
          padding: 3,
          borderRadius: 10,
          background: C.card,
          border: C.border,
          gap: 2,
        }}
      >
        {(["all", "income", "expense"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            style={{
              padding: "7px 14px",
              borderRadius: 8,
              fontSize: 11,
              fontWeight: 700,
              fontFamily: "'Syne',sans-serif",
              border: "none",
              cursor: "pointer",
              letterSpacing: "0.05em",
              textTransform: "uppercase" as const,
              transition: "all 0.15s",
              background:
                typeFilter === t
                  ? t === "income"
                    ? "rgba(5,150,105,0.14)"
                    : t === "expense"
                    ? "rgba(225,29,72,0.12)"
                    : "rgba(2,132,199,0.12)"
                  : "transparent",
              color:
                typeFilter === t
                  ? t === "income"
                    ? C.success
                    : t === "expense"
                    ? C.danger
                    : C.blue
                  : C.text3,
            }}
          >
            {t}
          </button>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "7px 12px",
          borderRadius: 10,
          background: C.card,
          border: C.border,
        }}
      >
        <Calendar size={12} style={{ color: C.text3, flexShrink: 0 }} />
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          style={{
            background: "transparent",
            border: "none",
            outline: "none",
            fontSize: 12,
            color: from ? C.text1 : C.text3,
            fontFamily: "'DM Sans',sans-serif",
            width: 120,
          }}
        />
        <span style={{ color: C.text3, fontSize: 11 }}>→</span>
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          style={{
            background: "transparent",
            border: "none",
            outline: "none",
            fontSize: 12,
            color: to ? C.text1 : C.text3,
            fontFamily: "'DM Sans',sans-serif",
            width: 120,
          }}
        />
      </div>
      {hasFilters && (
        <button
          onClick={onReset}
          style={{
            padding: "7px 12px",
            borderRadius: 10,
            background: "rgba(225,29,72,0.07)",
            border: "1px solid rgba(225,29,72,0.16)",
            color: "rgba(225,29,72,0.70)",
            fontSize: 11,
            fontWeight: 700,
            fontFamily: "'Syne',sans-serif",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          <X size={11} /> Clear
        </button>
      )}
    </div>
  );
}

// ─── Transaction Row ──────────────────────────────────────────────────────────
function TxRow({ tx }: { tx: Transaction }) {
  const isIncome = tx.type === "income";
  const amount = getAmount(tx);
  const color = catColor(tx.category);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "14px 18px",
        borderRadius: 14,
        background: C.cardHi,
        border: C.border,
        transition: "all 0.15s",
        boxShadow: "0 1px 4px rgba(2,132,199,0.05)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = C.borderM;
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 2px 12px rgba(2,132,199,0.09)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = C.border;
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 1px 4px rgba(2,132,199,0.05)";
      }}
    >
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 12,
          background: isIncome
            ? "rgba(5,150,105,0.09)"
            : "rgba(225,29,72,0.08)",
          border: `1px solid ${
            isIncome ? "rgba(5,150,105,0.20)" : "rgba(225,29,72,0.16)"
          }`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {isIncome ? (
          <ArrowUpRight size={15} color={C.success} />
        ) : (
          <ArrowDownLeft size={15} color={C.danger} />
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: C.text1,
            fontFamily: "'DM Sans',sans-serif",
            marginBottom: 3,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap" as const,
          }}
        >
          {tx.description || (isIncome ? "Income" : "Expense")}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color,
              background: `${color}12`,
              padding: "2px 7px",
              borderRadius: 99,
              border: `1px solid ${color}25`,
              fontFamily: "'Syne',sans-serif",
              textTransform: "uppercase" as const,
              letterSpacing: "0.08em",
            }}
          >
            {tx.category}
          </span>
          {tx.subCategory && (
            <span
              style={{
                fontSize: 10,
                color: C.text3,
                fontFamily: "'DM Sans',sans-serif",
              }}
            >
              › {tx.subCategory}
            </span>
          )}
        </div>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div
          style={{
            fontSize: 15,
            fontWeight: 800,
            fontFamily: "'Syne',sans-serif",
            color: isIncome ? C.success : C.danger,
            marginBottom: 2,
          }}
        >
          {isIncome ? "+" : "-"}
          {fmt(amount)}
        </div>
        <div
          style={{
            fontSize: 10,
            color: C.text3,
            fontFamily: "'DM Sans',sans-serif",
          }}
        >
          {fmtDate(getDate(tx))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const PAGE_SIZE = 20;

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [sub, setSub] = useState<AccessStatus | null>(null);
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [fetching, setFetching] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [mounted, setMounted] = useState(false);

  const canExport = (sub?.isSubscribed && !sub?.isExpired) || sub?.isTrial;
  const isLimitedHistory = !sub?.isSubscribed && !sub?.isTrial;

  const fetchTransactions = useCallback(async () => {
    setFetching(true);
    try {
      const params: Record<string, string | number> = {
        page,
        limit: PAGE_SIZE,
      };
      if (typeFilter !== "all") params.type = typeFilter;
      if (from) params.from = from;
      if (to) params.to = to;
      const res = await api.get("/transactions", { params });
      setTransactions(res.data.transactions ?? []);
      setMeta(res.data);
    } catch {
      toast.error("Failed to load transactions");
    } finally {
      setFetching(false);
    }
  }, [page, typeFilter, from, to]);

  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => {
    if (!mounted) return;
    api
      .get("/subscription/status")
      .then((r) => setSub(r.data))
      .catch(() => {});
  }, [mounted]);
  useEffect(() => {
    if (!mounted) return;
    fetchTransactions();
  }, [mounted, fetchTransactions]);
  const resetFilters = () => {
    setTypeFilter("all");
    setFrom("");
    setTo("");
    setPage(1);
  };
  useEffect(() => {
    setPage(1);
  }, [typeFilter, from, to]);

  const handleExport = async () => {
    if (!canExport) {
      toast.error("CSV export is available on Personal and Family plans.");
      return;
    }
    setExporting(true);
    try {
      const res = await api.get("/export/csv", { responseType: "blob" });
      const url = window.URL.createObjectURL(
        new Blob([res.data], { type: "text/csv" })
      );
      const a = document.createElement("a");
      a.href = url;
      a.download = `spendnub-export-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success("Export downloaded!");
    } catch {
      toast.error("Export failed. Try again.");
    } finally {
      setExporting(false);
    }
  };

  const totalIn = transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + getAmount(t), 0);
  const totalOut = transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + getAmount(t), 0);

  if (!mounted) return null;

  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>
      <div
        style={{ maxWidth: 760, margin: "0 auto", padding: "40px 24px 120px" }}
      >
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 10,
            }}
          >
            <div style={{ width: 20, height: 1, background: C.blue }} />
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
              Ledger
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap" as const,
            }}
          >
            <div>
              <h1
                style={{
                  fontFamily: "'Syne',sans-serif",
                  fontSize: "clamp(26px,4vw,34px)",
                  fontWeight: 800,
                  color: C.text1,
                  letterSpacing: "-0.5px",
                  marginBottom: 6,
                }}
              >
                Transaction History
              </h1>
              <p
                style={{
                  fontSize: 14,
                  color: C.text2,
                  lineHeight: 1.6,
                  fontFamily: "'DM Sans',sans-serif",
                }}
              >
                {sub?.isExpired
                  ? "Trial expired — showing last 30 days. Resubscribe for full history."
                  : sub?.isSubscribed || sub?.isTrial
                  ? "Full history — every transaction ever logged."
                  : "Showing the last 30 days. Upgrade for full history."}
              </p>
            </div>
            <button
              onClick={handleExport}
              disabled={exporting}
              title={
                canExport
                  ? "Download all transactions as CSV"
                  : "Upgrade to Personal to export"
              }
              style={{
                padding: "10px 18px",
                borderRadius: 12,
                background: canExport ? "rgba(2,132,199,0.09)" : C.card,
                border: `1px solid ${
                  canExport ? "rgba(2,132,199,0.25)" : C.border
                }`,
                color: canExport ? C.blue : C.text3,
                fontSize: 12,
                fontWeight: 700,
                fontFamily: "'Syne',sans-serif",
                cursor: canExport ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                gap: 7,
                flexShrink: 0,
                transition: "all 0.2s",
                letterSpacing: "0.04em",
                boxShadow: canExport
                  ? "0 2px 8px rgba(2,132,199,0.12)"
                  : "none",
              }}
              onMouseEnter={(e) => {
                if (canExport)
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "rgba(2,132,199,0.14)";
              }}
              onMouseLeave={(e) => {
                if (canExport)
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "rgba(2,132,199,0.09)";
              }}
            >
              {exporting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : canExport ? (
                <Download size={14} />
              ) : (
                <Lock size={14} />
              )}
              {exporting ? "Exporting…" : "Export CSV"}
            </button>
          </div>
        </div>

        {/* Upgrade banner */}
        {isLimitedHistory && (
          <div
            style={{
              padding: "12px 16px",
              borderRadius: 14,
              background: sub?.isExpired
                ? "rgba(225,29,72,0.06)"
                : "rgba(217,119,6,0.06)",
              border: `1px solid ${
                sub?.isExpired ? "rgba(225,29,72,0.16)" : "rgba(217,119,6,0.16)"
              }`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              marginBottom: 20,
              flexWrap: "wrap" as const,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Crown size={13} color={sub?.isExpired ? C.danger : C.warn} />
              <p
                style={{
                  fontSize: 12,
                  color: C.text2,
                  fontFamily: "'DM Sans',sans-serif",
                }}
              >
                {sub?.isExpired ? (
                  <>
                    <span style={{ color: C.text1, fontWeight: 600 }}>
                      Trial expired
                    </span>{" "}
                    — showing last 30 days. Resubscribe for full history &amp;
                    CSV export.
                  </>
                ) : (
                  <>
                    <span style={{ color: C.text1, fontWeight: 600 }}>
                      Free plan
                    </span>{" "}
                    — 30-day history &amp; no CSV export. Upgrade for full
                    access.
                  </>
                )}
              </p>
            </div>
            <Link
              href="/subscribe"
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: sub?.isExpired ? C.danger : C.warn,
                textDecoration: "none",
                fontFamily: "'Syne',sans-serif",
                padding: "5px 14px",
                borderRadius: 8,
                background: sub?.isExpired
                  ? "rgba(225,29,72,0.08)"
                  : "rgba(217,119,6,0.08)",
                border: `1px solid ${
                  sub?.isExpired
                    ? "rgba(225,29,72,0.20)"
                    : "rgba(217,119,6,0.20)"
                }`,
                whiteSpace: "nowrap" as const,
              }}
            >
              {sub?.isExpired ? "Resubscribe →" : "Upgrade →"}
            </Link>
          </div>
        )}

        {/* Summary stat cards */}
        {transactions.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              marginBottom: 24,
            }}
          >
            {[
              {
                label: "Money In",
                value: totalIn,
                icon: <TrendingUp size={15} color={C.success} />,
                color: C.success,
                bg: "rgba(5,150,105,0.08)",
                border: "rgba(5,150,105,0.18)",
              },
              {
                label: "Money Out",
                value: totalOut,
                icon: <TrendingDown size={15} color={C.danger} />,
                color: C.danger,
                bg: "rgba(225,29,72,0.07)",
                border: "rgba(225,29,72,0.16)",
              },
            ].map((s, i) => (
              <div
                key={i}
                style={{
                  padding: "16px 20px",
                  borderRadius: 16,
                  background: s.bg,
                  border: `1px solid ${s.border}`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    marginBottom: 8,
                  }}
                >
                  {s.icon}
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: "uppercase" as const,
                      letterSpacing: "0.15em",
                      color: C.text3,
                      fontFamily: "'Syne',sans-serif",
                    }}
                  >
                    {s.label}
                  </span>
                </div>
                <div
                  style={{
                    fontFamily: "'Syne',sans-serif",
                    fontSize: 24,
                    fontWeight: 800,
                    color: s.color,
                  }}
                >
                  {fmt(s.value)}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: C.text3,
                    fontFamily: "'DM Sans',sans-serif",
                    marginTop: 2,
                  }}
                >
                  this page ({transactions.length} records)
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Filter bar */}
        <FilterBar
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          from={from}
          setFrom={setFrom}
          to={to}
          setTo={setTo}
          onReset={resetFilters}
        />

        {/* 30-day cap note */}
        {meta?.isLimited && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              background: "rgba(217,119,6,0.06)",
              border: "1px solid rgba(217,119,6,0.16)",
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Lock size={12} color={C.warn} />
            <span
              style={{
                fontSize: 12,
                color: C.text2,
                fontFamily: "'DM Sans',sans-serif",
              }}
            >
              {meta.limitNote} —{" "}
              <Link
                href="/subscribe"
                style={{
                  color: C.warn,
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                Upgrade to see all →
              </Link>
            </span>
          </div>
        )}

        {/* Transaction list */}
        {fetching ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "80px 0",
              gap: 16,
            }}
          >
            <Loader2
              size={32}
              className="animate-spin"
              style={{ color: C.blue }}
            />
            <p
              style={{
                fontSize: 13,
                color: C.text3,
                fontFamily: "'DM Sans',sans-serif",
              }}
            >
              Loading transactions…
            </p>
          </div>
        ) : transactions.length === 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "80px 24px",
              gap: 16,
              borderRadius: 20,
              background: C.cardHi,
              border: `2px dashed ${C.border}`,
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: "rgba(2,132,199,0.08)",
                border: "1px solid rgba(2,132,199,0.18)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FileText size={24} color={C.blue} />
            </div>
            <div style={{ textAlign: "center" }}>
              <p
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: C.text1,
                  fontFamily: "'Syne',sans-serif",
                  marginBottom: 6,
                }}
              >
                No transactions found
              </p>
              <p
                style={{
                  fontSize: 13,
                  color: C.text2,
                  fontFamily: "'DM Sans',sans-serif",
                }}
              >
                {typeFilter !== "all" || from || to
                  ? "Try adjusting your filters."
                  : "Start by logging some income or expenses."}
              </p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <Link
                href="/income"
                style={{
                  padding: "9px 18px",
                  borderRadius: 10,
                  background: "rgba(5,150,105,0.09)",
                  border: "1px solid rgba(5,150,105,0.20)",
                  color: C.success,
                  fontSize: 12,
                  fontWeight: 700,
                  fontFamily: "'Syne',sans-serif",
                  textDecoration: "none",
                }}
              >
                Log Income
              </Link>
              <Link
                href="/expenses"
                style={{
                  padding: "9px 18px",
                  borderRadius: 10,
                  background: C.card,
                  border: C.border,
                  color: C.text2,
                  fontSize: 12,
                  fontWeight: 700,
                  fontFamily: "'Syne',sans-serif",
                  textDecoration: "none",
                }}
              >
                Log Expense
              </Link>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {transactions.map((tx) => (
              <TxRow key={tx._id} tx={tx} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {meta && meta.pages > 1 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              marginTop: 32,
            }}
          >
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: page === 1 ? C.card : C.cardHi,
                border: C.border,
                color: page === 1 ? C.text3 : C.text1,
                cursor: page === 1 ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow:
                  page === 1 ? "none" : "0 1px 4px rgba(2,132,199,0.08)",
              }}
            >
              <ChevronLeft size={16} />
            </button>
            <span
              style={{
                fontSize: 12,
                color: C.text2,
                fontFamily: "'DM Sans',sans-serif",
              }}
            >
              Page{" "}
              <span style={{ color: C.text1, fontWeight: 700 }}>{page}</span> of{" "}
              <span style={{ color: C.text1, fontWeight: 700 }}>
                {meta.pages}
              </span>
              <span style={{ color: C.text3, marginLeft: 8 }}>
                ({meta.total} total)
              </span>
            </span>
            <button
              onClick={() => setPage((p) => Math.min(meta.pages, p + 1))}
              disabled={page === meta.pages}
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: page === meta.pages ? C.card : C.cardHi,
                border: C.border,
                color: page === meta.pages ? C.text3 : C.text1,
                cursor: page === meta.pages ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow:
                  page === meta.pages
                    ? "none"
                    : "0 1px 4px rgba(2,132,199,0.08)",
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
