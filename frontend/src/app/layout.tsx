"use client";
import { usePathname } from "next/navigation";
import { Toaster } from "sonner";
import "@/app/globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const authRoutes = [
    "/",
    "/login",
    "/signup",
    "/forgot-password",
    "/verify-otp",
    "/reset-password",
  ];
  const isAuthPage = authRoutes.includes(pathname ?? "");

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        style={{
          background: isAuthPage ? "#0c1e40" : "#e0f2fe",
          color: isAuthPage ? "#f0f9ff" : "#0c1a35",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <div className="flex min-h-screen">
          {!isAuthPage && <Sidebar />}
          <main
            className={`flex-1 transition-all duration-300 ${
              !isAuthPage ? "md:ml-64" : ""
            }`}
            style={{ background: isAuthPage ? "transparent" : "#e0f2fe" }}
          >
            {children}
          </main>
        </div>
        {!isAuthPage && <MobileNav />}
        <Toaster
          position="top-center"
          richColors
          toastOptions={{
            style: {
              background: "#ffffff",
              border: "1px solid rgba(2,132,199,0.20)",
              color: "#0c1a35",
              fontFamily: "'DM Sans', sans-serif",
              boxShadow: "0 8px 28px rgba(2,132,199,0.12)",
            },
          }}
        />
      </body>
    </html>
  );
}
