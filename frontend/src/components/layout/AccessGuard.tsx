"use client";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const AccessGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, token } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }

    const trialEnd = new Date(user?.trialExpiration || "");
    const now = new Date();

    if (!user?.isSubscribed && now > trialEnd) {
      router.push("/subscribe");
    }
  }, [user, token, router]);

  return <>{children}</>;
};
