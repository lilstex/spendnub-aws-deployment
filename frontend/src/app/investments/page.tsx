'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, Plus, Trash2, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { investmentApi } from '@/lib/api';
import { useSubscription } from '@/hooks/useSubscription';
import type {
  Investment,
  CreateInvestmentPayload,
  InvestmentPortfolioSummary,
  InvestmentType,
} from '@/types';

const INVESTMENT_TYPES: { value: InvestmentType; label: string }[] = [
  { value: 'stock', label: 'Stock' },
  { value: 'etf', label: 'ETF' },
  { value: 'crypto', label: 'Crypto' },
  { value: 'bond', label: 'Bond / Fixed Income' },
  { value: 'mutual_fund', label: 'Mutual Fund' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'other', label: 'Other' },
];

const MONTH_NAMES = [
  'Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec',
];

function formatAmount(n: number) {
  return `₦${n.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
}

export default function InvestmentsPage() {
  const { isFreeTier, loading: subLoading } = useSubscription();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [summary, setSummary] = useState<InvestmentPortfolioSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<CreateInvestmentPayload>({
    platform: '',
    investmentType: 'stock',
    instrumentName: '',
    amount: 0,
  });

  const fetchData = async () => {
    try {
      const [listRes, summaryRes] = await Promise.all([
        investmentApi.getAll(),
        investmentApi.getSummary(),
      ]);
      setInvestments(listRes.data);
      setSummary(summaryRes.data);
    } catch {
      toast.error('Failed to load investments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isFreeTier) fetchData();
    else setLoading(false);
  }, [isFreeTier]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.platform || !form.instrumentName || form.amount <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSubmitting(true);
    try {
      await investmentApi.create(form);
      toast.success('Investment recorded');
      setShowForm(false);
      setForm({ platform: '', investmentType: 'stock', instrumentName: '', amount: 0 });
      await fetchData();
    } catch {
      toast.error('Failed to record investment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await investmentApi.remove(id);
      toast.success('Investment removed');
      await fetchData();
    } catch {
      toast.error('Failed to remove investment');
    }
  };

  if (subLoading || loading) {
    return (
      <div style={{ padding: '32px', textAlign: 'center', color: 'rgba(12,26,53,0.58)' }}>
        Loading...
      </div>
    );
  }

  if (isFreeTier) {
    return (
      <div style={{ padding: '32px', maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
        <Lock size={40} style={{ margin: '0 auto 16px', color: '#0284c7' }} />
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 700, color: '#0c1a35', marginBottom: 12 }}>
          Investment Tracking
        </h2>
        <p style={{ fontFamily: 'DM Sans, sans-serif', color: 'rgba(12,26,53,0.58)', marginBottom: 24 }}>
          Investment tracking is available on Personal and Family plans. Upgrade to start recording and monitoring your portfolio.
        </p>
        <a href="/subscribe" style={{ background: '#0284c7', color: '#fff', padding: '12px 24px', borderRadius: 8, fontFamily: 'Syne, sans-serif', fontWeight: 600, textDecoration: 'none', display: 'inline-block' }}>
          Upgrade Now
        </a>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <TrendingUp size={24} color="#0284c7" />
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 700, color: '#0c1a35', margin: 0 }}>
            Investments
          </h1>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#0284c7', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: 8, fontFamily: 'Syne, sans-serif', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}
        >
          <Plus size={16} /> Log Investment
        </button>
      </div>

      {/* Portfolio Summary */}
      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 28 }}>
          <div style={{ background: '#f0f9ff', borderRadius: 12, padding: 20 }}>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: 'rgba(12,26,53,0.58)', marginBottom: 6 }}>Total Deployed</p>
            <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 700, color: '#0284c7', margin: 0 }}>{formatAmount(summary.totalDeployed)}</p>
          </div>
          <div style={{ background: '#f0f9ff', borderRadius: 12, padding: 20 }}>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: 'rgba(12,26,53,0.58)', marginBottom: 6 }}>Positions</p>
            <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 700, color: '#0c1a35', margin: 0 }}>{summary.count}</p>
          </div>
        </div>
      )}

      {/* Log Form */}
      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: '#fff', border: '1px solid #e0f2fe', borderRadius: 12, padding: 24, marginBottom: 28 }}>
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 700, marginBottom: 20, color: '#0c1a35' }}>New Investment</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <div>
              <label style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 600, color: '#0c1a35', display: 'block', marginBottom: 6 }}>Platform *</label>
              <input value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })} placeholder="e.g. Bamboo, Chaka, Binance" required style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e0f2fe', fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 600, color: '#0c1a35', display: 'block', marginBottom: 6 }}>Type *</label>
              <select value={form.investmentType} onChange={e => setForm({ ...form, investmentType: e.target.value as InvestmentType })} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e0f2fe', fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box' }}>
                {INVESTMENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 600, color: '#0c1a35', display: 'block', marginBottom: 6 }}>Instrument Name *</label>
              <input value={form.instrumentName} onChange={e => setForm({ ...form, instrumentName: e.target.value })} placeholder="e.g. AAPL, Bitcoin, NGE T-Bill" required style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e0f2fe', fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 600, color: '#0c1a35', display: 'block', marginBottom: 6 }}>Amount Invested (₦) *</label>
              <input type="number" value={form.amount || ''} onChange={e => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })} placeholder="50000" required min={0.01} step={0.01} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e0f2fe', fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 600, color: '#0c1a35', display: 'block', marginBottom: 6 }}>Unit Price (optional)</label>
              <input type="number" value={form.unitPrice || ''} onChange={e => setForm({ ...form, unitPrice: e.target.value ? parseFloat(e.target.value) : undefined })} placeholder="e.g. 5000" min={0} step={0.01} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e0f2fe', fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 600, color: '#0c1a35', display: 'block', marginBottom: 6 }}>Date</label>
              <input type="date" value={form.date || ''} onChange={e => setForm({ ...form, date: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e0f2fe', fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box' }} />
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <label style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 600, color: '#0c1a35', display: 'block', marginBottom: 6 }}>Notes (optional)</label>
            <textarea value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Any additional notes..." rows={2} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e0f2fe', fontFamily: 'DM Sans, sans-serif', resize: 'vertical', boxSizing: 'border-box' }} />
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
            <button type="submit" disabled={submitting} style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, fontFamily: 'Syne, sans-serif', fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1 }}>
              {submitting ? 'Saving...' : 'Record Investment'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} style={{ background: 'transparent', color: '#0c1a35', border: '1px solid #e0f2fe', padding: '10px 20px', borderRadius: 8, fontFamily: 'DM Sans, sans-serif', cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Investment List */}
      {investments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'rgba(12,26,53,0.38)' }}>
          <TrendingUp size={36} style={{ margin: '0 auto 12px' }} />
          <p style={{ fontFamily: 'DM Sans, sans-serif' }}>No investments logged yet. Start by recording your first investment.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {investments.map((inv) => {
            const dateStr = inv.date
              ? (() => { const d = new Date(inv.date); return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`; })()
              : '—';
            return (
              <div key={inv._id} style={{ background: '#fff', border: '1px solid #e0f2fe', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: '#0c1a35', fontSize: 15 }}>{inv.instrumentName}</span>
                    <span style={{ background: '#e0f2fe', color: '#0284c7', padding: '2px 8px', borderRadius: 100, fontSize: 11, fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>{inv.investmentType.replaceAll('_', ' ')}</span>
                  </div>
                  <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: 'rgba(12,26,53,0.58)' }}>
                    {inv.platform} · {dateStr}
                    {inv.unitPrice && ` · ₦${inv.unitPrice.toLocaleString()}/unit`}
                    {inv.units && ` · ${inv.units.toFixed(4)} units`}
                  </div>
                  {inv.notes && <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: 'rgba(12,26,53,0.38)', marginTop: 4 }}>{inv.notes}</div>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, color: '#059669' }}>{formatAmount(inv.amount)}</span>
                  <button onClick={() => handleRemove(inv._id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#e11d48', padding: 4 }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
