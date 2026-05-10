"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  History,
  Settings2,
  ArrowUpCircle,
  ArrowDownCircle,
} from "lucide-react";

const navItems = [
  { name: "Home", path: "/dashboard", icon: LayoutDashboard },
  { name: "Income", path: "/income", icon: ArrowUpCircle },
  { name: "Expense", path: "/expenses", icon: ArrowDownCircle },
  { name: "History", path: "/transactions", icon: History },
  { name: "Budget", path: "/budget/config", icon: Settings2 },
];

export const MobileNav = () => {
  const pathname = usePathname();
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex justify-around items-center px-2 py-2 md:hidden"
      style={{
        background: "rgba(224,242,254,0.94)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderTop: "1px solid rgba(2,132,199,0.18)",
        boxShadow: "0 -4px 20px rgba(2,132,199,0.10)",
      }}
    >
      {navItems.map((item) => {
        const isActive = pathname === item.path;
        const Icon = item.icon;
        return (
          <Link
            key={item.path}
            href={item.path}
            className="relative flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-200"
            style={{ minWidth: 52 }}
          >
            {isActive && (
              <span
                className="absolute inset-0 rounded-xl"
                style={{
                  background: "rgba(2,132,199,0.10)",
                  border: "1px solid rgba(2,132,199,0.22)",
                }}
              />
            )}
            <Icon
              size={19}
              style={{
                color: isActive ? "#0284c7" : "rgba(2,132,199,0.40)",
                position: "relative",
              }}
            />
            <span
              className="text-[9px] font-bold uppercase tracking-wider relative"
              style={{
                fontFamily: "'Syne',sans-serif",
                color: isActive ? "#0284c7" : "rgba(2,132,199,0.45)",
              }}
            >
              {item.name}
            </span>
            {isActive && (
              <span
                className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full"
                style={{ background: "linear-gradient(90deg,#0284c7,#0ea5e9)" }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
};
