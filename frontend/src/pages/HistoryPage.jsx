import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getHistory } from '../services/api';
import { getTreatment, URGENCY_COLORS } from '../services/treatments';

const DIAGNOSIS_META = {
  healthy:  { icon: '✅', label: 'Healthy',  color: '#16a34a', bg: '#dcfce7', border: '#86efac' },
  diseased: { icon: '🦠', label: 'Diseased', color: '#d97706', bg: '#fef3c7', border: '#fcd34d' },
  rotten:   { icon: '🔴', label: 'Rotten',   color: '#dc2626', bg: '#fee2e2', border: '#fca5a5' },
  mixed:    { icon: '⚠️', label: 'Mixed',    color: '#9333ea', bg: '#f3e8ff', border: '#c4b5fd' },
};

const SEVERITY_META = {
  none:     { label: 'None',     color: '#16a34a' },
  mild:     { label: 'Mild',     color: '#65a30d' },
  moderate: { label: 'Moderate', color: '#d97706' },
  severe:   { label: 'Severe',   color: '#dc2626' },
};

function DiagnosisCard({ item }) {
  const [expanded, setExpanded] = useState(false);
  const diag = DIAGNOSIS_META[item.overall_diagnosis] || DIAGNOSIS_META.healthy;
  const sev  = SEVERITY_META[item.severity] || SEVERITY_META.none;
  const treatment = getTreatment(item.recommended_treatment_id);
  const urgency = treatment ? URGENCY_COLORS[treatment.urgency] : null;

  const date = new Date(item.createdAt);
  const formattedDate = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const formattedTime = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  return (
    <div style={{
      background: '#fff', borderRadius: 20,
      border: `1px solid ${expanded ? diag.border : '#e5e7eb'}`,
      overflow: 'hidden', transition: 'all 0.3s ease',
      boxShadow: expanded ? '0 8px 25px rgba(0,0,0,0.08)' : '0 1px 3px rgba(0,0,0,0.04)',
    }}>
      <button onClick={() => setExpanded(e => !e)} style={{
        width: '100%', background: 'none', border: 'none', cursor: 'pointer',
        padding: '16px 20px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 14,
      }}>
        {item.image_url ? (
          <img src={item.image_url} alt="apple" style={{ width: 56, height: 56, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }} />
        ) : (
          <div style={{ width: 56, height: 56, borderRadius: 12, flexShrink: 0, background: diag.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>
            {diag.icon}
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ background: diag.bg, color: diag.color, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
              {diag.icon} {diag.label}
            </span>
            {urgency && (
              <span style={{ background: urgency.bg, color: urgency.text, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                {urgency.label}
              </span>
            )}
          </div>
          <div style={{ marginTop: 4, fontSize: 13, color: '#6b7280' }}>
            Severity: <span style={{ color: sev.color, fontWeight: 600 }}>{sev.label}</span>
            <span style={{ margin: '0 8px', color: '#d1d5db' }}>·</span>
            {formattedDate} at {formattedTime}
          </div>
          {item.detections?.length > 0 && (
            <div style={{ marginTop: 4, fontSize: 12, color: '#9ca3af', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {item.detections.map(d => d.class_fr || d.class).join(', ')}
            </div>
          )}
        </div>
        <div style={{ color: '#9ca3af', fontSize: 18, flexShrink: 0, transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>▾</div>
      </button>

      {expanded && (
        <div style={{ borderTop: `1px solid ${diag.border}`, padding: '16px 20px', background: '#fafafa' }}>
          {item.detections?.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8 }}>🔍 Detected Issues</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {item.detections.map((d, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', borderRadius: 8, padding: '8px 12px', border: '1px solid #e5e7eb' }}>
                    <div>
                      <span style={{ fontWeight: 600, color: '#1f2937', fontSize: 13 }}>{d.class_fr || d.class}</span>
                      {d.class_fr && <span style={{ color: '#9ca3af', fontSize: 11, marginLeft: 6 }}>{d.class}</span>}
                    </div>
                    <span style={{ background: getConfidenceColor(d.confidence), color: '#fff', fontSize: 12, fontWeight: 700, padding: '2px 10px', borderRadius: 20 }}>
                      {(d.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {treatment && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8 }}>💊 {treatment.name_fr}</div>
              <ol style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {treatment.steps.map((step, i) => (
                  <li key={i} style={{ color: '#4b5563', fontSize: 13, lineHeight: 1.5 }}>{step}</li>
                ))}
              </ol>
              <div style={{ marginTop: 10, background: '#f0fdf4', borderRadius: 8, padding: 10, borderLeft: '3px solid #16a34a', fontSize: 12, color: '#374151' }}>
                <strong style={{ color: '#166534' }}>🛡️ Prevention: </strong>{treatment.prevention}
              </div>
            </div>
          )}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 11, color: '#9ca3af', paddingTop: 10, borderTop: '1px solid #e5e7eb' }}>
            <span>Model: {item.model_version}</span>
            <span>ID: {item.request_id?.slice(0, 8)}...</span>
            <span>{item.inference_time_ms}ms</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function HistoryPage() {
  const [items, setItems]     = useState([]);
  const [page, setPage]       = useState(1);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [filter, setFilter]   = useState('all');
  const LIMIT = 10;

  async function load(p, f) {
    setLoading(true);
    setError(null);
    try {
      const data = await getHistory(p, f === 'all' ? null : f);
      setItems(data.data || []);
      setTotal(data.total || 0);
    } catch {
      setError('Could not load history.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(page, filter); }, [page, filter]);

  function handleFilter(f) { setFilter(f); setPage(1); }

  const totalPages = Math.ceil(total / LIMIT);

  const FILTERS = [
    { id: 'all',      label: 'All' },
    { id: 'healthy',  label: '✅ Healthy' },
    { id: 'diseased', label: '🦠 Diseased' },
    { id: 'rotten',   label: '🔴 Rotten' },
    { id: 'mixed',    label: '⚠️ Mixed' },
  ];

  return (
    <motion.div initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -30, opacity: 0 }}
      transition={{ duration: 0.25 }}
      style={{ position: 'absolute', inset: 0, background: '#f8fafc', overflowY: 'auto' }}>

      {/* Header */}
      <div style={{ padding: '48px 20px 20px', background: 'linear-gradient(135deg, #166534, #16a34a)' }}>
        <h1 style={{ color: '#fff', fontSize: 24, fontWeight: 800, margin: '0 0 4px' }}>Scan History</h1>
        <p style={{ color: '#86efac', fontSize: 13 }}>
          {total > 0 ? `${total} diagnosis${total > 1 ? 'es' : ''} recorded` : 'No scans yet'}
        </p>
      </div>

      <div style={{ padding: '16px 16px calc(24px + env(safe-area-inset-bottom))' }}>
        {/* Filter pills */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 20, scrollbarWidth: 'none' }}>
          {FILTERS.map(f => (
            <motion.button key={f.id} whileTap={{ scale: 0.95 }} onClick={() => handleFilter(f.id)}
              style={{ padding: '8px 16px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0,
                background: filter === f.id ? '#16a34a' : '#fff',
                color: filter === f.id ? '#fff' : '#64748b',
                boxShadow: filter === f.id ? '0 4px 12px rgba(22,163,74,0.3)' : '0 1px 3px rgba(0,0,0,0.08)' }}>
              {f.label}
            </motion.button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTop: '3px solid #16a34a', borderRadius: '50%' }} />
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: 16, padding: 20, textAlign: 'center', color: '#dc2626', fontSize: 14 }}>
            {error}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && items.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            style={{ background: '#fff', borderRadius: 24, padding: '60px 32px', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>🔬</div>
            <div style={{ fontWeight: 700, color: '#1e293b', fontSize: 17, marginBottom: 8 }}>No diagnoses yet</div>
            <div style={{ color: '#94a3b8', fontSize: 14 }}>
              {filter !== 'all' ? `No ${filter} results found.` : 'Go scan your first apple!'}
            </div>
          </motion.div>
        )}

        {/* Cards */}
        {!loading && !error && items.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {items.map((item, i) => (
              <motion.div key={item.request_id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <DiagnosisCard item={item} />
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && !loading && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 24 }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={paginationBtn(page === 1)}>← Prev</button>
            <span style={{ color: '#64748b', fontSize: 14, fontWeight: 500 }}>Page {page} of {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={paginationBtn(page === totalPages)}>Next →</button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function getConfidenceColor(conf) {
  if (conf >= 0.85) return '#16a34a';
  if (conf >= 0.65) return '#d97706';
  return '#dc2626';
}

function paginationBtn(disabled) {
  return {
    padding: '10px 20px', borderRadius: 12, border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: 14, fontWeight: 600, transition: 'all 0.2s',
    background: disabled ? '#e5e7eb' : '#065f46',
    color: disabled ? '#9ca3af' : '#fff',
    opacity: disabled ? 0.6 : 1,
  };
}
