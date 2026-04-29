import { getTreatmentByClass, URGENCY_COLORS } from '../services/treatments';

const DIAGNOSIS_META = {
  healthy:  { icon: '✅', label: 'Sain',     color: '#16a34a', bg: '#dcfce7' },
  diseased: { icon: '🦠', label: 'Malade',   color: '#d97706', bg: '#fef3c7' },
  rotten:   { icon: '🔴', label: 'Pourri',   color: '#dc2626', bg: '#fee2e2' },
  mixed:    { icon: '⚠️', label: 'Mixte',    color: '#9333ea', bg: '#f3e8ff' },
};

const SEVERITY_META = {
  none:     { label: 'Aucune',   color: '#16a34a' },
  mild:     { label: 'Légère',   color: '#65a30d' },
  moderate: { label: 'Modérée',  color: '#d97706' },
  severe:   { label: 'Sévère',   color: '#dc2626' },
};

function TreatmentCard({ detection }) {
  const treatment = getTreatmentByClass(detection.class);
  const urgency   = treatment ? URGENCY_COLORS[treatment.urgency] : null;

  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
      {/* Disease header */}
      <div style={{ padding: '14px 16px', background: '#fafafa', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontWeight: 700, color: '#1f2937', fontSize: 15 }}>{detection.class}</div>
          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
            Confiance: <span style={{ fontWeight: 600, color: getConfidenceColor(detection.confidence) }}>
              {(detection.confidence * 100).toFixed(0)}%
            </span>
          </div>
        </div>
        {urgency && (
          <span style={{ background: urgency.bg, color: urgency.text, padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
            {urgency.label}
          </span>
        )}
      </div>

      {treatment ? (
        <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Steps */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 8 }}>🌿 Traitement</div>
            <ol style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {treatment.steps.map((step, i) => (
                <li key={i} style={{ color: '#4b5563', fontSize: 13, lineHeight: 1.5 }}>{step}</li>
              ))}
            </ol>
          </div>
          {/* Prevention */}
          <div style={{ background: '#f0fdf4', borderRadius: 10, padding: 12, borderLeft: '3px solid #16a34a' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#166534', marginBottom: 4 }}>🛡️ PRÉVENTION</div>
            <div style={{ fontSize: 12, color: '#374151' }}>{treatment.prevention}</div>
          </div>
        </div>
      ) : (
        <div style={{ padding: '14px 16px', fontSize: 13, color: '#6b7280' }}>
          Aucun traitement nécessaire.
        </div>
      )}
    </div>
  );
}

export default function DiagnosisReport({ result, imagePreview }) {
  const diag = DIAGNOSIS_META[result.overall_diagnosis] || DIAGNOSIS_META.healthy;
  const sev  = SEVERITY_META[result.severity]           || SEVERITY_META.none;

  const diseases = (result.detections || []).filter(d => d.class !== 'Fresh');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Header card */}
      <div style={{ background: diag.bg, border: `2px solid ${diag.color}`, borderRadius: 16, padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
        {imagePreview && (
          <img src={imagePreview} alt="analyzed" style={{ width: 80, height: 80, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
        )}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 28, marginBottom: 4 }}>{diag.icon}</div>
          <div style={{ fontWeight: 700, fontSize: 22, color: diag.color }}>{diag.label}</div>
          <div style={{ color: '#6b7280', fontSize: 14 }}>
            Sévérité: <span style={{ color: sev.color, fontWeight: 600 }}>{sev.label}</span>
          </div>
          {diseases.length > 0 && (
            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
              {diseases.length} maladie{diseases.length > 1 ? 's' : ''} détectée{diseases.length > 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>

      {/* Healthy message */}
      {result.overall_diagnosis === 'healthy' && (
        <div style={{ background: '#f0fdf4', borderRadius: 16, padding: 20, textAlign: 'center', border: '1px solid #86efac' }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🎉</div>
          <div style={{ fontWeight: 600, color: '#166534', fontSize: 16 }}>Votre pommier est en bonne santé !</div>
          <div style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>Aucun traitement nécessaire. Continuez l'arrosage et la taille régulière.</div>
        </div>
      )}

      {/* One treatment card per disease */}
      {diseases.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#374151' }}>💊 Plans de traitement</div>
          {diseases.map((d, i) => (
            <TreatmentCard key={i} detection={d} />
          ))}
        </div>
      )}

      {/* Meta */}
      <div style={{ background: '#f9fafb', borderRadius: 12, padding: 12, fontSize: 12, color: '#9ca3af', display: 'flex', justifyContent: 'space-between' }}>
        <span>Modèle: {result.model_version}</span>
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