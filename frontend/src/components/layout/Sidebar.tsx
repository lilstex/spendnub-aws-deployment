"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Settings2,
  Layers,
  ArrowUpCircle,
  ArrowDownCircle,
  History,
  LogOut,
  Menu,
  X,
  Crown,
  SlidersHorizontal,
  TrendingUp,
  BarChart3,
  Zap,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import api from "@/lib/api";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Income", href: "/income", icon: ArrowUpCircle },
  { name: "Expenses", href: "/expenses", icon: ArrowDownCircle },
  { name: "Transactions", href: "/transactions", icon: History },
  { name: "Investments", href: "/investments", icon: TrendingUp },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Insights", href: "/insights", icon: Zap },
  { name: "Budget Rules", href: "/budget/config", icon: Settings2 },
  { name: "Subcategories", href: "/budget/subcategories", icon: Layers },
  { name: "Settings", href: "/settings", icon: SlidersHorizontal },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [planLabel, setPlanLabel] = useState("Free Plan");
  const [planColor, setPlanColor] = useState("rgba(186,230,253,0.55)");

  useEffect(() => {
    api
      .get("/subscription/status")
      .then((r) => {
        const s = r.data;
        if (s.isExpired) {
          setPlanLabel("Expired");
          setPlanColor("rgba(251,113,133,0.85)");
        } else if (s.isTrial) {
          setPlanLabel("Trial Active");
          setPlanColor("rgba(252,211,77,0.85)");
        } else if (s.plan === "personal") {
          setPlanLabel("Personal");
          setPlanColor("rgba(56,189,248,0.90)");
        } else if (s.plan === "family") {
          setPlanLabel("Family");
          setPlanColor("rgba(56,189,248,0.90)");
        } else {
          setPlanLabel("Free Plan");
          setPlanColor("rgba(186,230,253,0.55)");
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };
  const initials = user?.email?.[0].toUpperCase() ?? "U";

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2.5 rounded-xl md:hidden"
        style={{
          background: "linear-gradient(135deg,#0284c7,#0ea5e9)",
          boxShadow: "0 4px 16px rgba(2,132,199,0.40)",
        }}
      >
        {isOpen ? (
          <X size={18} color="white" />
        ) : (
          <Menu size={18} color="white" />
        )}
      </button>

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
        style={{
          background:
            "linear-gradient(180deg,#0c1a35 0%,#0f2040 55%,#0c1a35 100%)",
          borderRight: "1px solid rgba(56,189,248,0.10)",
        }}
      >
        {/* Top accent */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background:
              "linear-gradient(90deg,transparent,rgba(14,165,233,0.70),rgba(56,189,248,0.50),transparent)",
          }}
        />
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(rgba(56,189,248,1) 1px,transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />

        {/* Logo */}
        <div className="relative p-7 pb-5">
          <Link
            href="/"
            className="flex items-center gap-2.5"
            style={{ textDecoration: "none" }}
            onClick={() => setIsOpen(false)}
          >
            <Image
              src="/spendnub-64x64.png"
              alt="SpendNub"
              width={32}
              height={32}
              style={{ borderRadius: 10, flexShrink: 0 }}
              priority
            />
            <div>
              <h1
                className="text-lg font-black tracking-tight leading-none"
                style={{ fontFamily: "'Syne',sans-serif", color: "#f0f9ff" }}
              >
                SpendNub<span style={{ color: "#38bdf8" }}>.</span>
              </h1>
              <p
                className="text-[9px] uppercase tracking-[0.2em] mt-0.5"
                style={{
                  color: "rgba(56,189,248,0.55)",
                  fontFamily: "'Syne',sans-serif",
                }}
              >
                Finance Engine
              </p>
            </div>
          </Link>
        </div>

        <div
          className="mx-6 h-px mb-4"
          style={{ background: "rgba(56,189,248,0.10)" }}
        />
        <p
          className="px-7 mb-2 text-[9px] font-bold uppercase tracking-[0.2em]"
          style={{
            color: "rgba(186,230,253,0.30)",
            fontFamily: "'Syne',sans-serif",
          }}
        >
          Navigation
        </p>

        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="relative flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group"
                style={{
                  background: isActive
                    ? "rgba(14,165,233,0.16)"
                    : "transparent",
                  border: isActive
                    ? "1px solid rgba(56,189,248,0.25)"
                    : "1px solid transparent",
                }}
              >
                {isActive && (
                  <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
                    style={{
                      background: "linear-gradient(180deg,#38bdf8,#0ea5e9)",
                    }}
                  />
                )}
                <item.icon
                  size={16}
                  style={{
                    color: isActive ? "#38bdf8" : "rgba(186,230,253,0.40)",
                    flexShrink: 0,
                  }}
                  className="transition-colors duration-200 group-hover:!text-sky-300"
                />
                <span
                  className="text-sm font-semibold"
                  style={{
                    fontFamily: "'DM Sans',sans-serif",
                    color: isActive ? "#e0f2fe" : "rgba(186,230,253,0.50)",
                    transition: "color 0.2s",
                  }}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* User card */}
        <div className="p-4">
          <div
            className="rounded-xl p-3"
            style={{
              background: "rgba(14,165,233,0.07)",
              border: "1px solid rgba(56,189,248,0.12)",
            }}
          >
            <div className="flex items-center gap-3 px-1 py-1 mb-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0"
                style={{
                  background:
                    "linear-gradient(135deg,rgba(2,132,199,0.40),rgba(8,145,178,0.30))",
                  border: "1px solid rgba(56,189,248,0.30)",
                  color: "#38bdf8",
                  fontFamily: "'Syne',sans-serif",
                }}
              >
                {initials}
              </div>
              <div className="overflow-hidden">
                <p
                  className="text-xs font-semibold truncate"
                  style={{
                    fontFamily: "'DM Sans',sans-serif",
                    color: "#bae6fd",
                  }}
                >
                  {user?.email}
                </p>
                <p
                  className="text-[9px] font-bold uppercase tracking-wider flex items-center gap-1"
                  style={{ color: planColor, fontFamily: "'Syne',sans-serif" }}
                >
                  {(planLabel === "Personal" || planLabel === "Family") && (
                    <Crown size={8} />
                  )}
                  {planLabel}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-200"
              style={{ color: "rgba(186,230,253,0.40)" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "rgba(244,63,94,0.10)";
                (e.currentTarget as HTMLButtonElement).style.color = "#fb7185";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "transparent";
                (e.currentTarget as HTMLButtonElement).style.color =
                  "rgba(186,230,253,0.40)";
              }}
            >
              <LogOut size={14} />
              <span
                className="text-xs font-semibold"
                style={{ fontFamily: "'DM Sans',sans-serif" }}
              >
                Sign Out
              </span>
            </button>
          </div>
        </div>
      </aside>

      {isOpen && (
        <div
          className="fixed inset-0 z-30 md:hidden"
          style={{
            background: "rgba(4,11,26,0.75)",
            backdropFilter: "blur(6px)",
          }}
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
