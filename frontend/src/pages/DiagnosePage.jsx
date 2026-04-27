import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { diagnoseImage } from '../services/api';
import CameraCapture from '../components/CameraCapture';
import DiagnosisReport from '../components/DiagnosisReport';

export default function DiagnosePage() {
  const [phase, setPhase] = useState('camera'); // camera | preview | scanning | result
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [camError, setCamError] = useState(null);
  const camRef = useRef(null);
  const fileRef = useRef(null);

  function handleFile(f) {
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError(null);
    setPhase('preview');
  }

  function reset() {
    setFile(null); setPreview(null); setResult(null); setError(null); setCamError(null);
    setPhase('camera');
  }

  async function analyze() {
    setPhase('scanning');
    try {
      const data = await diagnoseImage(file);
      setResult(data);
      setPhase('result');
    } catch {
      setError('Could not reach the server. Please try again.');
      setPhase('preview');
    }
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000', overflow: 'hidden' }}>
      <AnimatePresence mode="wait">

        {/* ── CAMERA PHASE ── */}
        {phase === 'camera' && (
          <motion.div key="camera" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'absolute', inset: 0 }}>
            {/* Live camera feed */}
            <CameraCapture ref={camRef} onCapture={handleFile} onError={setCamError} />

            {/* Top gradient + logo */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '48px 24px 80px', background: 'linear-gradient(to bottom, rgba(0,0,0,0.65), transparent)', pointerEvents: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 26 }}>🍎</span>
                <div>
                  <div style={{ color: '#fff', fontWeight: 700, fontSize: 17, lineHeight: 1.2 }}>Apple Doctor</div>
                  <div style={{ color: '#4ade80', fontSize: 11 }}>Disease Detection AI</div>
                </div>
              </div>
            </div>

            {/* Scan frame */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
              <ScanFrame />
            </div>

            {/* Camera error */}
            {camError && (
              <div style={{ position: 'absolute', top: '50%', left: 24, right: 24, transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', borderRadius: 16, padding: 20, textAlign: 'center', color: '#fca5a5', fontSize: 13 }}>
                {camError}
              </div>
            )}

            {/* Bottom controls */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px 40px 36px', background: 'linear-gradient(to top, rgba(0,0,0,0.75), transparent)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              {/* Upload */}
              <motion.button whileTap={{ scale: 0.88 }} onClick={() => fileRef.current.click()}
                style={{ width: 50, height: 50, borderRadius: 16, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', border: '1.5px solid rgba(255,255,255,0.25)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                🖼️
              </motion.button>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={e => e.target.files[0] && handleFile(e.target.files[0])} />

              {/* Capture button */}
              <motion.button whileTap={{ scale: 0.92 }} onClick={() => camRef.current?.capture()}
                style={{ width: 76, height: 76, borderRadius: '50%', background: '#fff', border: '4px solid rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 3px rgba(255,255,255,0.2)' }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#fff', border: '2px solid #e2e8f0' }} />
              </motion.button>

              <div style={{ width: 50 }} />
            </div>
          </motion.div>
        )}

        {/* ── PREVIEW PHASE ── */}
        {phase === 'preview' && (
          <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'absolute', inset: 0 }}>
            <img src={preview} alt="captured" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)' }} />

            {/* Bottom sheet */}
            <motion.div initial={{ y: 120, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(24px)', borderRadius: '28px 28px 0 0', padding: '20px 24px 36px' }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: '#e2e8f0', margin: '0 auto 20px' }} />
              <p style={{ textAlign: 'center', color: '#64748b', fontSize: 14, marginBottom: 20 }}>Image ready for analysis</p>
              {error && <div style={{ background: '#fef2f2', color: '#dc2626', borderRadius: 12, padding: '12px 16px', fontSize: 13, marginBottom: 16, textAlign: 'center' }}>{error}</div>}
              <motion.button whileTap={{ scale: 0.97 }} onClick={analyze}
                style={{ width: '100%', padding: '17px', background: 'linear-gradient(135deg, #166534, #22c55e)', color: '#fff', border: 'none', borderRadius: 18, fontSize: 16, fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 24px rgba(22,163,74,0.4)', marginBottom: 12 }}>
                🔬 Analyze with AI
              </motion.button>
              <button onClick={reset} style={{ width: '100%', padding: '14px', background: 'transparent', color: '#64748b', border: 'none', borderRadius: 18, fontSize: 15, fontWeight: 500, cursor: 'pointer' }}>
                ← Retake Photo
              </button>
            </motion.div>
          </motion.div>
        )}

        {/* ── SCANNING PHASE ── */}
        {phase === 'scanning' && (
          <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'absolute', inset: 0 }}>
            <img src={preview} alt="scanning" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
              {/* Scan line */}
              <div style={{ width: 220, height: 220, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ScanFrame />
                <motion.div animate={{ y: [-80, 80, -80] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ position: 'absolute', width: 200, height: 2, background: 'linear-gradient(to right, transparent, #4ade80, transparent)', boxShadow: '0 0 16px #4ade80, 0 0 40px rgba(74,222,128,0.4)' }} />
              </div>
              <div>
                <div style={{ color: '#fff', fontSize: 18, fontWeight: 600, textAlign: 'center' }}>Analyzing...</div>
                <div style={{ color: '#4ade80', fontSize: 13, textAlign: 'center', marginTop: 6 }}>AI is scanning the apple tissue</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── RESULT PHASE ── */}
        {phase === 'result' && result && (
          <motion.div key="result" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ position: 'absolute', inset: 0, background: '#f8fafc', overflowY: 'auto' }}>
            {/* Image hero */}
            <div style={{ position: 'relative', height: 260, flexShrink: 0 }}>
              <img src={preview} alt="result" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(248,250,252,1) 100%)' }} />
              {/* Back button */}
              <motion.button whileTap={{ scale: 0.9 }} onClick={reset}
                style={{ position: 'absolute', top: 16, left: 16, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', border: 'none', color: '#fff', borderRadius: 12, padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                ← New Scan
              </motion.button>
            </div>

            {/* Report */}
            <div style={{ padding: '0 16px 32px', marginTop: -8 }}>
              <DiagnosisReport result={result} imagePreview={preview} />
              <motion.button whileTap={{ scale: 0.97 }} onClick={reset}
                style={{ width: '100%', marginTop: 20, padding: '17px', background: 'linear-gradient(135deg, #166534, #22c55e)', color: '#fff', border: 'none', borderRadius: 18, fontSize: 16, fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 24px rgba(22,163,74,0.3)' }}>
                📷 Scan Another Apple
              </motion.button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}

function ScanFrame() {
  const c = { position: 'absolute', width: 28, height: 28, border: '3px solid #4ade80' };
  return (
    <motion.div animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 2, repeat: Infinity }}
      style={{ width: 220, height: 220, position: 'relative' }}>
      <div style={{ ...c, top: 0, left: 0, borderRight: 'none', borderBottom: 'none', borderRadius: '6px 0 0 0' }} />
      <div style={{ ...c, top: 0, right: 0, borderLeft: 'none', borderBottom: 'none', borderRadius: '0 6px 0 0' }} />
      <div style={{ ...c, bottom: 0, left: 0, borderRight: 'none', borderTop: 'none', borderRadius: '0 0 0 6px' }} />
      <div style={{ ...c, bottom: 0, right: 0, borderLeft: 'none', borderTop: 'none', borderRadius: '0 0 6px 0' }} />
    </motion.div>
  );
}