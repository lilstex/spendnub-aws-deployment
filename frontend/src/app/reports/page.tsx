'use client';

import { useEffect, useState } from 'react';
import { BarChart3, ChevronLeft, ChevronRight, Lock, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { toast } from 'sonner';
import { reportsApi } from '@/lib/api';
import { useSubscription } from '@/hooks/useSubscription';
import type { MonthlyReport, CategoryReport } from '@/types';

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function formatAmount(n: number) {
  return `₦${n.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
}

function StatusBadge({ status }: { status: CategoryReport['status'] }) {
  const map: Record<CategoryReport['status'], { label: string; bg: string; color: string }> = {
    over: { label: 'Over Budget', bg: '#fef2f2', color: '#e11d48' },
    on_track: { label: 'On Track', bg: '#f0fdf4', color: '#059669' },
    under_utilised: { label: 'Under-Used', bg: '#fffbeb', color: '#d97706' },
    unused: { label: 'Unused', bg: '#f8fafc', color: 'rgba(12,26,53,0.38)' },
  };
  const s = map[status];
  return (
    <span style={{ background: s.bg, color: s.color, padding: '2px 8px', borderRadius: 100, fontSize: 11, fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>
      {s.label}
    </span>
  );
}

export default function ReportsPage() {
  const { isFreeTier, loading: subLoading } = useSubscription();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [report, setReport] = useState<MonthlyReport | null>(null);

  useEffect(() => {
    if (isFreeTier) return;
    reportsApi.monthly(year, month)
      .then(res => setReport(res.data))
      .catch(() => toast.error('Failed to load report'));
  }, [year, month, isFreeTier]);

  const loading = subLoading || (!isFreeTier && !report);

  const prevMonth = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;
    if (isCurrentMonth) return;
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
  };

  if (subLoading) return <div style={{ padding: 32, textAlign: 'center', color: 'rgba(12,26,53,0.58)' }}>Loading...</div>;

  if (isFreeTier) {
    return (
      <div style={{ padding: '32px', maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
        <Lock size={40} style={{ margin: '0 auto 16px', color: '#0284c7' }} />
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 700, color: '#0c1a35', marginBottom: 12 }}>Monthly Reports</h2>
        <p style={{ fontFamily: 'DM Sans, sans-serif', color: 'rgba(12,26,53,0.58)', marginBottom: 24 }}>
          Detailed monthly reports are available on Personal and Family plans. Upgrade to see how your spending compares to your budget each month.
        </p>
        <a href="/subscribe" style={{ background: '#0284c7', color: '#fff', padding: '12px 24px', borderRadius: 8, fontFamily: 'Syne, sans-serif', fontWeight: 600, textDecoration: 'none', display: 'inline-block' }}>
          Upgrade Now
        </a>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <BarChart3 size={24} color="#0284c7" />
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 700, color: '#0c1a35', margin: 0 }}>Monthly Report</h1>
      </div>

      {/* Month Selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28, background: '#f0f9ff', padding: '12px 20px', borderRadius: 10, width: 'fit-content' }}>
        <button onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
          <ChevronLeft size={18} color="#0284c7" />
        </button>
        <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: '#0c1a35', fontSize: 16, minWidth: 160, textAlign: 'center' }}>
          {MONTH_NAMES[month - 1]} {year}
        </span>
        <button onClick={nextMonth} disabled={year === now.getFullYear() && month === now.getMonth() + 1} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, opacity: (year === now.getFullYear() && month === now.getMonth() + 1) ? 0.3 : 1 }}>
          <ChevronRight size={18} color="#0284c7" />
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'rgba(12,26,53,0.58)' }}>Loading report...</div>
      ) : !report ? null : (
        <>
          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 16, marginBottom: 28 }}>
            {[
              { label: 'Total Income', value: formatAmount(report.totalIncome), color: '#059669', icon: <TrendingUp size={16} /> },
              { label: 'Total Expenses', value: formatAmount(report.totalExpenses), color: '#e11d48', icon: <TrendingDown size={16} /> },
              { label: 'Net Savings', value: formatAmount(report.netSavings), color: report.netSavings >= 0 ? '#059669' : '#e11d48', icon: <Minus size={16} /> },
              { label: 'Savings Rate', value: `${(isNaN(report.savingsRate) ? 0 : report.savingsRate).toFixed(1)}%`, color: '#0284c7', icon: null },
            ].map(card => (
              <div key={card.label} style={{ background: '#fff', border: '1px solid #e0f2fe', borderRadius: 12, padding: 20 }}>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: 'rgba(12,26,53,0.58)', marginBottom: 6 }}>{card.label}</p>
                <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 700, color: card.color, margin: 0 }}>{card.value}</p>
                {report.prevMonth && card.label === 'Total Income' && (
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: 'rgba(12,26,53,0.38)', marginTop: 4 }}>
                    Prev: {formatAmount(report.prevMonth.totalIncome)}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Alert Banners */}
          {report.overBudget.length > 0 && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecdd3', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#e11d48', margin: 0 }}>
                <strong>Over Budget:</strong> {report.overBudget.join(', ')}
              </p>
            </div>
          )}
          {report.underUtilised.length > 0 && (
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#d97706', margin: 0 }}>
                <strong>Under-Utilised:</strong> {report.underUtilised.join(', ')}
              </p>
            </div>
          )}

          {/* Category Breakdown */}
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 700, color: '#0c1a35', marginBottom: 16 }}>Category Breakdown</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {report.categories.map(cat => (
              <div key={cat.name} style={{ background: '#fff', border: '1px solid #e0f2fe', borderRadius: 12, padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, color: '#0c1a35', fontSize: 14 }}>{cat.name}</span>
                    <StatusBadge status={cat.status} />
                  </div>
                  <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, color: cat.status === 'over' ? '#e11d48' : '#059669' }}>
                    {formatAmount(cat.actualSpent)} / {formatAmount(cat.budgetedAmount)}
                  </span>
                </div>
                {/* Progress bar */}
                <div style={{ background: '#e0f2fe', borderRadius: 100, height: 6, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.min(cat.utilisationPercent, 100)}%`,
                    background: cat.status === 'over' ? '#e11d48' : cat.status === 'under_utilised' ? '#d97706' : '#059669',
                    borderRadius: 100,
                    transition: 'width 0.3s',
                  }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                  <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: 'rgba(12,26,53,0.38)' }}>{(isNaN(cat.utilisationPercent) ? 0 : cat.utilisationPercent).toFixed(1)}% used · {cat.budgetedPercent}% allocation</span>
                  <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: cat.variance >= 0 ? '#059669' : '#e11d48' }}>
                    {cat.variance >= 0 ? '+' : ''}{formatAmount(cat.variance)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
