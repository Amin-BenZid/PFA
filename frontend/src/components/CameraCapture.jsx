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

        // Store raw bboxes (in video coordinates) f