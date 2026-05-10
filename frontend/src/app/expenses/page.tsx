"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  ArrowDownCircle,
  Loader2,
  Tag,
  ReceiptText,
  Wallet2,
  ChevronDown,
} from "lucide-react";
import api from "@/lib/api";
import { ApiError } from "@/types";

interface Category {
  _id: string;
  name: string;
  percentage: number;
  subCategories: string[];
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
  danger: "#e11d48",
};

export default function ExpensesPage() {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [amountFocused, setAmountFocused] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data } = await api.get("/budget");
      if (data?.categories)
        setCategories(data.categories.filter((c: Category) => !c.isLocked));
    } catch (err) {
      const e = err as ApiError;
      toast.error(e.response?.data?.message || "Failed to load categories");
    } finally {
      setFetching(false);
    }
  };

  const selectedCatIndex = categories.findIndex(
    (c) => c._id === selectedCategoryId
  );
  const selectedCat = categories.find((c) => c._id === selectedCategoryId);
  const activeSubCats = selectedCat?.subCategories || [];
  const bucketAccent =
    selectedCatIndex >= 0
      ? ACCENT_COLORS[selectedCatIndex % ACCENT_COLORS.length]
      : C.danger;

  const handleLogExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !selectedCategoryId) {
      toast.error("Amount and bucket are required");
      return;
    }
    setLoading(true);
    try {
      await api.post("/expenses", {
        amount: Number(amount),
        description: description || "General Expense",
        category: selectedCategoryId,
        subCategory: selectedSubCategory,
      });
      toast.success("Expense recorded!");
      setAmount("");
      setDescription("");
      setSelectedCategoryId("");
      setSelectedSubCategory("");
    } catch (err) {
      const e = err as ApiError;
      toast.error(e.response?.data?.message || "Failed to log expense");
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
          style={{ color: C.danger }}
          className="animate-spin"
        />
      </div>
    );

  const numericAmount = Number(amount) || 0;
  const canSubmit = numericAmount > 0 && selectedCategoryId;

  const selectStyle: React.CSSProperties = {
    width: "100%",
    background: C.cardHi,
    border: `1.5px solid ${C.border}`,
    borderRadius: 12,
    padding: "12px 40px 12px 14px",
    fontSize: 14,
    color: selectedCategoryId ? C.text1 : C.text3,
    fontFamily: "'DM Sans',sans-serif",
    outline: "none",
    appearance: "none" as const,
    cursor: "pointer",
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>
      <div
        style={{ maxWidth: 640, margin: "0 auto", padding: "40px 24px 120px" }}
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
            <div style={{ width: 20, height: 1, background: C.danger }} />
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                textTransform: "uppercase" as const,
                letterSpacing: "0.2em",
                color: "rgba(225,29,72,0.70)",
                fontFamily: "'Syne',sans-serif",
              }}
            >
              Record Spending
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
            Log Expense
          </h1>
          <p
            style={{
              fontSize: 14,
              color: C.text2,
              lineHeight: 1.6,
              fontFamily: "'DM Sans',sans-serif",
            }}
          >
            Record spending and reduce your bucket balance in real-time.
          </p>
        </div>

        <form onSubmit={handleLogExpense}>
          {/* Amount hero */}
          <div
            style={{
              padding: 24,
              borderRadius: 20,
              background: C.cardHi,
              border: amountFocused
                ? `1.5px solid rgba(225,29,72,0.50)`
                : `1.5px solid rgba(225,29,72,0.18)`,
              marginBottom: 14,
              boxShadow: amountFocused
                ? "0 0 0 3px rgba(225,29,72,0.08)"
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
                color: "rgba(225,29,72,0.60)",
                fontFamily: "'Syne',sans-serif",
                display: "block",
                marginBottom: 12,
              }}
            >
              Expense Amount
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span
                style={{
                  fontSize: 32,
                  fontWeight: 800,
                  color: numericAmount > 0 ? C.danger : C.text3,
                  fontFamily: "'Syne',sans-serif",
                  transition: "color 0.3s",
                }}
              >
                ₦
              </span>
              <input
                type="number"
                step="0.01"
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
                  fontSize: "clamp(28px,5vw,44px)",
                  fontWeight: 800,
                  color: numericAmount > 0 ? C.text1 : C.text3,
                  fontFamily: "'Syne',sans-serif",
                  letterSpacing: "-1px",
                }}
              />
            </div>
            {numericAmount > 0 && selectedCat && (
              <div
                style={{
                  marginTop: 12,
                  paddingTop: 12,
                  borderTop: "1px solid rgba(225,29,72,0.10)",
                  fontSize: 12,
                  color: "rgba(225,29,72,0.60)",
                  fontFamily: "'DM Sans',sans-serif",
                }}
              >
                This will reduce your{" "}
                <span style={{ color: bucketAccent, fontWeight: 600 }}>
                  {selectedCat.name}
                </span>{" "}
                bucket by{" "}
                <span style={{ color: C.text1, fontWeight: 700 }}>
                  ₦{numericAmount.toLocaleString()}
                </span>
              </div>
            )}
          </div>

          {/* Bucket & Label */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              marginBottom: 12,
            }}
          >
            <div>
              <label
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.16em",
                  color: C.text3,
                  fontFamily: "'Syne',sans-serif",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  marginBottom: 7,
                }}
              >
                <Wallet2 size={11} color={C.text3} /> Bucket
              </label>
              <div style={{ position: "relative" }}>
                <select
                  value={selectedCategoryId}
                  onChange={(e) => {
                    setSelectedCategoryId(e.target.value);
                    setSelectedSubCategory("");
                  }}
                  required
                  style={selectStyle}
                >
                  <option value="">Select bucket…</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name} · {cat.percentage}%
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={13}
                  style={{
                    position: "absolute",
                    right: 13,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: C.text3,
                    pointerEvents: "none",
                  }}
                />
              </div>
            </div>
            <div>
              <label
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.16em",
                  color: C.text3,
                  fontFamily: "'Syne',sans-serif",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  marginBottom: 7,
                }}
              >
                <Tag size={11} color={C.text3} /> Label{" "}
                <span
                  style={{
                    color: C.text3,
                    fontWeight: 400,
                    textTransform: "none",
                    letterSpacing: 0,
                    fontSize: 10,
                  }}
                >
                  (opt)
                </span>
              </label>
              <div style={{ position: "relative" }}>
                <select
                  value={selectedSubCategory}
                  onChange={(e) => setSelectedSubCategory(e.target.value)}
                  disabled={!selectedCategoryId || activeSubCats.length === 0}
                  style={{
                    ...selectStyle,
                    opacity:
                      !selectedCategoryId || activeSubCats.length === 0
                        ? 0.45
                        : 1,
                  }}
                >
                  <option value="">No label</option>
                  {activeSubCats.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={13}
                  style={{
                    position: "absolute",
                    right: 13,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: C.text3,
                    pointerEvents: "none",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: 18 }}>
            <label
              style={{
                fontSize: 10,
                fontWeight: 700,
                textTransform: "uppercase" as const,
                letterSpacing: "0.16em",
                color: C.text3,
                fontFamily: "'Syne',sans-serif",
                display: "flex",
                alignItems: "center",
                gap: 5,
                marginBottom: 7,
              }}
            >
              <ReceiptText size={11} color={C.text3} /> Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What did you spend on?"
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
                e.target.style.borderColor = "rgba(225,29,72,0.45)";
                e.target.style.boxShadow = "0 0 0 3px rgba(225,29,72,0.08)";
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
                ? "linear-gradient(135deg,#e11d48,#f43f5e)"
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
              boxShadow: canSubmit ? "0 6px 20px rgba(225,29,72,0.30)" : "none",
              transition: "all 0.3s",
              letterSpacing: "0.05em",
              textTransform: "uppercase" as const,
            }}
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <ArrowDownCircle size={18} />
            )}
            {loading ? "Recording…" : "Record Expense"}
          </button>

          {/* Bucket impact info */}
          {selectedCat && (
            <div
              style={{
                marginTop: 14,
                padding: 16,
                borderRadius: 14,
                background: `${bucketAccent}07`,
                border: `1px solid ${bucketAccent}18`,
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
                  background: `${bucketAccent}12`,
                  border: `1px solid ${bucketAccent}28`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <ReceiptText size={14} style={{ color: bucketAccent }} />
              </div>
              <div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: C.text1,
                    marginBottom: 3,
                    fontFamily: "'Syne',sans-serif",
                  }}
                >
                  Budget Impact
                </div>
                <p
                  style={{
                    fontSize: 12,
                    color: C.text2,
                    lineHeight: 1.65,
                    fontFamily: "'DM Sans',sans-serif",
                  }}
                >
                  This will reduce your{" "}
                  <span style={{ color: bucketAccent, fontWeight: 600 }}>
                    {selectedCat.name}
                  </span>{" "}
                  available balance automatically.
                </p>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
