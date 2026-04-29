import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { diagnoseImage } from '../services/api';
import CameraCapture from '../components/CameraCapture';
import DiagnosisReport from '../components/DiagnosisReport';
// TF.js + COCO-SSD loaded via CDN in index.html → available as window.cocoSsd

export default function DiagnosePage() {
  const [phase, setPhase]           = useState('camera'); // camera | checking | preview | scanning | result
  const [file, setFile]             = useState(null);
  const [preview, setPreview]       = useState(null);
  const [result, setResult]         = useState(null);
  const [error, setError]           = useState(null);
  const [camError, setCamError]     = useState(null);
  const [noApple, setNoApple]       = useState(false);   // controls the popup
  const [cameraKey, setCameraKey]   = useState(0);       // forces CameraCapture remount
  const camRef  = useRef(null);
  const fileRef = useRef(null);
  const modelRef = useRef(null);

  useEffect(() => {
    if (window.cocoSsd) {
      window.cocoSsd.load().then(m => { modelRef.current = m; }).catch(() => {});
    }
  }, []);

  async function handleFile(f) {
    setFile(f);
    setError(null);
    setNoApple(false);
    const url = URL.createObjectURL(f);
    setPreview(url);
    setPhase('checking');

    try {
      if (modelRef.current) {
        const img = new Image();
        img.src = url;
        await new Promise(resolve => { img.onload = resolve; });
        const predictions = await modelRef.current.detect(img);
        const hasApple = predictions.some(p => p.class === 'apple' && p.score > 0.15);
        if (!hasApple) {
          setNoApple(true);        // show popup
          setCameraKey(k => k + 1); // restart camera stream
          setPhase('camera');
          return;
        }
      }
    } catch {
      // model error — skip validation
    }

    setPhase('preview');
  }

  function reset() {
    setFile(null); setPreview(null); setResult(null);
    setError(null); setCamError(null); setNoApple(false);
    setCameraKey(k => k + 1);
    setPhase('camera');
  }

  async function analyze() {
    setPhase('scanning');
    try {
      const data = await diagnoseImage(file);
      setResult(data);
      setPhase('result');
    } catch {
      setError('Impossible de contacter le serveur. Veuillez réessayer.');
      setPhase('preview');
    }
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000', overflow: 'hidden' }}>
      <AnimatePresence mode="wait">

        {/* ── CAMERA PHASE ── */}
        {(phase === 'camera' || phase === 'checking') && (
          <motion.div key="camera" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'absolute', inset: 0 }}>

            <CameraCapture key={cameraKey} ref={camRef} onCapture={handleFile} onError={setCamError} />

            {/* Top gradient + logo */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '48px 24px 80px', background: 'linear-gradient(to bottom, rgba(0,0,0,0.65), transparent)', pointerEvents: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 26 }}>🍎</span>
                <div>
                  <div style={{ color: '#fff', fontWeight: 700, fontSize: 17, lineHeight: 1.2 }}>Apple Doctor</div>
                  <div style={{ color: '#4ade80', fontSize: 11 }}>Détection de Maladies par IA</div>
                </div>
              </div>
            </div>

            {/* Scan frame */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
              <ScanFrame />
            </div>

            {/* Checking overlay */}
            {phase === 'checking' && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  style={{ width: 40, height: 40, border: '3px solid rgba(255,255,255,0.2)', borderTop: '3px solid #4ade80', borderRadius: '50%' }} />
                <div style={{ color: '#fff', fontSize: 15, fontWeight: 600 }}>Vérification de la pomme...</div>
              </div>
            )}

            {/* Camera error */}
            {camError && (
              <div style={{ position: 'absolute', top: '50%', left: 24, right: 24, transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', borderRadius: 16, padding: 20, textAlign: 'center', color: '#fca5a5', fontSize: 13 }}>
                {camError}
              </div>
            )}

            {/* Bottom controls */}
            {phase === 'camera' && (
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px 40px 36px', background: 'linear-gradient(to top, rgba(0,0,0,0.75), transparent)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <motion.button whileTap={{ scale: 0.88 }} onClick={() => fileRef.current.click()}
                  style={{ width: 50, height: 50, borderRadius: 16, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', border: '1.5px solid rgba(255,255,255,0.25)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                  🖼️
                </motion.button>
                <input ref={fileRef} type="file" accept="image/*" hidden onChange={e => e.target.files[0] && handleFile(e.target.files[0])} />

                <motion.button whileTap={{ scale: 0.92 }} onClick={() => camRef.current?.capture()}
                  style={{ width: 76, height: 76, borderRadius: '50%', background: '#fff', border: '4px solid rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 3px rgba(255,255,255,0.2)' }}>
                  <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#fff', border: '2px solid #e2e8f0' }} />
                </motion.button>

                <div style={{ width: 50 }} />
              </div>
            )}

            {/* ── NO APPLE POPUP ── */}
            <AnimatePresence>
              {noApple && (
                <motion.div key="noapple"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                  <motion.div
                    initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    style={{ background: '#fff', borderRadius: 24, padding: 32, textAlign: 'center', width: '100%', maxWidth: 320 }}>
                    <div style={{ fontSize: 52, marginBottom: 12 }}>🍎</div>
                    <div style={{ fontWeight: 700, fontSize: 18, color: '#1f2937', marginBottom: 8 }}>
                      Aucune pomme détectée
                    </div>
                    <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 24, lineHeight: 1.5 }}>
                      Pointez la caméra directement vers une pomme et assurez-vous qu'elle est bien visible.
                    </div>
                    <motion.button whileTap={{ scale: 0.96 }}
                      onClick={() => setNoApple(false)}
                      style={{ width: '100%', padding: '15px', background: 'linear-gradient(135deg, #166534, #22c55e)', color: '#fff', border: 'none', borderRadius: 16, fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 6px 20px rgba(22,163,74,0.35)', marginBottom: 10 }}>
                      📷 Prendre une autre photo
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.96 }}
                      onClick={() => { setNoApple(false); setPhase('preview'); }}
                      style={{ width: '100%', padding: '13px', background: 'transparent', color: '#6b7280', border: '1.5px solid #e5e7eb', borderRadius: 16, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                      Continuer quand même →
                    </motion.button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        )}

        {/* ── PREVIEW PHASE ── */}
        {phase === 'preview' && (
          <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'absolute', inset: 0 }}>
            <img src={preview} alt="captured" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)' }} />

            <motion.div initial={{ y: 120, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(24px)', borderRadius: '28px 28px 0 0', padding: '20px 24px 36px' }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: '#e2e8f0', margin: '0 auto 20px' }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
                <span style={{ fontSize: 18 }}>✅</span>
                <span style={{ color: '#16a34a', fontWeight: 600, fontSize: 14 }}>Pomme détectée — prête pour l'analyse</span>
              </div>
              {error && <div style={{ background: '#fef2f2', color: '#dc2626', borderRadius: 12, padding: '12px 16px', fontSize: 13, marginBottom: 16, textAlign: 'center' }}>{error}</div>}
              <motion.button whileTap={{ scale: 0.97 }} onClick={analyze}
                style={{ width: '100%', padding: '17px', background: 'linear-gradient(135deg, #166534, #22c55e)', color: '#fff', border: 'none', borderRadius: 18, fontSize: 16, fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 24px rgba(22,163,74,0.4)', marginBottom: 12 }}>
                🔬 Analyser avec l'IA
              </motion.button>
              <button onClick={reset} style={{ width: '100%', padding: '14px', background: 'transparent', color: '#64748b', border: 'none', borderRadius: 18, fontSize: 15, fontWeight: 500, cursor: 'pointer' }}>
                ← Reprendre la photo
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
              <div style={{ width: 220, height: 220, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ScanFrame />
                <motion.div animate={{ y: [-80, 80, -80] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ position: 'absolute', width: 200, height: 2, background: 'linear-gradient(to right, transparent, #4ade80, transparent)', boxShadow: '0 0 16px #4ade80, 0 0 40px rgba(74,222,128,0.4)' }} />
              </div>
              <div>
                <div style={{ color: '#fff', fontSize: 18, fontWeight: 600, textAlign: 'center' }}>Analyse en cours...</div>
                <div style={{ color: '#4ade80', fontSize: 13, textAlign: 'center', marginTop: 6 }}>L'IA scanne le tissu de la pomme</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── RESULT PHASE ── */}
        {phase === 'result' && result && (
          <motion.div key="result" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ position: 'absolute', inset: 0, background: '#f8fafc', overflowY: 'auto' }}>
            <div style={{ position: 'relative', height: 260, flexShrink: 0 }}>
              <img src={preview} alt="result" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(248,250,252,1) 100%)' }} />
              <motion.button whileTap={{ scale: 0.9 }} onClick={reset}
                style={{ position: 'absolute', top: 16, left: 16, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', border: 'none', color: '#fff', borderRadius: 12, padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                ← Nouveau scan
              </motion.button>
            </div>
            <div style={{ padding: '0 16px calc(32px + env(safe-area-inset-bottom))', marginTop: -8 }}>
              <DiagnosisReport result={result} imagePreview={preview} />
              <motion.button whileTap={{ scale: 0.97 }} onClick={reset}
                style={{ width: '100%', marginTop: 20, padding: '17px', background: 'linear-gradient(135deg, #166534, #22c55e)', color: '#fff', border: 'none', borderRadius: 18, fontSize: 16, fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 24px rgba(22,163,74,0.3)' }}>
                📷 Scanner une autre pomme
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
