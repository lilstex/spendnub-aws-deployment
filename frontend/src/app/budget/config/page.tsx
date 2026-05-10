"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  Save,
  Loader2,
  AlertCircle,
  Info,
  Lock,
  Crown,
  Sparkles,
  X,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { ApiError } from "@/types";

interface CategorySplit {
  _id?: string;
  name: string;
  percentage: number;
  isLocked?: boolean;
}
interface Template {
  id: string;
  name: string;
  description: string;
  icon: string;
  categories: { name: string; percentage: number }[];
}
interface AccessStatus {
  hasAccess: boolean;
  plan: string;
  isSubscribed: boolean;
  isTrial: boolean;
  isExpired: boolean;
  bucketLimit: number;
  daysRemaining: number | null;
}

const COLORS = [
  "#0284c7",
  "#059669",
  "#7c3aed",
  "#d97706",
  "#e11d48",
  "#0891b2",
  "#16a34a",
  "#9333ea",
];
const FREE_LIMIT = 3;

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

// ─── Template Picker ──────────────────────────────────────────────────────────
function TemplatePicker({
  templates,
  bucketLimit,
  onSelect,
  onClose,
}: {
  templates: Template[];
  bucketLimit: number;
  onSelect: (t: Template) => void;
  onClose: () => void;
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(12,26,53,0.55)",
        backdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 580,
          borderRadius: 24,
          background: C.cardHi,
          border: C.border,
          boxShadow:
            "0 40px 100px rgba(2,132,199,0.14), 0 0 0 1px rgba(2,132,199,0.08)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "24px 28px 20px",
            borderBottom: `1px solid ${C.border}`,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                marginBottom: 6,
              }}
            >
              <Sparkles size={13} color={C.blue} />
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
                Quick Start
              </span>
            </div>
            <h2
              style={{
                fontFamily: "'Syne',sans-serif",
                fontSize: 20,
                fontWeight: 800,
                color: C.text1,
                marginBottom: 4,
              }}
            >
              Choose a Template
            </h2>
            <p
              style={{
                fontSize: 12,
                color: C.text3,
                fontFamily: "'DM Sans',sans-serif",
              }}
            >
              Populates your buckets instantly. Customise before saving.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              background: C.card,
              border: C.border,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: C.text3,
              flexShrink: 0,
              marginTop: 2,
            }}
          >
            <X size={15} />
          </button>
        </div>
        {/* List */}
        <div
          style={{
            padding: "14px 16px 20px",
            display: "flex",
            flexDirection: "column",
            gap: 7,
            maxHeight: "62vh",
            overflowY: "auto",
          }}
        >
          {templates.map((t) => {
            const overLimit = t.categories.length > bucketLimit;
            const lockedCount = overLimit
              ? t.categories.length - bucketLimit
              : 0;
            const isHov = hovered === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onSelect(t)}
                onMouseEnter={() => setHovered(t.id)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: 14,
                  cursor: "pointer",
                  background: isHov ? "rgba(2,132,199,0.06)" : C.card,
                  border: isHov ? `1px solid rgba(2,132,199,0.28)` : C.border,
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  textAlign: "left",
                  transition: "all 0.15s",
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    background: isHov ? "rgba(2,132,199,0.09)" : C.bg,
                    border: isHov ? "1px solid rgba(2,132,199,0.25)" : C.border,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                    flexShrink: 0,
                  }}
                >
                  {t.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 3,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: C.text1,
                        fontFamily: "'Syne',sans-serif",
                      }}
                    >
                      {t.name}
                    </span>
                    {overLimit && (
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 700,
                          color: C.warn,
                          background: "rgba(217,119,6,0.10)",
                          padding: "2px 7px",
                          borderRadius: 99,
                          border: "1px solid rgba(217,119,6,0.22)",
                          fontFamily: "'Syne',sans-serif",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 3,
                        }}
                      >
                        <Lock size={8} /> {lockedCount} locked
                      </span>
                    )}
                  </div>
                  <p
                    style={{
                      fontSize: 12,
                      color: C.text2,
                      fontFamily: "'DM Sans',sans-serif",
                      lineHeight: 1.5,
                      marginBottom: 8,
                    }}
                  >
                    {t.description}
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {t.categories.map((c, i) => {
                      const locked = i >= bucketLimit;
                      return (
                        <span
                          key={i}
                          style={{
                            fontSize: 10,
                            fontWeight: 600,
                            color: locked ? C.text3 : COLORS[i % COLORS.length],
                            background: locked
                              ? C.bg
                              : `${COLORS[i % COLORS.length]}12`,
                            padding: "2px 8px",
                            borderRadius: 99,
                            border: `1px solid ${
                              locked
                                ? C.border
                                : `${COLORS[i % COLORS.length]}28`
                            }`,
                            fontFamily: "'DM Sans',sans-serif",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 3,
                          }}
                        >
                          {locked && <Lock size={7} />}
                          {c.name} {c.percentage}%
                        </span>
                      );
                    })}
                  </div>
                </div>
                <ChevronRight
                  size={15}
                  style={{
                    color: isHov ? C.blue : C.text3,
                    flexShrink: 0,
                    transition: "color 0.15s",
                  }}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function BudgetConfigPage() {
  const [categories, setCategories] = useState<CategorySplit[]>([]);
  const [sub, setSub] = useState<AccessStatus | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    Promise.all([
      api.get("/budget").catch(() => null),
      api.get("/subscription/status").catch(() => null),
      api.get("/budget/templates").catch(() => null),
    ])
      .then(([budgetRes, subRes, templatesRes]) => {
        if (subRes) setSub(subRes.data);
        if (templatesRes) setTemplates(templatesRes.data ?? []);
        const data = budgetRes?.data;
        if (data?.categories?.length > 0) setCategories(data.categories);
        else setShowTemplates(true);
      })
      .finally(() => setFetching(false));
  }, []);

  const bucketLimit = sub?.bucketLimit ?? FREE_LIMIT;
  const isFreeTier = !sub?.isSubscribed && !sub?.isTrial;
  const isExpired = sub?.isExpired ?? false;
  const activeCats = categories.filter((c) => !c.isLocked);
  const lockedCats = categories.filter((c) => c.isLocked);
  const totalPercentage = activeCats.reduce(
    (acc, c) => acc + (c.percentage || 0),
    0
  );
  const isValid = totalPercentage === 100;
  const isOver = totalPercentage > 100;
  const atLimit = activeCats.length >= bucketLimit;

  const handleUpdate = (
    index: number,
    field: "name" | "percentage",
    value: string | number
  ) => {
    const next = [...activeCats];
    if (field === "percentage")
      next[index].percentage = value === "" ? 0 : Number(value);
    else next[index].name = String(value);
    setCategories([...next, ...lockedCats]);
  };

  const addCategory = () => {
    if (atLimit) {
      toast.warning(
        isFreeTier
          ? `Free plan allows ${FREE_LIMIT} buckets. Upgrade for unlimited.`
          : `Your plan allows up to ${bucketLimit} buckets.`
      );
      return;
    }
    setCategories([...activeCats, { name: "", percentage: 0 }, ...lockedCats]);
  };

  const removeCategory = (index: number) => {
    if (activeCats.length <= 1) {
      toast.error("At least one bucket is required");
      return;
    }
    setCategories([...activeCats.filter((_, i) => i !== index), ...lockedCats]);
  };

  const applyTemplate = (t: Template) => {
    setCategories(
      t.categories.map((c, i) => ({
        name: c.name,
        percentage: c.percentage,
        isLocked: i >= bucketLimit,
      }))
    );
    setShowTemplates(false);
    toast.success(`"${t.name}" applied — adjust if needed, then save.`);
  };

  const saveBudget = async () => {
    if (!isValid) {
      toast.error(`Total must be 100%. Currently ${totalPercentage}%`);
      return;
    }
    setLoading(true);
    try {
      await api.post("/budget/configure", { categories: activeCats });
      toast.success("Budget rules saved!");
    } catch (err) {
      const e = err as ApiError;
      toast.error(e.response?.data?.message || "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || fetching)
    return (
      <div
        style={{
          minHeight: "60vh",
          background: C.bg,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
        }}
      >
        <Loader2 size={32} className="animate-spin" style={{ color: C.blue }} />
        <p
          style={{
            color: C.text3,
            fontSize: 13,
            fontFamily: "'DM Sans',sans-serif",
          }}
        >
          Loading your rules…
        </p>
      </div>
    );

  const progressColor = isOver ? C.danger : isValid ? C.success : C.warn;

  return (
    <>
      {showTemplates && templates.length > 0 && (
        <TemplatePicker
          templates={templates}
          bucketLimit={bucketLimit}
          onSelect={applyTemplate}
          onClose={() => setShowTemplates(false)}
        />
      )}

      <div style={{ minHeight: "100vh", background: C.bg }}>
        <div
          style={{
            maxWidth: 640,
            margin: "0 auto",
            padding: "40px 24px 120px",
          }}
        >
          {/* Header */}
          <div style={{ marginBottom: 32 }}>
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
                Configuration
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
                  Budget Rules
                </h1>
                <p
                  style={{
                    fontSize: 14,
                    color: C.text2,
                    lineHeight: 1.6,
                    fontFamily: "'DM Sans',sans-serif",
                  }}
                >
                  Define how{" "}
                  <span style={{ color: C.blue, fontWeight: 600 }}>
                    SpendNub
                  </span>{" "}
                  splits your income.
                </p>
              </div>
              <button
                onClick={() => setShowTemplates(true)}
                style={{
                  padding: "9px 16px",
                  borderRadius: 12,
                  background: "rgba(2,132,199,0.07)",
                  border: "1px solid rgba(2,132,199,0.20)",
                  color: "rgba(2,132,199,0.85)",
                  fontSize: 12,
                  fontWeight: 700,
                  fontFamily: "'Syne',sans-serif",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  flexShrink: 0,
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "rgba(2,132,199,0.12)";
                  (e.currentTarget as HTMLButtonElement).style.color = C.blue;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "rgba(2,132,199,0.07)";
                  (e.currentTarget as HTMLButtonElement).style.color =
                    "rgba(2,132,199,0.85)";
                }}
              >
                <Sparkles size={13} /> Use Template
              </button>
            </div>
          </div>

          {/* Subscription banner */}
          {isFreeTier && (
            <div
              style={{
                padding: "14px 16px",
                borderRadius: 14,
                background: isExpired
                  ? "rgba(225,29,72,0.06)"
                  : "rgba(217,119,6,0.06)",
                border: `1px solid ${
                  isExpired ? "rgba(225,29,72,0.18)" : "rgba(217,119,6,0.18)"
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
                <Crown size={13} color={isExpired ? C.danger : C.warn} />
                <p
                  style={{
                    fontSize: 12,
                    color: C.text2,
                    fontFamily: "'DM Sans',sans-serif",
                  }}
                >
                  {isExpired ? (
                    <>
                      <span style={{ color: C.text1, fontWeight: 600 }}>
                        Trial expired
                      </span>{" "}
                      — {lockedCats.length} bucket
                      {lockedCats.length !== 1 ? "s" : ""} locked. Your data is
                      safe.
                    </>
                  ) : (
                    <>
                      <span style={{ color: C.text1, fontWeight: 600 }}>
                        Free plan
                      </span>{" "}
                      — {FREE_LIMIT} active buckets max. Upgrade for unlimited.
                    </>
                  )}
                </p>
              </div>
              <Link
                href="/subscribe"
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: isExpired ? C.danger : C.warn,
                  textDecoration: "none",
                  fontFamily: "'Syne',sans-serif",
                  padding: "5px 14px",
                  borderRadius: 8,
                  background: isExpired
                    ? "rgba(225,29,72,0.08)"
                    : "rgba(217,119,6,0.08)",
                  border: `1px solid ${
                    isExpired ? "rgba(225,29,72,0.20)" : "rgba(217,119,6,0.20)"
                  }`,
                  whiteSpace: "nowrap" as const,
                }}
              >
                {isExpired ? "Resubscribe →" : "Upgrade →"}
              </Link>
            </div>
          )}

          {/* Allocation Status Card */}
          <div
            style={{
              padding: 24,
              borderRadius: 18,
              background: C.cardHi,
              border: isValid
                ? `1px solid rgba(5,150,105,0.28)`
                : isOver
                ? `1px solid rgba(225,29,72,0.25)`
                : C.border,
              marginBottom: 24,
              boxShadow: isValid
                ? "0 0 24px rgba(5,150,105,0.08)"
                : "0 2px 12px rgba(2,132,199,0.06)",
              transition: "all 0.3s",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                marginBottom: 16,
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: "uppercase" as const,
                    letterSpacing: "0.18em",
                    color: C.text3,
                    fontFamily: "'Syne',sans-serif",
                    marginBottom: 8,
                    display: "block",
                  }}
                >
                  Allocation Total
                </span>
                <div
                  style={{
                    fontFamily: "'Syne',sans-serif",
                    fontSize: 48,
                    fontWeight: 800,
                    lineHeight: 1,
                    background: isValid
                      ? "linear-gradient(135deg,#059669,#10b981)"
                      : isOver
                      ? C.danger
                      : "linear-gradient(135deg,#d97706,#f59e0b)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    transition: "all 0.3s",
                  }}
                >
                  {totalPercentage}
                  <span style={{ fontSize: 24 }}>%</span>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                {!isValid && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 12,
                      fontWeight: 700,
                      color: isOver ? C.danger : C.warn,
                      fontFamily: "'Syne',sans-serif",
                    }}
                  >
                    <AlertCircle size={14} />
                    {isOver
                      ? `${totalPercentage - 100}% over`
                      : `${100 - totalPercentage}% remaining`}
                  </div>
                )}
                {isValid && (
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: C.success,
                      fontFamily: "'Syne',sans-serif",
                    }}
                  >
                    ✓ Ready to save
                  </div>
                )}
              </div>
            </div>
            <div
              style={{
                height: 6,
                borderRadius: 99,
                background: "rgba(2,132,199,0.09)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${Math.min(totalPercentage, 100)}%`,
                  borderRadius: 99,
                  background: progressColor,
                  transition: "all 0.5s cubic-bezier(0.4,0,0.2,1)",
                  boxShadow: `0 0 10px ${progressColor}55`,
                }}
              />
            </div>
            {activeCats.length > 0 && totalPercentage > 0 && (
              <div
                style={{
                  display: "flex",
                  gap: 2,
                  marginTop: 8,
                  height: 3,
                  borderRadius: 99,
                  overflow: "hidden",
                }}
              >
                {activeCats.map((cat, i) => (
                  <div
                    key={i}
                    style={{
                      height: "100%",
                      flex: cat.percentage,
                      background: COLORS[i % COLORS.length],
                      transition: "flex 0.4s ease",
                    }}
                  />
                ))}
              </div>
            )}
            <div
              style={{
                marginTop: 14,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  color: C.text3,
                  fontFamily: "'DM Sans',sans-serif",
                }}
              >
                {activeCats.length} of {bucketLimit === 999 ? "∞" : bucketLimit}{" "}
                active buckets used
              </span>
              {lockedCats.length > 0 && (
                <span
                  style={{
                    fontSize: 10,
                    color: C.warn,
                    fontFamily: "'Syne',sans-serif",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <Lock size={10} /> {lockedCats.length} locked
                </span>
              )}
            </div>
          </div>

          {/* Active Categories */}
          <div style={{ marginBottom: 20 }}>
            <div
              style={{
                display: "flex",
                gap: 12,
                marginBottom: 10,
                paddingLeft: 20,
              }}
            >
              <span
                style={{
                  flex: 1,
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.18em",
                  color: C.text3,
                  fontFamily: "'Syne',sans-serif",
                }}
              >
                Bucket Name
              </span>
              <span
                style={{
                  width: 90,
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.18em",
                  color: C.text3,
                  fontFamily: "'Syne',sans-serif",
                }}
              >
                Split %
              </span>
              <div style={{ width: 40 }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {activeCats.map((cat, index) => {
                const accent = COLORS[index % COLORS.length];
                return (
                  <div
                    key={cat._id ?? index}
                    style={{ display: "flex", gap: 10, alignItems: "center" }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: accent,
                        flexShrink: 0,
                        boxShadow: `0 0 6px ${accent}80`,
                      }}
                    />
                    <input
                      value={cat.name}
                      onChange={(e) =>
                        handleUpdate(index, "name", e.target.value)
                      }
                      placeholder="e.g. Fixed Expenses"
                      style={{
                        flex: 1,
                        background: C.cardHi,
                        border: `1.5px solid ${C.border}`,
                        borderRadius: 12,
                        padding: "12px 16px",
                        fontSize: 14,
                        color: C.text1,
                        fontFamily: "'DM Sans',sans-serif",
                        outline: "none",
                        transition: "border-color 0.2s, box-shadow 0.2s",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = accent;
                        e.target.style.boxShadow = `0 0 0 3px ${accent}18`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = C.border;
                        e.target.style.boxShadow = "none";
                      }}
                    />
                    <div
                      style={{ position: "relative", width: 90, flexShrink: 0 }}
                    >
                      <input
                        type="number"
                        value={cat.percentage || ""}
                        onChange={(e) =>
                          handleUpdate(index, "percentage", e.target.value)
                        }
                        placeholder="0"
                        min={0}
                        max={100}
                        style={{
                          width: "100%",
                          background: C.cardHi,
                          border: `1.5px solid ${C.border}`,
                          borderRadius: 12,
                          padding: "12px 28px 12px 14px",
                          fontSize: 14,
                          fontWeight: 700,
                          color: accent,
                          fontFamily: "'Syne',sans-serif",
                          outline: "none",
                          transition: "border-color 0.2s",
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = accent;
                          e.target.style.boxShadow = `0 0 0 3px ${accent}18`;
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = C.border;
                          e.target.style.boxShadow = "none";
                        }}
                      />
                      <span
                        style={{
                          position: "absolute",
                          right: 10,
                          top: "50%",
                          transform: "translateY(-50%)",
                          fontSize: 11,
                          fontWeight: 700,
                          color: C.text3,
                          pointerEvents: "none",
                        }}
                      >
                        %
                      </span>
                    </div>
                    <button
                      onClick={() => removeCategory(index)}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: "rgba(225,29,72,0.06)",
                        border: "1px solid rgba(225,29,72,0.14)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        flexShrink: 0,
                        color: "rgba(225,29,72,0.55)",
                      }}
                      onMouseEnter={(e) => {
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.background = "rgba(225,29,72,0.12)";
                        (e.currentTarget as HTMLButtonElement).style.color =
                          C.danger;
                      }}
                      onMouseLeave={(e) => {
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.background = "rgba(225,29,72,0.06)";
                        (e.currentTarget as HTMLButtonElement).style.color =
                          "rgba(225,29,72,0.55)";
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Locked categories */}
          {lockedCats.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 10,
                }}
              >
                <Lock size={11} color={C.warn} />
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: "uppercase" as const,
                    letterSpacing: "0.15em",
                    color: C.warn,
                    fontFamily: "'Syne',sans-serif",
                  }}
                >
                  Locked — upgrade to re-activate
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {lockedCats.map((cat, i) => (
                  <div
                    key={cat._id ?? i}
                    style={{
                      display: "flex",
                      gap: 10,
                      alignItems: "center",
                      padding: "12px 14px",
                      borderRadius: 12,
                      background: "rgba(217,119,6,0.05)",
                      border: "1px solid rgba(217,119,6,0.14)",
                      opacity: 0.7,
                    }}
                  >
                    <Lock size={12} color={C.warn} style={{ flexShrink: 0 }} />
                    <span
                      style={{
                        flex: 1,
                        fontSize: 14,
                        color: C.text2,
                        fontFamily: "'DM Sans',sans-serif",
                      }}
                    >
                      {cat.name || "—"}
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: C.text3,
                        fontFamily: "'Syne',sans-serif",
                        width: 90,
                        textAlign: "right",
                      }}
                    >
                      {cat.percentage}%
                    </span>
                    <div style={{ width: 36 }} />
                  </div>
                ))}
              </div>
              <Link
                href="/subscribe"
                style={{
                  display: "block",
                  marginTop: 10,
                  textAlign: "center",
                  padding: "11px",
                  borderRadius: 12,
                  background: "rgba(217,119,6,0.07)",
                  border: "1px solid rgba(217,119,6,0.20)",
                  color: C.warn,
                  fontSize: 12,
                  fontWeight: 700,
                  fontFamily: "'Syne',sans-serif",
                  textDecoration: "none",
                  letterSpacing: "0.04em",
                }}
              >
                🔓 Upgrade to unlock {lockedCats.length} bucket
                {lockedCats.length !== 1 ? "s" : ""}
              </Link>
            </div>
          )}

          {/* Add bucket */}
          <button
            onClick={addCategory}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: 14,
              background: "transparent",
              border: atLimit
                ? `1.5px dashed ${C.border}`
                : "1.5px dashed rgba(2,132,199,0.28)",
              color: atLimit ? C.text3 : "rgba(2,132,199,0.75)",
              fontSize: 13,
              fontWeight: 700,
              fontFamily: "'Syne',sans-serif",
              cursor: atLimit ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              marginBottom: 12,
              transition: "all 0.2s",
              letterSpacing: "0.04em",
            }}
            onMouseEnter={(e) => {
              if (!atLimit) {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "rgba(2,132,199,0.04)";
                (e.currentTarget as HTMLButtonElement).style.color = C.blue;
              }
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "transparent";
              (e.currentTarget as HTMLButtonElement).style.color = atLimit
                ? C.text3
                : "rgba(2,132,199,0.75)";
            }}
          >
            {atLimit ? <Lock size={14} /> : <Plus size={16} />}
            {atLimit
              ? `Plan limit reached (${
                  bucketLimit === 999 ? "∞" : bucketLimit
                } max)`
              : "Add New Bucket"}
          </button>

          {/* Save */}
          <button
            onClick={saveBudget}
            disabled={!isValid || loading}
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: 14,
              background: isValid
                ? "linear-gradient(135deg,#0284c7,#0ea5e9)"
                : "rgba(2,132,199,0.06)",
              border: "none",
              color: isValid ? "white" : C.text3,
              fontSize: 14,
              fontWeight: 700,
              fontFamily: "'Syne',sans-serif",
              cursor: isValid ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              boxShadow: isValid ? "0 6px 22px rgba(2,132,199,0.32)" : "none",
              transition: "all 0.3s",
              letterSpacing: "0.05em",
              textTransform: "uppercase" as const,
            }}
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            {loading ? "Saving…" : "Save Configuration"}
          </button>

          {/* Info */}
          <div
            style={{
              marginTop: 20,
              padding: 16,
              borderRadius: 14,
              background: "rgba(2,132,199,0.05)",
              border: "1px solid rgba(2,132,199,0.14)",
              display: "flex",
              gap: 12,
              alignItems: "flex-start",
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: "rgba(2,132,199,0.09)",
                border: "1px solid rgba(2,132,199,0.20)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Info size={14} color={C.blue} />
            </div>
            <p
              style={{
                fontSize: 12,
                color: C.text2,
                lineHeight: 1.7,
                fontFamily: "'DM Sans',sans-serif",
              }}
            >
              Every income you log is automatically split across these buckets.
              Percentages must sum to exactly 100%.
              {lockedCats.length > 0 &&
                " Locked buckets preserve your data and will reactivate when you upgrade."}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
