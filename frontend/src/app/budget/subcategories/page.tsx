"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  Layers,
  Loader2,
  ChevronRight,
  Lock,
  Crown,
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { ApiError } from "@/types";

interface Category {
  _id: string;
  name: string;
  percentage: number;
  subCategories: string[];
  isLocked?: boolean;
}
interface AccessStatus {
  hasAccess: boolean;
  plan: string;
  isSubscribed: boolean;
  isTrial: boolean;
  bucketLimit: number;
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
  warn: "#d97706",
  danger: "#e11d48",
  success: "#059669",
};

export default function SubcategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [sub, setSub] = useState<AccessStatus | null>(null);
  const [selectedId, setSelectedId] = useState("");
  const [newSubName, setNewSubName] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    Promise.all([
      api.get("/budget").catch(() => null),
      api.get("/subscription/status").catch(() => null),
    ])
      .then(([budgetRes, subRes]) => {
        if (subRes) setSub(subRes.data);
        const cats = budgetRes?.data?.categories ?? [];
        setCategories(cats);
        const firstUnlocked = cats.find((c: Category) => !c.isLocked);
        if (firstUnlocked) setSelectedId(firstUnlocked._id);
      })
      .catch(() => toast.error("Failed to load buckets"))
      .finally(() => setFetching(false));
  }, []);

  const fetchCategories = async () => {
    const { data } = await api.get("/budget");
    const cats = data?.categories ?? [];
    setCategories(cats);
    const stillExists = cats.find((c: Category) => c._id === selectedId);
    if (!stillExists) {
      const first = cats.find((c: Category) => !c.isLocked);
      if (first) setSelectedId(first._id);
    }
  };

  const selectedIndex = categories.findIndex((c) => c._id === selectedId);
  const selected = categories.find((c) => c._id === selectedId);
  const accent = COLORS[selectedIndex % COLORS.length] || C.blue;
  const isSelectedLocked = selected?.isLocked;

  const handleAddSub = async () => {
    if (!newSubName.trim() || !selectedId || isSelectedLocked) return;
    setLoading(true);
    try {
      await api.post(`/budget/categories/${selectedId}/sub`, {
        name: newSubName.trim(),
      });
      toast.success(`"${newSubName}" added`);
      setNewSubName("");
      fetchCategories();
    } catch (err) {
      const e = err as ApiError;
      toast.error(e.response?.data?.message || "Failed to add");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSub = async (subName: string) => {
    if (!selectedId || isSelectedLocked) return;
    try {
      await api.delete(`/budget/categories/${selectedId}/sub/${subName}`);
      toast.success("Label removed");
      fetchCategories();
    } catch (err) {
      const e = err as ApiError;
      toast.error(e.response?.data?.message || "Failed to delete");
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
          Loading buckets…
        </p>
      </div>
    );

  const activeCats = categories.filter((c) => !c.isLocked);
  const lockedCats = categories.filter((c) => c.isLocked);

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
              Subcategories
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
            Budget Labels
          </h1>
          <p
            style={{
              fontSize: 14,
              color: C.text2,
              lineHeight: 1.6,
              fontFamily: "'DM Sans',sans-serif",
            }}
          >
            Add granular labels inside each bucket for detailed spending
            insight.
          </p>
        </div>

        <div
          style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 20 }}
        >
          {/* Sidebar */}
          <div>
            {activeCats.length > 0 && (
              <>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: "uppercase" as const,
                    letterSpacing: "0.18em",
                    color: C.text3,
                    fontFamily: "'Syne',sans-serif",
                    display: "block",
                    marginBottom: 8,
                    paddingLeft: 4,
                  }}
                >
                  Active Buckets
                </span>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    marginBottom: 16,
                  }}
                >
                  {activeCats.map((cat) => {
                    const i = categories.findIndex((c) => c._id === cat._id);
                    const ca = COLORS[i % COLORS.length];
                    const isActive = selectedId === cat._id;
                    return (
                      <button
                        key={cat._id}
                        onClick={() => setSelectedId(cat._id)}
                        style={{
                          width: "100%",
                          padding: "12px 14px",
                          borderRadius: 12,
                          cursor: "pointer",
                          background: isActive ? `${ca}10` : C.cardHi,
                          border: isActive ? `1.5px solid ${ca}35` : C.border,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          transition: "all 0.2s",
                          boxShadow: isActive
                            ? `0 2px 12px ${ca}18`
                            : "0 1px 4px rgba(2,132,199,0.05)",
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
                              background: ca,
                              flexShrink: 0,
                              boxShadow: isActive ? `0 0 6px ${ca}` : "none",
                            }}
                          />
                          <div style={{ textAlign: "left" }}>
                            <div
                              style={{
                                fontSize: 13,
                                fontWeight: 700,
                                color: isActive ? C.text1 : C.text2,
                                fontFamily: "'Syne',sans-serif",
                              }}
                            >
                              {cat.name}
                            </div>
                            <div
                              style={{
                                fontSize: 10,
                                color: isActive ? ca : C.text3,
                                fontFamily: "'DM Sans',sans-serif",
                              }}
                            >
                              {cat.percentage}% ·{" "}
                              {cat.subCategories?.length || 0} labels
                            </div>
                          </div>
                        </div>
                        <ChevronRight
                          size={13}
                          style={{
                            color: isActive ? ca : C.text3,
                            transform: isActive ? "translateX(2px)" : "none",
                          }}
                        />
                      </button>
                    );
                  })}
                </div>
              </>
            )}
            {lockedCats.length > 0 && (
              <>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: "uppercase" as const,
                    letterSpacing: "0.18em",
                    color: C.warn,
                    fontFamily: "'Syne',sans-serif",
                    marginBottom: 8,
                    paddingLeft: 4,
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <Lock size={9} color={C.warn} /> Locked
                </span>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 6 }}
                >
                  {lockedCats.map((cat) => {
                    const isActive = selectedId === cat._id;
                    return (
                      <button
                        key={cat._id}
                        onClick={() => setSelectedId(cat._id)}
                        style={{
                          width: "100%",
                          padding: "12px 14px",
                          borderRadius: 12,
                          cursor: "pointer",
                          background: isActive
                            ? "rgba(217,119,6,0.07)"
                            : C.card,
                          border: isActive
                            ? "1px solid rgba(217,119,6,0.25)"
                            : C.border,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          opacity: 0.7,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                          }}
                        >
                          <Lock
                            size={10}
                            color={C.warn}
                            style={{ flexShrink: 0 }}
                          />
                          <div style={{ textAlign: "left" }}>
                            <div
                              style={{
                                fontSize: 13,
                                fontWeight: 700,
                                color: C.text2,
                                fontFamily: "'Syne',sans-serif",
                              }}
                            >
                              {cat.name}
                            </div>
                            <div
                              style={{
                                fontSize: 10,
                                color: C.text3,
                                fontFamily: "'DM Sans',sans-serif",
                              }}
                            >
                              {cat.percentage}% · locked
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <Link
                  href="/subscribe"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginTop: 10,
                    padding: "9px 12px",
                    borderRadius: 10,
                    background: "rgba(217,119,6,0.07)",
                    border: "1px solid rgba(217,119,6,0.18)",
                    textDecoration: "none",
                  }}
                >
                  <Crown size={11} color={C.warn} />
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: C.warn,
                      fontFamily: "'Syne',sans-serif",
                    }}
                  >
                    Unlock All
                  </span>
                </Link>
              </>
            )}
          </div>

          {/* Main Panel */}
          <div
            style={{
              padding: 28,
              borderRadius: 20,
              background: C.cardHi,
              border: isSelectedLocked
                ? "1px solid rgba(217,119,6,0.20)"
                : `1.5px solid ${accent}22`,
              boxShadow: isSelectedLocked
                ? "0 2px 12px rgba(217,119,6,0.06)"
                : `0 2px 16px ${accent}0a`,
              minHeight: 480,
              display: "flex",
              flexDirection: "column",
              transition: "all 0.3s",
            }}
          >
            {/* Panel header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                marginBottom: 24,
                paddingBottom: 20,
                borderBottom: `1px solid ${C.border}`,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  background: isSelectedLocked
                    ? "rgba(217,119,6,0.09)"
                    : `${accent}12`,
                  border: isSelectedLocked
                    ? "1px solid rgba(217,119,6,0.22)"
                    : `1px solid ${accent}28`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {isSelectedLocked ? (
                  <Lock size={20} style={{ color: C.warn }} />
                ) : (
                  <Layers size={20} style={{ color: accent }} />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <h2
                    style={{
                      fontFamily: "'Syne',sans-serif",
                      fontSize: 18,
                      fontWeight: 700,
                      color: isSelectedLocked ? C.text3 : C.text1,
                      marginBottom: 2,
                    }}
                  >
                    {selected?.name || "Select a bucket"}
                  </h2>
                  {isSelectedLocked && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: C.warn,
                        background: "rgba(217,119,6,0.10)",
                        padding: "2px 8px",
                        borderRadius: 99,
                        border: "1px solid rgba(217,119,6,0.22)",
                        fontFamily: "'Syne',sans-serif",
                      }}
                    >
                      LOCKED
                    </span>
                  )}
                </div>
                <p
                  style={{
                    fontSize: 12,
                    color: C.text3,
                    fontFamily: "'DM Sans',sans-serif",
                  }}
                >
                  {isSelectedLocked
                    ? "Upgrade to manage labels for this bucket"
                    : `${
                        selected?.subCategories?.length || 0
                      } active labels · ${selected?.percentage}% of income`}
                </p>
              </div>
            </div>

            {isSelectedLocked ? (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 16,
                  padding: "32px 24px",
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 18,
                    background: "rgba(217,119,6,0.08)",
                    border: "1px solid rgba(217,119,6,0.20)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Lock size={24} style={{ color: C.warn }} />
                </div>
                <div style={{ textAlign: "center" }}>
                  <p
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: C.text2,
                      fontFamily: "'Syne',sans-serif",
                      marginBottom: 6,
                    }}
                  >
                    Bucket Locked
                  </p>
                  <p
                    style={{
                      fontSize: 13,
                      color: C.text3,
                      fontFamily: "'DM Sans',sans-serif",
                      lineHeight: 1.6,
                      maxWidth: 280,
                    }}
                  >
                    This bucket and its labels are preserved. Upgrade to manage
                    subcategories and re-activate it.
                  </p>
                </div>
                <Link
                  href="/subscribe"
                  style={{
                    padding: "12px 28px",
                    borderRadius: 12,
                    background: "linear-gradient(135deg,#d97706,#b45309)",
                    color: "white",
                    textDecoration: "none",
                    fontSize: 13,
                    fontWeight: 700,
                    fontFamily: "'Syne',sans-serif",
                    boxShadow: "0 4px 14px rgba(217,119,6,0.28)",
                  }}
                >
                  Upgrade to Personal — ₦1,500/mo
                </Link>
                {(selected?.subCategories?.length ?? 0) > 0 && (
                  <div style={{ width: "100%", marginTop: 8 }}>
                    <p
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        textTransform: "uppercase" as const,
                        letterSpacing: "0.15em",
                        color: C.text3,
                        fontFamily: "'Syne',sans-serif",
                        marginBottom: 8,
                        textAlign: "center",
                      }}
                    >
                      Saved labels ({selected?.subCategories?.length})
                    </p>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                      }}
                    >
                      {selected?.subCategories.map((sub, i) => (
                        <div
                          key={i}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "10px 14px",
                            borderRadius: 10,
                            background: C.card,
                            border: C.border,
                            opacity: 0.5,
                          }}
                        >
                          <div
                            style={{
                              width: 5,
                              height: 5,
                              borderRadius: "50%",
                              background: C.text3,
                            }}
                          />
                          <span
                            style={{
                              fontSize: 13,
                              color: C.text2,
                              fontFamily: "'DM Sans',sans-serif",
                            }}
                          >
                            {sub}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Add label */}
                <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
                  <div style={{ flex: 1 }}>
                    <input
                      value={newSubName}
                      onChange={(e) => setNewSubName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddSub()}
                      placeholder="e.g. Rent, Netflix, Electricity…"
                      style={{
                        width: "100%",
                        background: C.bg,
                        border: `1.5px solid ${C.border}`,
                        borderRadius: 12,
                        padding: "13px 16px",
                        fontSize: 14,
                        color: C.text1,
                        fontFamily: "'DM Sans',sans-serif",
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
                  </div>
                  <button
                    onClick={handleAddSub}
                    disabled={loading || !newSubName.trim()}
                    style={{
                      padding: "13px 20px",
                      borderRadius: 12,
                      background: `linear-gradient(135deg,${accent},${accent}cc)`,
                      border: "none",
                      color: "white",
                      cursor:
                        loading || !newSubName.trim()
                          ? "not-allowed"
                          : "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 13,
                      fontWeight: 700,
                      fontFamily: "'Syne',sans-serif",
                      opacity: !newSubName.trim() ? 0.5 : 1,
                      boxShadow: newSubName.trim()
                        ? `0 4px 14px ${accent}35`
                        : "none",
                      transition: "all 0.2s",
                      flexShrink: 0,
                    }}
                  >
                    {loading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Plus size={16} />
                    )}{" "}
                    Add
                  </button>
                </div>

                {/* Labels header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 12,
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
                    Active Labels
                  </span>
                  {(selected?.subCategories?.length ?? 0) > 0 && (
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: accent,
                        fontFamily: "'Syne',sans-serif",
                        background: `${accent}12`,
                        padding: "2px 10px",
                        borderRadius: 99,
                        border: `1px solid ${accent}22`,
                      }}
                    >
                      {selected?.subCategories?.length}
                    </span>
                  )}
                </div>

                {/* Labels list */}
                <div
                  style={{
                    flex: 1,
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  {!selected || (selected.subCategories?.length ?? 0) === 0 ? (
                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "48px 24px",
                        border: `2px dashed ${C.border}`,
                        borderRadius: 16,
                      }}
                    >
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 14,
                          background: C.bg,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginBottom: 12,
                        }}
                      >
                        <Layers size={22} style={{ color: C.text3 }} />
                      </div>
                      <p
                        style={{
                          fontSize: 13,
                          color: C.text3,
                          fontFamily: "'DM Sans',sans-serif",
                          textAlign: "center",
                        }}
                      >
                        No labels yet. Add one above.
                      </p>
                    </div>
                  ) : (
                    selected.subCategories.map((s, i) => (
                      <div
                        key={s}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "13px 16px",
                          borderRadius: 12,
                          background: C.card,
                          border: C.border,
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          (
                            e.currentTarget as HTMLDivElement
                          ).style.borderColor = `${accent}30`;
                          (
                            e.currentTarget as HTMLDivElement
                          ).style.background = `${accent}06`;
                        }}
                        onMouseLeave={(e) => {
                          (
                            e.currentTarget as HTMLDivElement
                          ).style.borderColor = C.border;
                          (e.currentTarget as HTMLDivElement).style.background =
                            C.card;
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                          }}
                        >
                          <div
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              background: accent,
                              opacity: 0.8,
                            }}
                          />
                          <span
                            style={{
                              fontSize: 14,
                              fontWeight: 500,
                              color: C.text1,
                              fontFamily: "'DM Sans',sans-serif",
                            }}
                          >
                            {s}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteSub(s)}
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: 8,
                            background: "transparent",
                            border: "none",
                            color: "rgba(225,29,72,0.45)",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all 0.2s",
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.color =
                              C.danger;
                            (
                              e.currentTarget as HTMLButtonElement
                            ).style.background = "rgba(225,29,72,0.09)";
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.color =
                              "rgba(225,29,72,0.45)";
                            (
                              e.currentTarget as HTMLButtonElement
                            ).style.background = "transparent";
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
