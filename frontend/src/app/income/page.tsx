"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ArrowUpCircle, Loader2, Info, Zap } from "lucide-react";
import api from "@/lib/api";
import { ApiError } from "@/types";

interface CategorySplit {
  _id: string;
  name: string;
  percentage: number;
  isLocked?: boolean;
}

const ACCENT_COLORS = [
  "#0284c7",
  "#059669",
  "#7c3aed",
  "#d97706",
  "#e11d48",
  "#0891b2",
  "#16a34a",
  "#9333ea",
];

const C = {
  bg: "#e0f2fe",
  card: "#f0f9ff",
  cardHi: "#ffffff",
  border: "rgba(2,132,199,0.13)",
  borderM: "rgba(2,132,199,0.22)",
  text1: "#0c1a35",
  text2: "rgba(12,26,53,0.58)",
  text3: "rgba(12,26,53,0.38)",
  blue: "#0284c7",
  blueB: "#0ea5e9",
  success: "#059669",
};

export default function IncomePage() {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState<CategorySplit[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [amountFocused, setAmountFocused] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchBudgetRules();
  }, []);

  const fetchBudgetRules = async () => {
    try {
      const { data } = await api.get("/budget");
      if (data?.categories)
        setCategories(
          data.categories.filter((c: CategorySplit) => !c.isLocked)
        );
    } catch (err) {
      const e = err as ApiError;
      toast.error(e.response?.data?.message || "Failed to load budget rules");
    } finally {
      setFetching(false);
    }
  };

  const handleLogIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;
    setLoading(true);
    try {
      await api.post("/income", {
        amount: Number(amount),
        description: description || "Regular Income",
      });
      toast.success("Income logged and split across buckets!");
      setAmount("");
      setDescription("");
    } catch (err) {
      const e = err as ApiError;
      toast.error(e.response?.data?.message || "Failed to log income");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || fetching)
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: C.bg,
        }}
      >
        <Loader2
          size={28}
          style={{ color: C.success }}
          className="animate-spin"
        />
      </div>
    );

  const numericAmount = Number(amount) || 0;
  const canSubmit = numericAmount > 0;
  const activeTotal = categories.reduce((sum, c) => sum + c.percentage, 0);
  const normalisedCats = categories.map((c) => ({
    ...c,
    normalisedPct: activeTotal > 0 ? (c.percentage / activeTotal) * 100 : 0,
  }));

  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>
      <div
        style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px 120px" }}
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
            <div style={{ width: 20, height: 1, background: C.success }} />
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                textTransform: "uppercase" as const,
                letterSpacing: "0.2em",
                color: "rgba(5,150,105,0.75)",
                fontFamily: "'Syne',sans-serif",
              }}
            >
              Record Earnings
            </span>
          </div>
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
            Log Income
          </h1>
          <p
            style={{
              fontSize: 14,
              color: C.text2,
              lineHeight: 1.6,
              fontFamily: "'DM Sans',sans-serif",
            }}
          >
            Record your earnings and watch SpendNub distribute them
            automatically.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 24,
            alignItems: "start",
          }}
        >
          {/* LEFT: Form */}
          <form onSubmit={handleLogIncome}>
            {/* Amount hero */}
            <div
              style={{
                padding: 24,
                borderRadius: 20,
                background: C.cardHi,
                border: amountFocused
                  ? `1.5px solid rgba(5,150,105,0.55)`
                  : `1.5px solid rgba(5,150,105,0.20)`,
                marginBottom: 14,
                boxShadow: amountFocused
                  ? "0 0 0 3px rgba(5,150,105,0.08)"
                  : "0 2px 12px rgba(2,132,199,0.06)",
                transition: "all 0.3s",
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.18em",
                  color: "rgba(5,150,105,0.65)",
                  fontFamily: "'Syne',sans-serif",
                  display: "block",
                  marginBottom: 12,
                }}
              >
                Income Amount
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span
                  style={{
                    fontSize: 32,
                    fontWeight: 800,
                    color: numericAmount > 0 ? C.success : C.text3,
                    fontFamily: "'Syne',sans-serif",
                    transition: "color 0.3s",
                  }}
                >
                  ₦
                </span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  onFocus={() => setAmountFocused(true)}
                  onBlur={() => setAmountFocused(false)}
                  placeholder="0.00"
                  required
                  style={{
                    flex: 1,
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    fontSize: "clamp(28px,4vw,44px)",
                    fontWeight: 800,
                    color: numericAmount > 0 ? C.text1 : C.text3,
                    fontFamily: "'Syne',sans-serif",
                    letterSpacing: "-1px",
                    width: "100%",
                  }}
                />
              </div>
              {numericAmount > 0 && (
                <div
                  style={{
                    marginTop: 12,
                    paddingTop: 12,
                    borderTop: "1px solid rgba(5,150,105,0.12)",
                    fontSize: 12,
                    color: "rgba(5,150,105,0.65)",
                    fontFamily: "'DM Sans',sans-serif",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Zap size={12} /> Engine will split across {categories.length}{" "}
                  active bucket{categories.length !== 1 ? "s" : ""}
                </div>
              )}
            </div>

            {/* Description */}
            <div style={{ marginBottom: 14 }}>
              <label
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.16em",
                  color: C.text3,
                  fontFamily: "'Syne',sans-serif",
                  display: "block",
                  marginBottom: 7,
                }}
              >
                Source / Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Monthly Salary, Freelance payment…"
                style={{
                  width: "100%",
                  background: C.cardHi,
                  border: `1.5px solid ${C.border}`,
                  borderRadius: 12,
                  padding: "12px 16px",
                  fontSize: 14,
                  color: C.text1,
                  fontFamily: "'DM Sans',sans-serif",
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "rgba(5,150,105,0.45)";
                  e.target.style.boxShadow = "0 0 0 3px rgba(5,150,105,0.08)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = C.border;
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!canSubmit || loading}
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: 14,
                background: canSubmit
                  ? "linear-gradient(135deg,#059669,#10b981)"
                  : "rgba(2,132,199,0.06)",
                border: "none",
                color: canSubmit ? "white" : C.text3,
                fontSize: 14,
                fontWeight: 700,
                fontFamily: "'Syne',sans-serif",
                cursor: canSubmit ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                boxShadow: canSubmit
                  ? "0 6px 20px rgba(5,150,105,0.30)"
                  : "none",
                transition: "all 0.3s",
                letterSpacing: "0.05em",
                textTransform: "uppercase" as const,
                marginBottom: 14,
              }}
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <ArrowUpCircle size={18} />
              )}
              {loading ? "Processing…" : "Confirm & Log Income"}
            </button>

            {/* Info */}
            <div
              style={{
                padding: 14,
                borderRadius: 14,
                background: "rgba(5,150,105,0.05)",
                border: "1px solid rgba(5,150,105,0.14)",
                display: "flex",
                gap: 10,
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 8,
                  background: "rgba(5,150,105,0.08)",
                  border: "1px solid rgba(5,150,105,0.18)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Info size={13} color={C.success} />
              </div>
              <p
                style={{
                  fontSize: 12,
                  color: C.text2,
                  lineHeight: 1.65,
                  fontFamily: "'DM Sans',sans-serif",
                }}
              >
                Based on your{" "}
                <span style={{ color: C.success, fontWeight: 600 }}>
                  Budget Rules
                </span>
                , this amount will be instantly split and allocated to each
                bucket.
              </p>
            </div>
          </form>

          {/* RIGHT: Live Split Preview */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 14,
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.18em",
                  color: C.text3,
                  fontFamily: "'Syne',sans-serif",
                }}
              >
                Live Split Preview
              </span>
              {numericAmount > 0 && (
                <span
                  style={{
                    fontSize: 11,
                    color: C.success,
                    fontWeight: 700,
                    fontFamily: "'Syne',sans-serif",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: C.success,
                      display: "inline-block",
                    }}
                  />{" "}
                  Live
                </span>
              )}
            </div>

            {categories.length === 0 ? (
              <div
                style={{
                  padding: 32,
                  borderRadius: 18,
                  background: C.cardHi,
                  border: `2px dashed ${C.border}`,
                  textAlign: "center",
                }}
              >
                <p
                  style={{
                    fontSize: 13,
                    color: C.text3,
                    fontFamily: "'DM Sans',sans-serif",
                  }}
                >
                  No active budget buckets. Go to Budget Rules to configure your
                  splits.
                </p>
              </div>
            ) : (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {normalisedCats.map((cat, i) => {
                  const accent = ACCENT_COLORS[i % ACCENT_COLORS.length];
                  const splitValue = numericAmount * (cat.normalisedPct / 100);
                  const isActive = numericAmount > 0;
                  const isRescaled =
                    Math.abs(cat.normalisedPct - cat.percentage) > 0.1;
                  return (
                    <div
                      key={cat._id}
                      style={{
                        padding: "16px 18px",
                        borderRadius: 16,
                        background: C.cardHi,
                        border: isActive ? `1.5px solid ${accent}28` : C.border,
                        boxShadow: isActive ? `0 2px 12px ${accent}10` : "none",
                        transition: "all 0.4s",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: 12,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                          }}
                        >
                          <div
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background: accent,
                              flexShrink: 0,
                              boxShadow: isActive
                                ? `0 0 8px ${accent}80`
                                : "none",
                              transition: "box-shadow 0.3s",
                            }}
                          />
                          <div>
                            <div
                              style={{
                                fontSize: 13,
                                fontWeight: 700,
                                color: C.text1,
                                fontFamily: "'Syne',sans-serif",
                              }}
                            >
                              {cat.name}
                            </div>
                            <div
                              style={{
                                fontSize: 11,
                                color: C.text3,
                                fontFamily: "'DM Sans',sans-serif",
                              }}
                            >
                              {cat.normalisedPct.toFixed(1)}% split
                              {isRescaled && (
                                <span
                                  style={{
                                    color: "rgba(217,119,6,0.65)",
                                    marginLeft: 4,
                                  }}
                                >
                                  (rescaled)
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div
                            style={{
                              fontSize: 10,
                              color: `${accent}90`,
                              fontFamily: "'Syne',sans-serif",
                              fontWeight: 700,
                              textTransform: "uppercase" as const,
                              letterSpacing: "0.1em",
                              marginBottom: 2,
                            }}
                          >
                            Allocation
                          </div>
                          <div
                            style={{
                              fontFamily: "'Syne',sans-serif",
                              fontSize: isActive ? 20 : 16,
                              fontWeight: 800,
                              color: isActive ? C.text1 : C.text3,
                              transition: "all 0.4s",
                              display: "flex",
                              alignItems: "baseline",
                              gap: 4,
                            }}
                          >
                            <span
                              style={{
                                fontSize: 12,
                                fontWeight: 500,
                                color: accent,
                              }}
                            >
                              ₦
                            </span>
                            {isActive
                              ? splitValue.toLocaleString("en-NG", {
                                  minimumFractionDigits: 0,
                                  maximumFractionDigits: 2,
                                })
                              : "—"}
                          </div>
                        </div>
                      </div>
                      <div
                        style={{
                          height: 3,
                          borderRadius: 99,
                          background: "rgba(2,132,199,0.08)",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: isActive ? `${cat.normalisedPct}%` : "0%",
                            borderRadius: 99,
                            background: accent,
                            boxShadow: `0 0 6px ${accent}60`,
                            transition: "width 0.7s cubic-bezier(0.4,0,0.2,1)",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {numericAmount > 0 && (
              <div
                style={{
                  marginTop: 14,
                  padding: "16px 18px",
                  borderRadius: 16,
                  background:
                    "linear-gradient(135deg,rgba(5,150,105,0.08),rgba(16,185,129,0.04))",
                  border: "1px solid rgba(5,150,105,0.20)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  boxShadow: "0 2px 14px rgba(5,150,105,0.08)",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: "uppercase" as const,
                      letterSpacing: "0.15em",
                      color: "rgba(5,150,105,0.75)",
                      fontFamily: "'Syne',sans-serif",
                      marginBottom: 3,
                    }}
                  >
                    Total to Process
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: C.text3,
                      fontFamily: "'DM Sans',sans-serif",
                    }}
                  >
                    Across {categories.length} active bucket
                    {categories.length !== 1 ? "s" : ""}
                  </div>
                </div>
                <div
                  style={{
                    fontFamily: "'Syne',sans-serif",
                    fontSize: 22,
                    fontWeight: 800,
                    color: C.text1,
                    display: "flex",
                    alignItems: "baseline",
                    gap: 4,
                  }}
                >
                  <span style={{ fontSize: 14, color: C.success }}>₦</span>
                  {numericAmount.toLocaleString("en-NG")}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
