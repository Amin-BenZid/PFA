import { getTreatment, URGENCY_COLORS } from '../services/treatments';

const DIAGNOSIS_META = {
  healthy:  { icon: '✅', label: 'Healthy',  color: '#16a34a', bg: '#dcfce7' },
  diseased: { icon: '🦠', label: 'Diseased', color: '#d97706', bg: '#fef3c7' },
  rotten:   { icon: '🔴', label: 'Rotten',   color: '#dc2626', bg: '#fee2e2' },
  mixed:    { icon: '⚠️', label: 'Mixed',    color: '#9333ea', bg: '#f3e8ff' },
};

const SEVERITY_META = {
  none:     { label: 'None',     color: '#16a34a' },
  mild:     { label: 'Mild',     color: '#65a30d' },
  moderate: { label: 'Moderate', color: '#d97706' },
  severe:   { label: 'Severe',   color: '#dc2626' },
};

export default function DiagnosisReport({ result, imagePreview }) {
  const diag      = DIAGNOSIS_META[result.overall_diagnosis] || DIAGNOSIS_META.healthy;
  const sev       = SEVERITY_META[result.severity]           || SEVERITY_META.none;
  const treatment = getTreatment(result.recommended_treatment_id);
  const urgency   = treatment ? URGENCY_COLORS[treatment.urgency] : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Header card */}
      <div style={{
        background: diag.bg, border: `2px solid ${diag.color}`,
        borderRadius: 16, padding: 20,
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        {imagePreview && (
          <img src={imagePreview} alt="analyzed"
            style={{ width: 80, height: 80, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
        )}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 28, marginBottom: 4 }}>{diag.icon}</div>
          <div style={{ fontWeight: 700, fontSize: 22, color: diag.color }}>{diag.label}</div>
          <div style={{ color: '#6b7280', fontSize: 14 }}>
            Severity: <span style={{ color: sev.color, fontWeight: 600 }}>{sev.label}</span>
          </div>
        </div>
      </div>

      {/* Detections */}
      {result.detections?.length > 0 && (
        <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: '0 0 12px', color: '#111827', fontSize: 16 }}>🔍 Detected Issues</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {result.detections.map((d, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: '#f9fafb', borderRadius: 10, padding: '10px 14px',
              }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#1f2937' }}>{d.class_fr || d.class}</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>{d.class}</div>
                </div>
                <div style={{
                  background: getConfidenceColor(d.confidence),
                  color: '#fff', fontWeight: 700, fontSize: 14,
                  padding: '4px 12px', borderRadius: 20,
                }}>
                  {(d.confidence * 100).toFixed(0)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Treatment plan */}
      {treatment && (
        <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ margin: 0, color: '#111827', fontSize: 16 }}>💊 Treatment Plan</h3>
            {urgency && (
              <span style={{
                background: urgency.bg, color: urgency.text,
                padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
              }}>
                {urgency.label}
              </span>
            )}
          </div>

          <div style={{ fontWeight: 600, color: '#166534', marginBottom: 12 }}>
            {treatment.name_fr}
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
              Steps to follow:
            </div>
            <ol style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {treatment.steps.map((step, i) => (
                <li key={i} style={{ color: '#374151', fontSize: 14, lineHeight: 1.5 }}>{step}</li>
              ))}
            </ol>
          </div>

          <div style={{
            background: '#f0fdf4', borderRadius: 10, padding: 14,
            borderLeft: '4px solid #16a34a',
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#166534', marginBottom: 4 }}>
              🛡️ PREVENTION
            </div>
            <div style={{ fontSize: 13, color: '#374151' }}>{treatment.prevention}</div>
          </div>
        </div>
      )}

      {/* Healthy message */}
      {result.overall_diagnosis === 'healthy' && (
        <div style={{
          background: '#f0fdf4', borderRadius: 16, padding: 20, textAlign: 'center',
          border: '1px solid #86efac',
        }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🎉</div>
          <div style={{ fontWeight: 600, color: '#166534', fontSize: 16 }}>
            Your apple tree looks healthy!
          </div>
          <div style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>
            No treatment needed. Keep up with regular watering and pruning.
          </div>
        </div>
      )}

      {/* Meta info */}
      <div style={{
        background: '#f9fafb', borderRadius: 12, padding: 12,
        fontSize: 12, color: '#9ca3af', display: 'flex', justifyContent: 'space-between',
      }}>
        <span>Model: {result.model_version}</span>
        <span>ID: {result.request_id?.slice(0, 8)}...</span>
        <span>{result.inference_time_ms}ms</span>
      </div>
    </div>
  );
}

function getConfidenceColor(conf) {
  if (conf >= 0.85) return '#16a34a';
  if (conf >= 0.65) return '#d97706';
  return '#dc2626';
}
