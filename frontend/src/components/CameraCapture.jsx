import { useRef, useState, useEffect } from 'react';

export default function CameraCapture({ onCapture }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [active, setActive] = useState(false);
  const [error, setError] = useState(null);
  const [flash, setFlash] = useState(false);

  async function startCamera() {
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      streamRef.current = stream;
      setActive(true);
    } catch (err) {
      console.error(err);
      setError(
        'Camera not accessible. Please allow camera permission or use file upload instead.'
      );
    }
  }

  useEffect(() => {
    if (active && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play();
    }
  }, [active]);

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setActive(false);
  }

  function capture() {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    canvas.getContext('2d').drawImage(video, 0, 0);

    setFlash(true);
    setTimeout(() => setFlash(false), 250);

    canvas.toBlob(
      (blob) => {
        const file = new File([blob], `capture-${Date.now()}.jpg`, {
          type: 'image/jpeg',
        });

        onCapture(file);
        stopCamera();
      },
      'image/jpeg',
      0.92
    );
  }

  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <div style={{ width: '100%' }}>
      {!active ? (
        <button
          onClick={startCamera}
          style={styles.openButton}
        >
          📷 Open Camera
        </button>
      ) : (
        <div style={styles.cameraWrapper}>
          {flash && <div style={styles.flashOverlay} />}

          <div style={styles.videoContainer}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={styles.video}
            />

            {['tl', 'tr', 'bl', 'br'].map((corner) => (
              <div
                key={corner}
                style={{
                  ...styles.corner,
                  ...(corner === 'tl' && { top: 12, left: 12, borderTop: '3px solid #86efac', borderLeft: '3px solid #86efac' }),
                  ...(corner === 'tr' && { top: 12, right: 12, borderTop: '3px solid #86efac', borderRight: '3px solid #86efac' }),
                  ...(corner === 'bl' && { bottom: 12, left: 12, borderBottom: '3px solid #86efac', borderLeft: '3px solid #86efac' }),
                  ...(corner === 'br' && { bottom: 12, right: 12, borderBottom: '3px solid #86efac', borderRight: '3px solid #86efac' }),
                }}
              />
            ))}
          </div>

          <div style={styles.buttonRow}>
            <button onClick={capture} style={styles.captureButton}>
              📸 Take Photo
            </button>

            <button onClick={stopCamera} style={styles.cancelButton}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {error && <p style={styles.error}>{error}</p>}

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}

const styles = {
  openButton: {
    width: '100%',
    padding: '14px',
    border: 'none',
    borderRadius: 12,
    background: 'linear-gradient(135deg, #166534, #16a34a)',
    color: '#fff',
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
  },

  cameraWrapper: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },

  videoContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: '4 / 3',
    borderRadius: 16,
    overflow: 'hidden',
    background: '#000',
  },

  video: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },

  flashOverlay: {
    position: 'absolute',
    inset: 0,
    background: '#fff',
    opacity: 0.8,
    zIndex: 20,
    pointerEvents: 'none',
  },

  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    zIndex: 10,
  },

  buttonRow: {
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap',
  },

  captureButton: {
    flex: 1,
    minWidth: 160,
    padding: '14px',
    border: 'none',
    borderRadius: 12,
    background: 'linear-gradient(135deg, #166534, #16a34a)',
    color: '#fff',
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
  },

  cancelButton: {
    flex: 1,
    minWidth: 120,
    padding: '14px',
    border: 'none',
    borderRadius: 12,
    background: '#374151',
    color: '#fff',
    fontSize: 14,
    cursor: 'pointer',
  },

  error: {
    marginTop: 10,
    color: '#ef4444',
    fontSize: 13,
    textAlign: 'center',
  },
};