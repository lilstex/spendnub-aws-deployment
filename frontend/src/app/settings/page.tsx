"use client";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  User,
  Mail,
  Lock,
  Crown,
  Shield,
  LogOut,
  Loader2,
  Check,
  Eye,
  EyeOff,
  AlertTriangle,
  ChevronRight,
  Zap,
  Calendar,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { ApiError } from "@/types";

interface AccessStatus {
  plan: string;
  isSubscribed: boolean;
  isTrial: boolean;
  isExpired: boolean;
  daysRemaining: number | null;
  subscriptionExpiresAt: string | null;
  bucketLimit: number;
  trialExpiration: string | null;
}

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

const inputStyle = (
  focused: boolean,
  accent = C.blue
): React.CSSProperties => ({
  width: "100%",
  background: C.cardHi,
  border: focused ? `1.5px solid ${accent}` : `1.5px solid ${C.border}`,
  borderRadius: 12,
  padding: "12px 16px",
  fontSize: 14,
  color: C.text1,
  fontFamily: "'DM Sans',sans-serif",
  outline: "none",
  transition: "border-color 0.2s, box-shadow 0.2s",
  boxShadow: focused ? `0 0 0 3px ${accent}14` : "none",
});

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        padding: 28,
        borderRadius: 20,
        background: C.cardHi,
        border: C.border,
        marginBottom: 16,
        boxShadow: "0 2px 12px rgba(2,132,199,0.06)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: "rgba(2,132,199,0.08)",
            border: "1px solid rgba(2,132,199,0.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <h2
          style={{
            fontFamily: "'Syne',sans-serif",
            fontSize: 15,
            fontWeight: 800,
            color: C.text1,
          }}
        >
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}

function PlanPill({ sub }: { sub: AccessStatus }) {
  const color = sub.isExpired
    ? C.danger
    : sub.isTrial
    ? C.warn
    : sub.isSubscribed
    ? C.success
    : C.text3;
  const label = sub.isExpired
    ? "Expired"
    : sub.isTrial
    ? "Trial"
    : sub.isSubscribed
    ? sub.plan.charAt(0).toUpperCase() + sub.plan.slice(1)
    : "Free";
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 10px",
        borderRadius: 99,
        background: `${color}14`,
        border: `1px solid ${color}28`,
      }}
    >
      {sub.isSubscribed && !sub.isTrial && <Crown size={9} color={color} />}
      <span
        style={{
          fontSize: 10,
          fontWeight: 700,
          color,
          fontFamily: "'Syne',sans-serif",
          letterSpacing: "0.1em",
          textTransform: "uppercase" as const,
        }}
      >
        {label}
      </span>
    </div>
  );
}

