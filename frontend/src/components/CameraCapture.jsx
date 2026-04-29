import { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';

const CameraCapture = forwardRef(function CameraCapture({ onCapture, onError }, ref) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [flash, setFlash] = useState(false);
  const [ready, setReady] = useState(false);

  useImperativeHandle(ref, () => ({ capture }));

  useEffect(() => {
    start();
    return () => stop();
  }, []);

  async function start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        videoRef.current.onloadedmetadata = () => setReady(true);
      }
    } catch (err) {
      onError?.('Caméra inaccessible. Utilisez le bouton d\'importation à la place.');
    }
  }

  function stop() {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  }

  function capture() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    setFlash(true);
    setTimeout(() => setFlash(false), 200);
    canvas.toBlob(blob => {
      onCapture(new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' }));
      stop();
    }, 'image/jpeg', 0.92);
  }

  return (
    <>
      <video ref={videoRef} autoPlay playsInline muted
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      {flash && <div style={{ position: 'absolute', inset: 0, background: '#fff', opacity: 0.7, pointerEvents: 'none', zIndex: 10 }} />}
      {!ready && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
          <div style={{ color: '#4ade80', fontSize: 14 }}>Démarrage de la caméra...</div>
        </div>
      )}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </>
  );
});

export default CameraCapture;