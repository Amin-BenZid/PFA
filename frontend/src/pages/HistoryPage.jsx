import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getHistory } from '../services/api';
import { getTreatmentByClass, URGENCY_COLORS } from '../services/treatments';

const DIAGNOSIS_META = {
  healthy:  { label: 'Healthy',  color: '#16a34a', bg: '#f0fdf4', dot: '#16a34a' },
  diseased: { label: 'Diseased', color: '#b45309', bg: '#fffbeb', dot: '#d97706' },
  rotten:   { label: 'Rotten',   color: '#b91c1c', bg: '#fff1f2', dot: '#dc2626' },
  mixed:    { label: 'Mixed',    color: '#7c3aed', bg: '#f5f3ff', dot: '#8b5cf6' },
};

const SEVERITY_META = {
  none:     { label: 'None',     color: '#16a34a' },
  mild:     { label: 'Mild',     color: '#65a30d' },
  moderate: { label: 'Moderate', color: '#d97706' },
  severe:   { label: 'Severe',   color: '#dc2626' },
};

function confidenceColor(conf) {
  if (conf >= 0.85) return '#16a34a';
  if (conf >= 0.65) return '#d97706';
  return '#dc2626';
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return {
    date: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    time: d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
  };
}

// ── Detail Modal ──────────────────────────────────────────────────────────────
function DetailModal({ item, onClose }) {
  const diag     = DIAGNOSIS_META[item.overall_diagnosis] || DIAGNOSIS_META.healthy;
  const sev      = SEVERITY_META[item.severity]           || SEVERITY_META.none;
  const diseases = (item.detections || []).filter(d => d.class !== 'Fresh' && d.class !== 'healthy');
  const { date, time } = formatDate(item.createdAt);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>

      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 35 }}
        onClick={e => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: '28px 28px 0 0', maxHeight: '92vh', overflowY: 'auto' }}>

        <div style={{ width: 36, height: 4, borderRadius: 2, background: '#e2e8f0', margin: '14px auto 0' }} />

        {/* Large image */}
        {item.image_url?.startsWith('https://') && (
          <div style={{ margin: '16px 16px 0', borderRadius: 18, overflow: 'hidden', height: 220 }}>
            <img src={item.image_url} alt="apple" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}

        <div style={{ padding: '20px 20px 40px' }}>

          {/* Diagnosis header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: diag.dot }} />
              <span style={{ fontWeight: 800, fontSize: 20, color: '#1e293b' }}>{diag.label}</span>
            </div>
            <span style={{ background: diag.bg, color: diag.color, padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
              {sev.label} severity
            </span>
          </div>
          <div style={{ color: '#94a3b8', fontSize: 12, marginBottom: 24 }}>{date} at {time}</div>

          {/* Detections */}
          {item.detections?.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Detected conditions</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {item.detections.map((d, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc', borderRadius: 12, border: '1px solid #f1f5f9' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: '#1e293b' }}>{d.class_fr || d.class}</div>
                      {d.class_fr && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>{d.class}</div>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 60, height: 4, borderRadius: 2, background: '#e2e8f0', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${d.confidence * 100}%`, background: confidenceColor(d.confidence), borderRadius: 2 }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: confidenceColor(d.confidence), minWidth: 32, textAlign: 'right' }}>
                        {(d.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Treatment */}
          {diseases.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Treatment plan</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {diseases.map((d, i) => {
                  const t = getTreatmentByClass(d.class);
                  if (!t) return null;
                  const urg = URGENCY_COLORS[t.urgency];
                  return (
                    <div key={i} style={{ background: '#f8fafc', borderRadius: 14, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
                      <div style={{ padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9' }}>
                        <span style={{ fontWeight: 700, fontSize: 14, color: '#1e293b' }}>{d.class_fr || d.class}</span>
                        {urg && <span style={{ background: urg.bg, color: urg.text, fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>{urg.label}</span>}
                      </div>
                      <div style={{ padding: '10px 14px 4px' }}>
                        {t.steps.map((step, j) => (
                          <div key={j} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                            <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#64748b', flexShrink: 0, marginTop: 1 }}>{j + 1}</div>
                            <div style={{ color: '#374151', fontSize: 13, lineHeight: 1.5 }}>{step}</div>
                          </div>
                        ))}
                      </div>
                      {t.prevention && (
                        <div style={{ margin: '0 14px 14px', background: '#f0fdf4', borderRadius: 10, padding: '10px 12px', borderLeft: '3px solid #16a34a' }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: '#166534', marginBottom: 3 }}>Prevention</div>
                          <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.5 }}>{t.prevention}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Meta */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
            {[
              ['Request ID', item.request_id?.slice(0, 12) + '...'],
              ['Model', item.model_version],
              ['Inference', item.inference_time_ms ? `${item.inference_time_ms}ms` : null],
            ].filter(([, v]) => v).map(([k, v]) => (
              <div key={k} style={{ background: '#f8fafc', borderRadius: 8, padding: '6px 10px', border: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>{k}</div>
                <div style={{ fontSize: 12, color: '#374151', fontWeight: 600, marginTop: 1 }}>{v}</div>
              </div>
            ))}
          </div>

          <button onClick={onClose}
            style={{ width: '100%', marginTop: 20, padding: 14, background: '#f1f5f9', color: '#374151', border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── History Card ──────────────────────────────────────────────────────────────
function HistoryCard({ item, onClick }) {
  const diag = DIAGNOSIS_META[item.overall_diagnosis] || DIAGNOSIS_META.healthy;
  const sev  = SEVERITY_META[item.severity]           || SEVERITY_META.none;
  const { date, time } = formatDate(item.createdAt);
  const topDisease = (item.detections || []).find(d => d.class !== 'Fresh' && d.class !== 'healthy');

  return (
    <motion.button whileTap={{ scale: 0.98 }} onClick={onClick}
      style={{ width: '100%', background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9', overflow: 'hidden', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 14, padding: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>

      {item.image_url?.startsWith('https://') ? (
        <img src={item.image_url} alt="apple" style={{ width: 60, height: 60, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }} />
      ) : (
        <div style={{ width: 60, height: 60, borderRadius: 12, flexShrink: 0, background: diag.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 16, height: 16, borderRadius: '50%', background: diag.dot }} />
        </div>
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: diag.dot, flexShrink: 0 }} />
          <span style={{ fontWeight: 700, fontSize: 14, color: '#1e293b' }}>{diag.label}</span>
          <span style={{ fontSize: 11, color: sev.color, fontWeight: 600 }}>{sev.label}</span>
        </div>
        {topDisease && (
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {topDisease.class_fr || topDisease.class}
          </div>
        )}
        <div style={{ fontSize: 11, color: '#94a3b8' }}>{date} · {time}</div>
      </div>

      <div style={{ color: '#cbd5e1', fontSize: 18, flexShrink: 0 }}>›</div>
    </motion.button>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function HistoryPage() {
  const [items, setItems]       = useState([]);
  const [page, setPage]         = useState(1);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [filter, setFilter]     = useState('all');
  const [selected, setSelected] = useState(null);
  const LIMIT = 10;

  async function load(p, f) {
    setLoading(true); setError(null);
    try {
      const data = await getHistory(p, f === 'all' ? null : f);
      setItems(data.data || []);
      setTotal(data.total || 0);
    } catch {
      setError('Unable to load history.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(page, filter); }, [page, filter]);
  function handleFilter(f) { setFilter(f); setPage(1); }

  const totalPages = Math.ceil(total / LIMIT);
  const FILTERS = ['all', 'healthy', 'diseased', 'rotten', 'mixed'];

  return (
    <>
      <motion.div initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -30, opacity: 0 }}
        transition={{ duration: 0.25 }}
        style={{ position: 'absolute', inset: 0, background: '#f8fafc', overflowY: 'auto' }}>

        <div style={{ padding: '48px 20px 20px', background: 'linear-gradient(135deg, #166534, #16a34a)' }}>
          <div style={{ color: '#fff', fontWeight: 800, fontSize: 22 }}>Scan History</div>
          <div style={{ color: '#86efac', fontSize: 13, marginTop: 2 }}>
            {total > 0 ? `${total} diagnosis record${total > 1 ? 's' : ''}` : 'No scans yet'}
          </div>
        </div>

        <div style={{ padding: '16px 16px calc(24px + env(safe-area-inset-bottom))' }}>

          {/* Filters */}
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBo