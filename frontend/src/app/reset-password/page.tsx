"use client";
import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/Input";
import api from "@/lib/api";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { ApiError } from "@/types";
import { AuthCard, AuthShell, LogoMark } from "@/components/ui/Auth";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const emailParam = searchParams?.get("email");
    if (emailParam) setEmail(emailParam);
  }, [searchParams]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await api.post("/users/reset-password", { email, password });
      toast.success("Password updated — your credentials have been changed.");
      router.push("/login");
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted)
    return <div style={{ minHeight: "100vh", background: "#0c1e40" }} />;

  return (
    <AuthShell>
      <AuthCard>
        <LogoMark />
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <h2
            style={{
              fontFamily: "'Syne',sans-serif",
              fontSize: 24,
              fontWeight: 800,
              color: "#f0f9ff",
              marginBottom: 6,
            }}
          >
            New Password
          </h2>
          <p
            style={{
              fontSize: 14,
              color: "rgba(186,230,253,0.55)",
              fontFamily: "'DM Sans',sans-serif",
            }}
          >
            Choose a strong password for{" "}
            <span style={{ color: "rgba(224,242,254,0.80)", fontWeight: 600 }}>
              {email}
            </span>
          </p>
        </div>
        <form
          onSubmit={handleReset}
          style={{ display: "flex", flexDirection: "column", gap: 14 }}
        >
          <Input
            label="New Password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            endIcon={
              showPassword ? (
                <EyeOff size={17} onClick={() => setShowPassword(false)} />
              ) : (
                <Eye size={17} onClick={() => setShowPassword(true)} />
              )
            }
          />
          <Input
            label="Confirm Password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "13px",
              borderRadius: 12,
              background: "linear-gradient(135deg,#0284c7,#0ea5e9)",
              border: "none",
              color: "white",
              fontSize: 14,
              fontWeight: 700,
              fontFamily: "'Syne',sans-serif",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
              boxShadow: "0 4px 20px rgba(2,132,199,0.40)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              letterSpacing: "0.04em",
              textTransform: "uppercase" as const,
              marginTop: 4,
            }}
          >
            {loading && (
              <span
                style={{
                  animation: "spin 1s linear infinite",
                  display: "inline-block",
                }}
              >
                ◌
              </span>
            )}
            Reset Password
          </button>
        </form>
      </AuthCard>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={<div style={{ minHeight: "100vh", background: "#0c1e40" }} />}
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
