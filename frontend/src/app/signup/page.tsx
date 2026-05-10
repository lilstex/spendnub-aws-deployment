"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import api from "@/lib/api";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { ApiError } from "@/types";
import { AuthCard, AuthShell, Divider, LogoMark } from "@/components/ui/Auth";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/users/signup", formData);
      toast.success("Account created! Please log in.");
      router.push("/login");
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.response?.data?.message || "Registration failed.");
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
            Join SpendNub
          </h2>
          <p
            style={{
              fontSize: 14,
              color: "rgba(186,230,253,0.55)",
              fontFamily: "'DM Sans',sans-serif",
            }}
          >
            Start your 3-month free trial today.
          </p>
        </div>
        <form
          onSubmit={handleSignup}
          style={{ display: "flex", flexDirection: "column", gap: 14 }}
        >
          <Input
            label="Full Name"
            placeholder="John Doe"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Input
            label="Email"
            type="email"
            placeholder="john@example.com"
            required
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            required
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            endIcon={
              showPassword ? (
                <EyeOff size={17} onClick={() => setShowPassword(false)} />
              ) : (
                <Eye size={17} onClick={() => setShowPassword(true)} />
              )
            }
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
            Create Account
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
          Already have an account?{" "}
          <Link
            href="/login"
            style={{
              fontWeight: 700,
              color: "#38bdf8",
              textDecoration: "none",
            }}
          >
            Log In
          </Link>
        </p>
      </AuthCard>
    </AuthShell>
  );
}