function PasswordInput({
  label,
  value,
  onChange,
  placeholder,
  focused,
  onFocus,
  onBlur,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  focused: boolean;
  onFocus: () => void;
  onBlur: () => void;
}) {
  const [show, setShow] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep DOM value in sync without passing it as a React prop —
  // prevents the value appearing in DevTools / console when type="password"
  useEffect(() => {
    if (!show && inputRef.current && inputRef.current.value !== value) {
      inputRef.current.value = value;
    }
  });

  return (
    <div style={{ marginBottom: 14 }}>
      <label
        style={{
          fontSize: 10,
          fontWeight: 700,
          textTransform: "uppercase" as const,
          letterSpacing: "0.16em",
          color: C.text3,
          fontFamily: "'Syne',sans-serif",
          marginBottom: 7,
          display: "block",
        }}
      >
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <input
          ref={!show ? inputRef : undefined}
          type={show ? "text" : "password"}
          // When visible as text: pass value normally so cursor position works
          // When hidden as password: value is managed via ref — never a React prop
          {...(show ? { value } : {})}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={onFocus}
          onBlur={onBlur}
          autoComplete="new-password"
          data-lpignore="true"
          data-form-type="other"
          style={{ ...inputStyle(focused), paddingRight: 44 }}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          style={{
            position: "absolute",
            right: 12,
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: C.text3,
            display: "flex",
            alignItems: "center",
          }}
        >
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [sub, setSub] = useState<AccessStatus | null>(null);
  const [subLoading, setSubLoading] = useState(true);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwFocus, setPwFocus] = useState("");
  const [showDelete, setShowDelete] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    api
      .get("/subscription/status")
      .then((r) => setSub(r.data))
      .catch(() => {})
      .finally(() => setSubLoading(false));
  }, []);

  const handleChangePassword = async () => {
    if (!currentPw || !newPw || !confirmPw) {
      toast.error("All password fields are required.");
      return;
    }
    if (newPw.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }
    if (newPw !== confirmPw) {
      toast.error("New passwords don't match.");
      return;
    }
    if (currentPw === newPw) {
      toast.error("New password must differ from current.");
      return;
    }
    setPwLoading(true);
    try {
      await api.post("/auth/change-password", {
        currentPassword: currentPw,
        newPassword: newPw,
      });
      toast.success("Password updated successfully.");
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
    } catch (err) {
      const e = err as ApiError;
      toast.error(e.response?.data?.message ?? "Failed to update password.");
    } finally {
      setPwLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== "DELETE") {
      toast.error("Type DELETE to confirm.");
      return;
    }
    setDeleteLoading(true);
    try {
      await api.delete("/auth/account");
      logout();
      router.push("/");
    } catch (err) {
      const e = err as ApiError;
      toast.error(e.response?.data?.message ?? "Failed to delete account.");
      setDeleteLoading(false);
    }
  };

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>
      <div
        style={{ maxWidth: 640, margin: "0 auto", padding: "40px 24px 120px" }}
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
              Account
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
            Settings
          </h1>
          <p
            style={{
              fontSize: 14,
              color: C.text2,
              lineHeight: 1.6,
              fontFamily: "'DM Sans',sans-serif",
            }}
          >
            Manage your account, subscription, and security.
          </p>
        </div>

        {/* Profile */}
        <Section title="Profile" icon={<User size={16} color={C.blue} />}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "16px 18px",
              borderRadius: 14,
              background: C.card,
              border: C.border,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 16,
                background:
                  "linear-gradient(135deg,rgba(2,132,199,0.15),rgba(14,165,233,0.10))",
                border: "1px solid rgba(2,132,199,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontFamily: "'Syne',sans-serif",
                  fontSize: 18,
                  fontWeight: 800,
                  color: C.blue,
                }}
              >
                {user?.email?.[0]?.toUpperCase() ?? "U"}
              </span>
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
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: C.text1,
                    fontFamily: "'Syne',sans-serif",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap" as const,
                  }}
                >
                  {user?.email ?? "—"}
                </p>
                {sub && <PlanPill sub={sub} />}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Mail size={11} style={{ color: C.text3, flexShrink: 0 }} />
                <p
                  style={{
                    fontSize: 12,
                    color: C.text3,
                    fontFamily: "'DM Sans',sans-serif",
                  }}
                >
                  Email is your login identifier
                </p>
              </div>
            </div>
          </div>
        </Section>

        {/* Subscription */}
        <Section title="Subscription" icon={<Crown size={16} color={C.warn} />}>
          {subLoading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "24px 0",
              }}
            >
              <Loader2
                size={22}
                className="animate-spin"
                style={{ color: C.blue }}
              />
            </div>
          ) : sub ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div
                style={{
                  padding: "18px 20px",
                  borderRadius: 16,
                  background:
                    sub.isSubscribed && !sub.isTrial
                      ? "rgba(5,150,105,0.06)"
                      : sub.isTrial
                      ? "rgba(217,119,6,0.06)"
                      : C.card,
                  border: `1px solid ${
                    sub.isSubscribed && !sub.isTrial
                      ? "rgba(5,150,105,0.18)"
                      : sub.isTrial
                      ? "rgba(217,119,6,0.18)"
                      : C.border
                  }`,
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 16,
                  }}
                >
                  {[
                    {
                      label: "Current Plan",
                      value: sub.isExpired
                        ? "Free (Expired)"
                        : sub.isTrial
                        ? "Trial"
                        : sub.isSubscribed
                        ? sub.plan.charAt(0).toUpperCase() + sub.plan.slice(1)
                        : "Free",
                      color: sub.isExpired
                        ? C.danger
                        : sub.isTrial
                        ? C.warn
                        : sub.isSubscribed
                        ? C.success
                        : C.text2,
                    },
                    {
                      label: "Bucket Limit",
                      value:
                        sub.bucketLimit >= 999
                          ? "Unlimited"
                          : `${sub.bucketLimit} buckets`,
                      color: C.text1,
                    },
                    ...(sub.subscriptionExpiresAt
                      ? [
                          {
                            label: sub.isTrial ? "Trial Ends" : "Renews",
                            value: fmtDate(sub.subscriptionExpiresAt),
                            color:
                              sub.daysRemaining !== null &&
                              sub.daysRemaining <= 7
                                ? C.warn
                                : C.text1,
                          },
                        ]
                      : []),
                    ...(sub.daysRemaining !== null
                      ? [
                          {
                            label: "Days Remaining",
                            value: `${sub.daysRemaining} day${
                              sub.daysRemaining !== 1 ? "s" : ""
                            }`,
                            color: sub.daysRemaining <= 7 ? C.warn : C.text1,
                          },
                        ]
                      : []),
                  ].map((row, i) => (
                    <div key={i}>
                      <p
                        style={{
                          fontSize: 9,
                          fontWeight: 700,
                          textTransform: "uppercase" as const,
                          letterSpacing: "0.16em",
                          color: C.text3,
                          fontFamily: "'Syne',sans-serif",
                          marginBottom: 5,
                        }}
                      >
                        {row.label}
                      </p>
                      <p
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: row.color,
                          fontFamily: "'Syne',sans-serif",
                        }}
                      >
                        {row.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              {sub.isExpired && (
                <div
                  style={{
                    padding: "12px 16px",
                    borderRadius: 12,
                    background: "rgba(225,29,72,0.06)",
                    border: "1px solid rgba(225,29,72,0.16)",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <AlertTriangle
                    size={14}
                    color={C.danger}
                    style={{ flexShrink: 0 }}
                  />
                  <p
                    style={{
                      fontSize: 12,
                      color: C.text2,
                      fontFamily: "'DM Sans',sans-serif",
                      lineHeight: 1.5,
                    }}
                  >
                    Your trial has ended. Buckets beyond 4 are soft-locked but
                    your data is safe.
                  </p>
                </div>
              )}
              <div
                style={{ display: "flex", gap: 10, flexWrap: "wrap" as const }}
              >
                {!sub.isSubscribed || sub.isExpired ? (
                  <Link
                    href="/subscribe"
                    style={{
                      flex: 1,
                      minWidth: 140,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 7,
                      padding: "12px 16px",
                      borderRadius: 12,
                      background: "linear-gradient(135deg,#0284c7,#0ea5e9)",
                      color: "white",
                      textDecoration: "none",
                      fontSize: 12,
                      fontWeight: 700,
                      fontFamily: "'Syne',sans-serif",
                      boxShadow: "0 4px 14px rgba(2,132,199,0.28)",
                      textTransform: "uppercase" as const,
                      letterSpacing: "0.05em",
                    }}
                  >
                    <Zap size={13} /> Upgrade Now
                  </Link>
                ) : (
                  <Link
                    href="/subscribe"
                    style={{
                      flex: 1,
                      minWidth: 140,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 7,
                      padding: "12px 16px",
                      borderRadius: 12,
                      background: "rgba(2,132,199,0.08)",
                      border: "1px solid rgba(2,132,199,0.20)",
                      color: C.blue,
                      textDecoration: "none",
                      fontSize: 12,
                      fontWeight: 700,
                      fontFamily: "'Syne',sans-serif",
                      textTransform: "uppercase" as const,
                      letterSpacing: "0.05em",
                    }}
                  >
                    <RefreshCw size={13} /> Manage Plan
                  </Link>
                )}
                <Link
                  href="/transactions"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 7,
                    padding: "12px 16px",
                    borderRadius: 12,
                    background: C.card,
                    border: C.border,
                    color: C.text2,
                    textDecoration: "none",
                    fontSize: 12,
                    fontWeight: 700,
                    fontFamily: "'Syne',sans-serif",
                  }}
                >
                  View History <ChevronRight size={13} />
                </Link>
              </div>
            </div>
          ) : (
            <p
              style={{
                fontSize: 13,
                color: C.text3,
                fontFamily: "'DM Sans',sans-serif",
              }}
            >
              Could not load subscription data.
            </p>
          )}
        </Section>

        {/* Change Password */}
        <Section
          title="Change Password"
          icon={<Lock size={16} color={C.blue} />}
        >
          <PasswordInput
            label="Current Password"
            value={currentPw}
            onChange={setCurrentPw}
            placeholder="Enter current password"
            focused={pwFocus === "current"}
            onFocus={() => setPwFocus("current")}
            onBlur={() => setPwFocus("")}
          />
          <PasswordInput
            label="New Password"
            value={newPw}
            onChange={setNewPw}
            placeholder="At least 8 characters"
            focused={pwFocus === "new"}
            onFocus={() => setPwFocus("new")}
            onBlur={() => setPwFocus("")}
          />
          <PasswordInput
            label="Confirm New Password"
            value={confirmPw}
            onChange={setConfirmPw}
            placeholder="Repeat new password"
            focused={pwFocus === "confirm"}
            onFocus={() => setPwFocus("confirm")}
            onBlur={() => setPwFocus("")}
          />
          {newPw.length > 0 && (
            <div style={{ marginBottom: 16, display: "flex", gap: 4 }}>
              {[
                newPw.length >= 8,
                /[A-Z]/.test(newPw),
                /[0-9]/.test(newPw),
                /[^A-Za-z0-9]/.test(newPw),
              ].map((met, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: 3,
                    borderRadius: 99,
                    background: met
                      ? i < 2
                        ? C.warn
                        : C.success
                      : "rgba(2,132,199,0.10)",
                    transition: "background 0.2s",
                  }}
                />
              ))}
            </div>
          )}
          <button
            onClick={handleChangePassword}
            disabled={pwLoading || !currentPw || !newPw || !confirmPw}
            style={{
              width: "100%",
              padding: "13px",
              borderRadius: 12,
              background:
                currentPw && newPw && confirmPw
                  ? "linear-gradient(135deg,#0284c7,#0ea5e9)"
                  : "rgba(2,132,199,0.06)",
              border: "none",
              color: currentPw && newPw && confirmPw ? "white" : C.text3,
              fontSize: 13,
              fontWeight: 700,
              fontFamily: "'Syne',sans-serif",
              cursor:
                currentPw && newPw && confirmPw ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              boxShadow:
                currentPw && newPw && confirmPw
                  ? "0 4px 14px rgba(2,132,199,0.28)"
                  : "none",
              transition: "all 0.2s",
              textTransform: "uppercase" as const,
              letterSpacing: "0.06em",
            }}
          >
            {pwLoading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Check size={15} />
            )}
            {pwLoading ? "Updating…" : "Update Password"}
          </button>
        </Section>

        {/* Security */}
        <Section title="Security" icon={<Shield size={16} color={C.blue} />}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              {
                label: "Two-Factor Authentication",
                value: "Not enabled",
                badge: "Coming Soon",
              },
              { label: "Active Sessions", value: "1 session", badge: null },
            ].map((row, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 16px",
                  borderRadius: 12,
                  background: C.card,
                  border: C.border,
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: C.text1,
                      fontFamily: "'DM Sans',sans-serif",
                      marginBottom: 2,
                    }}
                  >
                    {row.label}
                  </p>
                  <p
                    style={{
                      fontSize: 11,
                      color: C.text3,
                      fontFamily: "'DM Sans',sans-serif",
                    }}
                  >
                    {row.value}
                  </p>
                </div>
                {row.badge && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: C.text3,
                      background: "rgba(2,132,199,0.07)",
                      padding: "3px 8px",
                      borderRadius: 99,
                      border: C.border,
                      fontFamily: "'Syne',sans-serif",
                    }}
                  >
                    {row.badge}
                  </span>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              marginTop: 16,
              padding: "13px",
              borderRadius: 12,
              background: "rgba(225,29,72,0.06)",
              border: "1px solid rgba(225,29,72,0.14)",
              color: "rgba(225,29,72,0.75)",
              fontSize: 13,
              fontWeight: 700,
              fontFamily: "'Syne',sans-serif",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "all 0.2s",
              letterSpacing: "0.04em",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "rgba(225,29,72,0.10)";
              (e.currentTarget as HTMLButtonElement).style.color = C.danger;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "rgba(225,29,72,0.06)";
              (e.currentTarget as HTMLButtonElement).style.color =
                "rgba(225,29,72,0.75)";
            }}
          >
            <LogOut size={15} /> Sign Out of All Devices
          </button>
        </Section>

        {/* Danger Zone */}
        <div
          style={{
            padding: 28,
            borderRadius: 20,
            background: C.cardHi,
            border: "1px solid rgba(225,29,72,0.18)",
            boxShadow: "0 2px 12px rgba(225,29,72,0.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 16,
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: "rgba(225,29,72,0.07)",
                border: "1px solid rgba(225,29,72,0.16)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <AlertTriangle size={16} color={C.danger} />
            </div>
            <h2
              style={{
                fontFamily: "'Syne',sans-serif",
                fontSize: 15,
                fontWeight: 800,
                color: C.text1,
              }}
            >
              Danger Zone
            </h2>
          </div>
          <p
            style={{
              fontSize: 13,
              color: C.text2,
              fontFamily: "'DM Sans',sans-serif",
              lineHeight: 1.7,
              marginBottom: 18,
            }}
          >
            Permanently delete your account and all associated data —
            transactions, budget rules, and ledger history.{" "}
            <strong style={{ color: C.text1 }}>This cannot be undone.</strong>
          </p>
          {!showDelete ? (
            <button
              onClick={() => setShowDelete(true)}
              style={{
                padding: "11px 20px",
                borderRadius: 12,
                background: "rgba(225,29,72,0.06)",
                border: "1px solid rgba(225,29,72,0.16)",
                color: "rgba(225,29,72,0.65)",
                fontSize: 12,
                fontWeight: 700,
                fontFamily: "'Syne',sans-serif",
                cursor: "pointer",
                textTransform: "uppercase" as const,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "rgba(225,29,72,0.10)";
                (e.currentTarget as HTMLButtonElement).style.color = C.danger;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "rgba(225,29,72,0.06)";
                (e.currentTarget as HTMLButtonElement).style.color =
                  "rgba(225,29,72,0.65)";
              }}
            >
              Delete Account
            </button>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div>
                <label
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: "uppercase" as const,
                    letterSpacing: "0.16em",
                    color: "rgba(225,29,72,0.65)",
                    fontFamily: "'Syne',sans-serif",
                    marginBottom: 7,
                    display: "block",
                  }}
                >
                  Type DELETE to confirm
                </label>
                <input
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  placeholder="DELETE"
                  style={{
                    ...inputStyle(false, C.danger),
                    border: `1.5px solid ${
                      deleteConfirm === "DELETE"
                        ? C.danger
                        : "rgba(225,29,72,0.22)"
                    }`,
                  }}
                />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => {
                    setShowDelete(false);
                    setDeleteConfirm("");
                  }}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: 12,
                    background: C.card,
                    border: C.border,
                    color: C.text2,
                    fontSize: 12,
                    fontWeight: 700,
                    fontFamily: "'Syne',sans-serif",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirm !== "DELETE" || deleteLoading}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: 12,
                    background:
                      deleteConfirm === "DELETE"
                        ? "linear-gradient(135deg,#e11d48,#f43f5e)"
                        : "rgba(225,29,72,0.07)",
                    border: "none",
                    color:
                      deleteConfirm === "DELETE"
                        ? "white"
                        : "rgba(225,29,72,0.35)",
                    fontSize: 12,
                    fontWeight: 700,
                    fontFamily: "'Syne',sans-serif",
                    cursor:
                      deleteConfirm === "DELETE" ? "pointer" : "not-allowed",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 7,
                    boxShadow:
                      deleteConfirm === "DELETE"
                        ? "0 4px 14px rgba(225,29,72,0.28)"
                        : "none",
                    transition: "all 0.2s",
                  }}
                >
                  {deleteLoading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : null}
                  {deleteLoading ? "Deleting…" : "Confirm Delete"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
