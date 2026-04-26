import { useState } from 'react';
import { diagnoseImage } from '../services/api';
import CameraCapture from '../components/CameraCapture';
import DiagnosisReport from '../components/DiagnosisReport';

export default function DiagnosePage() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState('upload'); 

  function handleFile(f) {
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
    setError(null);
  }

  function onDrop(e) {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }

  function reset() {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
  }

  async function analyze() {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const data = await diagnoseImage(file);
      setResult(data);
    } catch {
      setError('Connection failed. Please ensure the backend is active on port 3000.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'radial-gradient(circle at top right, #f0fdf4, #ffffff)', 
      padding: '40px 20px',
      fontFamily: '"Inter", sans-serif' 
    }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>

        {/* --- Header Section --- */}
        {!result && !loading && (
          <header style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ 
              display: 'inline-flex', 
              padding: 16, 
              background: '#fff', 
              borderRadius: 24, 
              boxShadow: '0 10px 25px -5px rgba(22, 101, 52, 0.1)',
              marginBottom: 20
            }}>
              <span style={{ fontSize: 48 }}>🍎</span>
            </div>
            <h1 style={{ margin: 0, color: '#064e3b', fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em' }}>
              Apple Guard AI
            </h1>
            <p style={{ color: '#4b5563', marginTop: 10, fontSize: 16, lineHeight: 1.6 }}>
              Instant neural-link diagnosis for your orchard. <br/>
              Upload a clear photo of the leaf or fruit.
            </p>
          </header>
        )}

        {/* --- Main Action Card --- */}
        {!result && !loading && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(12px)',
            borderRadius: 32,
            border: '1px solid #fff',
            boxShadow: '0 20px 50px rgba(0,0,0,0.05)',
            padding: 32,
          }}>
            
            {/* Custom Segmented Control */}
            <div style={{
              display: 'flex',
              background: '#e5e7eb',
              borderRadius: 16,
              padding: 4,
              marginBottom: 32,
            }}>
              {[
                { id: 'upload', icon: '📁', label: 'Upload' },
                { id: 'camera', icon: '📷', label: 'Camera' }
              ].map((tab) => (
                <button 
                  key={tab.id} 
                  onClick={() => { setMode(tab.id); reset(); }}
                  style={{
                    flex: 1, padding: '12px', border: 'none', borderRadius: 12,
                    fontWeight: 600, fontSize: 14, cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    background: mode === tab.id ? '#fff' : 'transparent',
                    color: mode === tab.id ? '#065f46' : '#6b7280',
                    boxShadow: mode === tab.id ? '0 4px 12px rgba(0,0,0,0.08)' : 'none',
                  }}
                >
                  <span style={{ marginRight: 8 }}>{tab.icon}</span>{tab.label}
                </button>
              ))}
            </div>

            {/* Area: Upload */}
            {mode === 'upload' && (
              <div
                onDrop={onDrop}
                onDragOver={e => e.preventDefault()}
                onClick={() => !preview && document.getElementById('fileInput').click()}
                style={{
                  border: `2px dashed ${preview ? '#059669' : '#d1d5db'}`,
                  borderRadius: 24,
                  padding: preview ? '16px' : '60px 20px',
                  textAlign: 'center',
                  cursor: preview ? 'default' : 'pointer',
                  background: preview ? '#fff' : 'rgba(249, 250, 251, 0.5)',
                  transition: 'all 0.2s ease',
                  marginBottom: 24,
                  position: 'relative'
                }}
              >
                {preview ? (
                  <div style={{ position: 'relative' }}>
                    <img src={preview} alt="preview" style={{ 
                      maxHeight: 300, width: '100%', objectFit: 'cover', borderRadius: 16 
                    }} />
                    <button onClick={(e) => { e.stopPropagation(); reset(); }} style={closeBtnStyle}>✕</button>
                  </div>
                ) : (
                  <>
                    <div style={{ fontSize: 44, marginBottom: 16, opacity: 0.8 }}>🖼️</div>
                    <p style={{ color: '#374151', fontWeight: 600, fontSize: 16, marginBottom: 4 }}>
                      Drop your image here
                    </p>
                    <p style={{ color: '#9ca3af', fontSize: 14 }}>
                      or click to <span style={{ color: '#10b981' }}>browse files</span>
                    </p>
                  </>
                )}
                <input id="fileInput" type="file" accept="image/*" hidden
                  onChange={e => e.target.files[0] && handleFile(e.target.files[0])} />
              </div>
            )}

            {/* Area: Camera */}
            {mode === 'camera' && (
              <div style={{ marginBottom: 24 }}>
                {!preview ? (
                  <div style={{ borderRadius: 24, overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                    <CameraCapture onCapture={handleFile} />
                  </div>
                ) : (
                  <div style={{ position: 'relative', textAlign: 'center' }}>
                    <img src={preview} alt="captured" style={{ maxHeight: 300, borderRadius: 24, width: '100%', objectFit: 'cover' }} />
                    <button onClick={reset} style={closeBtnStyle}>✕</button>
                    <p style={{ marginTop: 12, color: '#6b7280', fontSize: 13, fontWeight: 500 }}>Ready for analysis</p>
                  </div>
                )}
              </div>
            )}

            {/* Primary Action Button */}
            {file && (
              <button onClick={analyze} disabled={loading} style={{
                width: '100%', padding: '18px',
                background: '#065f46',
                color: '#fff', border: 'none', borderRadius: 18,
                fontSize: 16, fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 10px 20px -5px rgba(6, 95, 70, 0.4)',
                transition: 'transform 0.2s, background 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                Start AI Inspection
              </button>
            )}

            {error && <div style={errorStyle}>{error}</div>}
          </div>
        )}

        {/* --- Loading State --- */}
        {loading && (
          <div style={{
            background: '#fff', borderRadius: 32, padding: '80px 40px', textAlign: 'center',
            boxShadow: '0 20px 50px rgba(0,0,0,0.05)',
          }}>
            <div className="modern-spinner"></div>
            <h2 style={{ color: '#064e3b', marginBottom: 8, fontSize: 22 }}>Scanning Tissues...</h2>
            <p style={{ color: '#6b7280' }}>Our AI is identifying patterns and anomalies.</p>
          </div>
        )}

        {/* --- Result View --- */}
        {result && !loading && (
          <div className="fade-in">
            <DiagnosisReport result={result} imagePreview={preview} />
            <button onClick={reset} style={{
              width: '100%', marginTop: 24, padding: '16px',
              background: 'transparent', color: '#065f46',
              border: '2px solid #065f46', borderRadius: 18,
              fontSize: 16, fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.2s'
            }}>
              Scan Another Specimen
            </button>
          </div>
        )}

      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
        
        .modern-spinner {
          width: 60px;
          height: 60px;
          border: 5px solid #f3f4f6;
          border-top: 5px solid #10b981;
          border-radius: 50%;
          margin: 0 auto 24px;
          animation: spin 1s cubic-bezier(0.5, 0, 0.5, 1) infinite;
        }

        .fade-in { animation: fadeIn 0.5s ease-out; }

        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

const closeBtnStyle = {
  position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.5)',
  backdropFilter: 'blur(4px)', color: '#fff', border: 'none', borderRadius: '50%',
  width: 32, height: 32, cursor: 'pointer', fontSize: 14, fontWeight: 'bold'
};

const errorStyle = {
  marginTop: 20, background: '#fef2f2', color: '#b91c1c',
  borderRadius: 12, padding: '16px', fontSize: 14, fontWeight: 500,
  border: '1px solid #fee2e2'
};