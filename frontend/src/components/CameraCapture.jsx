import { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';

const CameraCapture = forwardRef(function CameraCapture({ onCapture, onError, model, onDetectionChange }, ref) {
  const videoRef   = useRef(null);
  const canvasRef  = useRef(null);
  const overlayRef = useRef(null);
  const streamRef  = useRef(null);
  const loopRef    = useRef(null);
  const rawBboxRef = useRef([]);   // raw video-coordinate bboxes for cropping
  const [flash, setFlash] = useState(false);
  const [ready, setReady] = useState(false);

  useImperativeHandle(ref, () => ({ capture, getRawBboxes: () => rawBboxRef.current }));

  useEffect(() => {
    start();
    return () => { stop(); cancelAnimationFrame(loopRef.current); };
  }, []);

  useEffect(() => {
    if (ready && model) startDetection();
    return () => cancelAnimationFrame(loopRef.current);
  }, [ready, model]);

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
    } catch {
      onError?.("Caméra inaccessible. Utilisez le bouton d'importation à la place.");
    }
  }

  function stop() {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  }

  function startDetection() {
    async function detect() {
      const video   = videoRef.current;
      const overlay = overlayRef.current;
      if (!video || !overlay || !model || video.readyState < 2) {
        loopRef.current = requestAnimationFrame(detect);
        return;
      }

      overlay.width  = video.videoWidth  || overlay.clientWidth;
      overlay.height = video.videoHeight || overlay.clientHeight;
      const ctx = overlay.getContext('2d');
      ctx.clearRect(0, 0, overlay.width, overlay.height);

      try {
        const predictions = await model.detect(video, 20, 0.08);
        const apples = predictions.filter(p => p.class === 'apple' && p.score > 0.08);

        // Store raw bboxes (in video coordinates) for cropping
        rawBboxRef.current = apples.map(a => a.bbox);

        apples.forEach(({ bbox, score }) => {
          const [x, y, w, h] = bbox;
          const scaleX = overlay.width  / video.videoWidth;
          const scaleY = overlay.height / video.videoHeight;
          const rx = x * scaleX, ry = y * scaleY, rw = w * scaleX, rh = h * scaleY;

          // Glow box
          ctx.strokeStyle = '#4ade80';
          ctx.lineWidth   = 3;
          ctx.shadowColor = 'rgba(74,222,128,0.7)';
          ctx.shadowBlur  = 14;
          ctx.strokeRect(rx, ry, rw, rh);
          ctx.shadowBlur  = 0;

          // Corner accents
          const cs = 18;
          ctx.strokeStyle = '#22c55e';
          ctx.lineWidth   = 5;
          [
            [rx,      ry,      rx+cs,   ry,      rx,      ry+cs  ],
            [rx+rw,   ry,      rx+rw-cs,ry,      rx+rw,   ry+cs  ],
            [rx,      ry+rh,   rx+cs,   ry+rh,   rx,      ry+rh-cs],
            [rx+rw,   ry+rh,   rx+rw-cs,ry+rh,   rx+rw,   ry+rh-cs],
          ].forEach(([x1,y1,x2,y2,x3,y3]) => {
            ctx.beginPath();
            ctx.moveTo(x1,y1); ctx.lineTo(x2,y2);
            ctx.moveTo(x1,y1); ctx.lineTo(x3,y3);
            ctx.stroke();
          });

          // Label
          const label = `Apple ${Math.round(score * 100)}%`;
          ctx.font = 'bold 13px Arial';
          const tw = ctx.measureText(label).width;
          ctx.fillStyle = 'rgba(22,101,52,0.88)';
          ctx.beginPath();
          ctx.roundRect(rx, ry - 28, tw + 16, 26, 6);
          ctx.fill();
          ctx.fillStyle = '#fff';
          ctx.fillText(label, rx + 8, ry - 10);
        });

        onDetectionChange?.(apples.length, rawBboxRef.current);
      } catch {
        rawBboxRef.current = [];
        onDetectionChange?.(0, []);
      }

      loopRef.current = requestAnimationFrame(detect);
    }
    detect();
  }

  function capture() {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    setFlash(true);
    setTimeout(() => setFlash(false), 200);
    canvas.toBlob(blob => {
      onCapture(
        new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' }),
        rawBboxRef.current   // pass bboxes along with the file
      );
      stop();
      cancelAnimationFrame(loopRef.current);
    }, 'image/jpeg', 0.92);
  }

  return (
    <>
      <video ref={videoRef} autoPlay playsInline muted
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      <canvas ref={overlayRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 2 }} />
      {flash && (
        <div style={{ position: 'absolute', inset: 0, background: '#fff', opacity: 0.7, pointerEvents: 'none', zIndex: 10 }} />
      )}
      {!ready && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', zIndex: 5 }}>
          <div style={{ color: '#4ade80', fontSize: 14 }}>Starting camera...</div>
        </div>
      )}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </>
  );
});

export default CameraCapture;
