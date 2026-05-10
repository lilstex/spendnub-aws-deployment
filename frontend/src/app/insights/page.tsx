'use client';

import { useEffect, useState } from 'react';
import { Zap, AlertTriangle, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { insightsApi } from '@/lib/api';
import { useSubscription } from '@/hooks/useSubscription';
import type { EnhancedForecast } from '@/types';

function formatAmount(n: number) {
  return `₦${n.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
}

export default function InsightsPage() {
  const { isFreeTier, loading: subLoading } = useSubscription();
  const [forecast, setForecast] = useState<EnhancedForecast | null>(null);
  useEffect(() => {
    if (isFreeTier) return;
    insightsApi.enhanced()
      .then(res => setForecast(res.data))
      .catch(() => toast.error('Failed to load predictions'));
  }, [isFreeTier]);

  if (subLoading || (!isFreeTier && !forecast)) {
    return <div style={{ padding: 32, textAlign: 'center', color: 'rgba(12,26,53,0.58)' }}>Loading...</div>;
  }

  if (isFreeTier) {
    return (
      <div style={{ padding: '32px', maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
        <Lock size={40} style={{ margin: '0 auto 16px', color: '#0284c7' }} />
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 700, color: '#0c1a35', marginBottom: 12 }}>Spending Predictions</h2>
        <p style={{ fontFamily: 'DM Sans, sans-serif', color: 'rgba(12,26,53,0.58)', marginBottom: 24 }}>
          Predictions and forecasting are available on Personal and Family plans.
        </p>
        <a href="/subscribe" style={{ background: '#0284c7', color: '#fff', padding: '12px 24px', borderRadius: 8, fontFamily: 'Syne, sans-serif', fontWeight: 600, textDecoration: 'none', display: 'inline-block' }}>Upgrade Now</a>
      </div>
    );
  }

  if (!forecast) return null;

  const pct = forecast.daysInMonth > 0 ? (forecast.daysElapsed / forecast.daysInMonth) * 100 : 0;

  return (
    <div style={{ padding: '24px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <Zap size={24} color="#0284c7" />
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 700, color: '#0c1a35', margin: 0 }}>Insights & Predictions</h1>
      </div>

      {/* Month progress */}
      <div style={{ background: '#f0f9ff', borderRadius: 12, padding: '16px 20px', marginBottom: 24 }}>
        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: 'rgba(12,26,53,0.58)', marginBottom: 8 }}>
          Day {forecast.daysElapsed} of {forecast.daysInMonth} — {pct.toFixed(0)}% through the month
        </p>
        <div style={{ background: '#e0f2fe', borderRadius: 100, height: 8 }}>
          <div style={{ width: `${pct}%`, height: '100%', background: '#0284c7', borderRadius: 100 }} />
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Avg Monthly Income', value: formatAmount(forecast.avgMonthlyIncome), color: '#059669' },
          { label: 'Projected Month Spend', value: formatAmount(forecast.projectedTotalSpend), color: '#0284c7' },
          { label: 'Projected Savings', value: formatAmount(forecast.projectedSavings), color: forecast.projectedSavings >= 0 ? '#059669' : '#e11d48' },
          { label: 'Projected Savings Rate', value: `${(isNaN(forecast.projectedSavingsRate) ? 0 : forecast.projectedSavingsRate).toFixed(1)}%`, color: '#0284c7' },
        ].map(c => (
          <div key={c.label} style={{ background: '#fff', border: '1px solid #e0f2fe', borderRadius: 12, padding: 20 }}>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: 'rgba(12,26,53,0.58)', marginBottom: 6 }}>{c.label}</p>
            <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 700, color: c.color, margin: 0 }}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      {forecast.recommendations.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 700, color: '#0c1a35', marginBottom: 12 }}>Alerts</h2>
          {forecast.recommendations.map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '12px 16px', marginBottom: 10 }}>
              <AlertTriangle size={16} color="#d97706" style={{ flexShrink: 0, marginTop: 2 }} />
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#92400e', margin: 0 }}>{r.message}</p>
            </div>
          ))}
        </div>
      )}

      {/* Category Projections */}
      <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 700, color: '#0c1a35', marginBottom: 16 }}>Category Projections</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {forecast.categoryProjections.map(cat => (
          <div key={cat.name} style={{ background: '#fff', border: `1px solid ${cat.onPaceToOvershoot ? '#fecdd3' : '#e0f2fe'}`, borderRadius: 12, padding: '16px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, color: '#0c1a35', fontSize: 14 }}>{cat.name}</span>
              {cat.onPaceToOvershoot && (
                <span style={{ background: '#fef2f2', color: '#e11d48', padding: '2px 8px', borderRadius: 100, fontSize: 11, fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>At Risk</span>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: 'rgba(12,26,53,0.58)', marginBottom: 8 }}>
              <span>Spent: {formatAmount(cat.spentSoFar)}</span>
              <span>Projected: {formatAmount(cat.projectedMonthEnd)}</span>
              <span>Budget: {formatAmount(cat.budgetedAmount)}</span>
            </div>
            <div style={{ background: '#e0f2fe', borderRadius: 100, height: 6 }}>
              <div style={{
                height: '100%',
                width: `${Math.min(cat.budgetedAmount > 0 ? (cat.projectedMonthEnd / cat.budgetedAmount) * 100 : 0, 100)}%`,
                background: cat.onPaceToOvershoot ? '#e11d48' : '#059669',
                borderRadius: 100,
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
