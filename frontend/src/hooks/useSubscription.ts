"use client";
import { useState, useEffect } from "react";
import api from "@/lib/api";

export interface AccessStatus {
  hasAccess: boolean;
  plan: string; // 'free' | 'trial' | 'personal' | 'family'
  isSubscribed: boolean;
  isTrial: boolean;
  isExpired: boolean;
  trialExpiration: string | null;
  subscriptionExpiresAt: string | null;
  bucketLimit: number;
  daysRemaining: number | null;
}

export function useSubscription() {
  const [status, setStatus] = useState<AccessStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/subscription/status")
      .then((r) => setStatus(r.data))
      .catch(() =>
        setStatus({
          hasAccess: false,
          plan: "free",
          isSubscribed: false,
          isTrial: false,
          isExpired: true,
          trialExpiration: null,
          subscriptionExpiresAt: null,
          bucketLimit: 4,
          daysRemaining: 0,
        })
      )
      .finally(() => setLoading(false));
  }, []);

  const isFreeTier = !status?.isSubscribed && !status?.isTrial;
  const isPaid = status?.isSubscribed && status?.plan !== "free";
  const bucketLimit = status?.bucketLimit ?? 4;

  return { status, loading, isFreeTier, isPaid, bucketLimit };
}
