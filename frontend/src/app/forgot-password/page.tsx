"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import api from "@/lib/api";
import { toast } from "sonner";
import { ChevronLeft } from "lucide-react";
import { ApiError } from "@/types";
import { AuthCard, AuthShell, LogoMark } from "@/components/ui/Auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/users/forgot-password", { email });
      toast.success("OTP Sent — check your email for the 6-digit code.");
      router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted)
    return <div style={{ minHeight: "100vh", background: "#0c1e40" }} />;

  return (
    <AuthShell>
      <AuthCard>
        <Link
          href="/login"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            fontSize: 12,
            fontWeight: 600,
            color: "rgba(186,230,253,0.40)",
            fontFamily: "'Syne',sans-serif",
            textDecoration: "none",
            marginBottom: 24,
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLAnchorElement).style.color = "#38bdf8")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLAnchorElement).style.color =
              "rgba(186,230,253,0.40)")
          }
        >
          <ChevronLeft size={14} /> Back to Login
        </Link>
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
            Reset Password
          </h2>
          <p
            style={{
              fontSize: 14,
              color: "rgba(186,230,253,0.55)",
              fontFamily: "'DM Sans',sans-serif",
            }}
          >
            Enter your email to receive a verification code.
          </p>
        </div>
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 16 }}
        >
          <Input
            label="Email Address"
            type="email"
            placeholder="name@company.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            Send Code
          </button>
        </form>
      </AuthCard>
    </AuthShell>
  );
}
