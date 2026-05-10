"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { Input } from "@/components/ui/Input";
import api from "@/lib/api";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { ApiError } from "@/types";
import { AuthCard, AuthShell, Divider, LogoMark } from "@/components/ui/Auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/users/login", { email, password });
      setAuth(data.user, data.token);
      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

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
            Welcome back
          </h2>
          <p
            style={{
              fontSize: 14,
              color: "rgba(186,230,253,0.55)",
              fontFamily: "'DM Sans',sans-serif",
            }}
          >
            Your finances, in sync.
          </p>
        </div>
        <form
          onSubmit={handleLogin}
          style={{ display: "flex", flexDirection: "column", gap: 14 }}
        >
          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Password"
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
          <div style={{ textAlign: "right" }}>
            <Link
              href="/forgot-password"
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "rgba(56,189,248,0.70)",
                fontFamily: "'Syne',sans-serif",
                textDecoration: "none",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.color = "#38bdf8")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.color =
                  "rgba(56,189,248,0.70)")
              }
            >
              Forgot password?
            </Link>
          </div>
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
            Sign In
          </button>
        </form>
        <Divider />
        <p
          style={{
            textAlign: "center",
            fontSize: 12,
            color: "rgba(186,230,253,0.40)",
            fontFamily: "'DM Sans',sans-serif",
          }}
        >
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            style={{
              fontWeight: 700,
              color: "#38bdf8",
              textDecoration: "none",
            }}
          >
            Create Account
          </Link>
        </p>
      </AuthCard>
    </AuthShell>
  );
}
