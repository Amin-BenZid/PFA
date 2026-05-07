import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { diagnoseImage } from '../services/api';
import CameraCapture from '../components/CameraCapture';
import DiagnosisReport from '../components/DiagnosisReport';

export default function DiagnosePage() {
  const [phase, setPhase]             = useState('camera');
  const [file, setFile]               = useState(null);
  const [preview, setPreview]         = useState(null);
  const [result, setResult]           = useState(null);
  const [error, setError]             = useState(null);
  const [camError, setCamError]       = useState(null);
  const [noApple, setNoApple]         = useState(false);
  const [cameraKey, setCameraKey]     = useState(0);
  const [appleCount, setAppleCount]   = useState(0);
  const [multiFiles, setMultiFiles]       = useState([]);
  const [multiPreviews, setMultiPreviews] = useState([]);
  const [multiResults, setMultiResults]   = useState([]);
  const [multiError, setMultiError]       = useState(null);
  const camRef   = useRef(null);
  const modelRef = useRef(null);
  const bboxesRef = useRef([]);

  useEffect(() => {
    if (window.cocoSsd) window.cocoSsd.load().then(m => { modelRef.current = m; }).catch(()=>{});
  }, []);

  function handleDetection(count, bboxes) {
    setAppleCount(count);
    bboxesRef.current = bboxes || [];
  }

  async function cropApples(blob, bboxes) {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.src = url;
    await new Promise(r => { img.onload = r; });
    const crops = await Promise.all(bboxes.map((bbox, i) => {
      const [x, y, w, h] = bbox;
      const pad = Math.min(30, w * 0.15, h * 0.15);
      const sx = Math.max(0, x - pad), sy = Math.max(0, y - pad);
      const sw = Math.min(img.width - sx, w + pad * 2), sh = Math.min(img.height - sy, h + pad * 2);
      const c = document.createElement('canvas');
      c.width = sw; c.height = sh;
      c.getContext('2d').drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
      return new Promise(resolve => c.toBlob(b => resolve({
        file: new File([b], `pomme-${i+1}-${Date.now()}.jpg`, { type: 'image/jpeg' }),
        previewUrl: URL.createObjectURL(b),
      }), 'image/jpeg', 0.92));
    }));
    URL.revokeObjectURL(url);
    return crops;
  }

  async function handleFile(f, capturedBboxes) {
    setFile(f); setError(null); setNoApple(false);
    const bboxes = capturedBboxes || bboxesRef.current;
    if (bboxes.length > 1) {
      setPreview(URL.createObjectURL(f));
      setPhase('multi-preview');
      const crops = await cropApples(f, bboxes);
      setMultiFiles(crops.map(c => c.file));
      setMultiPreviews(crops.map(c => c.previewUrl));
      return;
    }
    const url = URL.createObjectURL(f);
    setPreview(url);
    if (appleCount > 0 || bboxes.length === 1) { setPhase('preview'); return; }
    setPhase('checking');
    try {
      if (modelRef.current) {
        const img = new Image(); img.src = url;
        await new Promise(r => { img.onload = r; });
        const preds = await modelRef.current.detect(img, 20, 0.08);
        if (!preds.some(p => p.class === 'apple' && p.score > 0.08)) {
          setNoApple(true); setCameraKey(k => k+1); setAppleCount(0); setPhase('camera'); return;
        }
      }
    } catch {}
    setPhase('preview');
  }

  async function analyzeMulti() {
    setPhase('multi-scanning'); setMultiError(null);
    try {
      const results = await Promise.all(multiFiles.map(f => diagnoseImage(f)));
      setMultiResults(results); setPhase('multi-result');
    } catch {
      setMultiError('Impossible de contacter le serveur. Veuillez réessayer.'); setPhase('multi-preview');
    }
  }

  function reset() {
    setFile(null); setPreview(null); setResult(null); setError(null); setCamError(null);
    setNoApple(false); setAppleCount(0); bboxesRef.current = [];
    setMultiFiles([]); setMultiPreviews([]); setMultiResults([]); setMultiError(null);
    setCameraKey(k => k+1); setPhase('camera');
  }

  async function analyze() {
    setPhase('scanning');
    try { const data = await diagnoseImage(file); setResult(data); setPhase('result'); }
    catch { setError('Impossible de contacter le serveur. Veuillez réessayer.'); setPhase('preview'); }
  }

  return (
    <div style={{position:'absolute',inset:0,background:'#000',overflow:'hidden'}}>
      <AnimatePresence mode="wait">

        {/* CAMÉRA */}
        {(phase==='camera'||phase==='checking') && (
          <motion.div key="camera" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={{position:'absolute',inset:0}}>
            <CameraCapture key={cameraKey} ref={camRef} onCapture={handleFile} onError={setCamError} model={modelRef.current} onDetectionChange={handleDetection}/>
            <div style={{position:'absolute',top:0,left:0,right:0,padding:'48px 20px 60px',background:'linear-gradient(to bottom,rgba(0,0,0,0.7),transparent)',pointerEvents:'none',zIndex:3}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div>
                  <div style={{color:'#fff',fontWeight:700,fontSize:18}}>Apple Doctor</div>
                  <div style={{color:'#4ade80',fontSize:11,marginTop:2}}>Détection de Maladies par IA</div>
                </div>
                {appleCount>0 && (
                  <motion.div initial={{scale:0}} animate={{scale:1}} style={{background:'rgba(22,101,52,0.9)',border:'1.5px solid #4ade80',borderRadius:20,padding:'6px 14px',display:'flex',alignItems:'center',gap:6}}>
                    <div style={{width:7,height:7,borderRadius:'50%',background:'#4ade80',boxShadow:'0 0 6px #4ade80'}}/>
                    <span style={{color:'#fff',fontSize:12,fontWeight:700}}>{appleCount} pomme{appleCount>1?'s':''} détectée{appleCount>1?'s':''}</span>
                  </motion.div>
                )}
              </div>
            </div>
            {phase==='checking' && (
              <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.65)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:16,zIndex:6}}>
                <motion.div animate={{rotate:360}} transition={{duration:1,repeat:Infinity,ease:'linear'}} style={{width:40,height:40,border:'3px solid rgba(255,255,255,0.2)',borderTop:'3px solid #4ade80',borderRadius:'50%'}}/>
                <div style={{color:'#fff',fontSize:15,fontWeight:600}}>Vérification en cours...</div>
              </div>
            )}
            {camError && <div style={{position:'absolute',top:'50%',left:24,right:24,transform:'translateY(-50%)',background:'rgba(0,0,0,0.8)',borderRadius:16,padding:20,textAlign:'center',color:'#fca5a5',fontSize:13,zIndex:6}}>{camError}</div>}
            {phase==='camera' && (
              <div style={{position:'absolute',bottom:0,left:0,right:0,padding:'16px 40px 40px',background:'linear-gradient(to top,rgba(0,0,0,0.8),transparent)',display:'flex',flexDirection:'column',alignItems:'center',gap:10,zIndex:3}}>
                <div style={{color:appleCount>0?'#4ade80':'rgba(255,255,255,0.5)',fontSize:12,fontWeight:600}}>
                  {appleCount===0?'Pointez vers une pomme...'
                    :appleCount>1?`${appleCount} pommes — analyse individuelle`
                    :'Prêt à capturer'}
                </div>
                <motion.button whileTap={{scale:0.92}} onClick={()=>camRef.current?.capture()}
                  style={{width:76,height:76,borderRadius:'50%',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',
                    background:appleCount>0?'linear-gradient(135deg,#166534,#22c55e)':'#fff',
                    boxShadow:appleCount>0?'0 0 24px rgba(74,222,128,0.6)':'0 0 0 3px rgba(255,255,255,0.3)',transition:'all 0.3s'}}>
                  <div style={{width:52,height:52,borderRadius:'50%',background:appleCount>0?'rgba(255,255,255,0.15)':'#f1f5f9',border:'2px solid rgba(255,255,255,0.3)'}}/>
                </motion.button>
              </div>
            )}
            <AnimatePresence>
              {noApple && (
                <motion.div key="noapple" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.75)',display:'flex',alignItems:'center',justifyContent:'center',padding:24,zIndex:10}}>
                  <motion.div initial={{scale:0.85}} animate={{scale:1}} exit={{scale:0.85}} transition={{type:'spring',stiffness:300,damping:25}} style={{background:'#fff',borderRadius:24,padding:32,textAlign:'center',width:'100%',maxWidth:320}}>
                    <div style={{width:56,height:56,borderRadius:'50%',background:'#fef2f2',border:'2px solid #fca5a5',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px',fontSize:24,color:'#dc2626',fontWeight:700}}>!</div>
                    <div style={{fontWeight:700,fontSize:17,color:'#1f2937',marginBottom:8}}>Aucune pomme détectée</div>
                    <div style={{fontSize:13,color:'#6b7280',marginBottom:24,lineHeight:1.6}}>Attendez que la caméra encadre une pomme avant de capturer.</div>
                    <button onClick={()=>setNoApple(false)} style={{width:'100%',padding:15,background:'#166534',color:'#fff',border:'none',borderRadius:14,fontSize:15,fontWeight:700,cursor:'pointer',marginBottom:10}}>Réessayer</button>
                    <button onClick={()=>{setNoApple(false);setPhase('preview');}} style={{width:'100%',padding:13,background:'transparent',color:'#6b7280',border:'1.5px solid #e5e7eb',borderRadius:14,fontSize:14,cursor:'pointer'}}>Continuer quand même</button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* APERÇU SIMPLE */}
        {phase==='preview' && (
          <motion.div key="preview" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={{position:'absolute',inset:0}}>
            <img src={preview} alt="captured" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
            <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(0,0,0,0.6) 0%,transparent 50%)'}}/>
            <motion.div initial={{y:120,opacity:0}} animate={{y:0,opacity:1}} style={{position:'absolute',bottom:0,left:0,right:0,background:'rgba(255,255,255,0.97)',backdropFilter:'blur(20px)',borderRadius:'28px 28px 0 0',padding:'20px 24px 36px'}}>
              <div style={{width:36,height:4,borderRadius:2,background:'#e2e8f0',margin:'0 auto 20px'}}/>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16}}>
                <div style={{width:8,height:8,borderRadius:'50%',background:'#16a34a'}}/>
                <span style={{color:'#16a34a',fontWeight:600,fontSize:14}}>Pomme détectée — prête pour l'analyse</span>
              </div>
              {error && <div style={{background:'#fef2f2',color:'#dc2626',borderRadius:10,padding:'12px 16px',fontSize:13,marginBottom:14}}>{error}</div>}
              <button onClick={analyze} style={{width:'100%',padding:17,background:'linear-gradient(135deg,#166534,#22c55e)',color:'#fff',border:'none',borderRadius:18,fontSize:16,fontWeight:700,cursor:'pointer',marginBottom:12}}>Analyser avec l'IA</button>
              <button onClick={reset} style={{width:'100%',padding:14,background:'transparent',color:'#64748b',border:'none',borderRadius:18,fontSize:15,cursor:'pointer'}}>Reprendre la photo</button>
            </motion.div>
          </motion.div>
        )}

        {/* APERÇU MULTI */}
        {phase==='multi-preview' && (
          <motion.div key="multi-preview" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={{position:'absolute',inset:0,background:'#0f172a',display:'flex',flexDirection:'column'}}>
            <div style={{position:'relative',flex:1,overflow:'hidden'}}>
              <img src={preview} alt="captured" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
              <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,rgba(0,0,0,0.3),rgba(15,23,42,0.95))'}}/>
              <div style={{position:'absolute',top:48,left:20}}>
                <div style={{color:'#fff',fontWeight:700,fontSize:17}}>Apple Doctor</div>
              </div>
              <div style={{position:'absolute',bottom:0,left:0,right:0,padding:'0 20px 20px'}}>
                <div style={{color:'#4ade80',fontWeight:700,fontSize:16,marginBottom:4}}>{multiPreviews.length} pommes détectées</div>
                <div style={{color:'rgba(255,255,255,0.6)',fontSize:13}}>Chaque pomme sera analysée séparément</div>
              </div>
            </div>
            <div style={{padding:'16px 20px',background:'#0f172a'}}>
              <div style={{display:'flex',gap:10,overflowX:'auto',paddingBottom:4}}>
                {multiPreviews.map((url,i) => (
                  <div key={i} style={{flexShrink:0,position:'relative'}}>
                    <img src={url} alt={`pomme ${i+1}`} style={{width:64,height:64,objectFit:'cover',borderRadius:12,border:'2px solid #4ade80'}}/>
                    <div style={{position:'absolute',top:-6,right:-6,width:20,height:20,borderRadius:'50%',background:'#4ade80',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:'#000'}}>{i+1}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{padding:'0 20px 40px',background:'#0f172a'}}>
              {multiError && <div style={{background:'#450a0a',color:'#fca5a5',borderRadius:10,padding:'10px 14px',fontSize:13,marginBottom:12}}>{multiError}</div>}
              <button onClick={analyzeMulti} style={{width:'100%',padding:17,background:'linear-gradient(135deg,#166534,#22c55e)',color:'#fff',border:'none',borderRadius:18,fontSize:16,fontWeight:700,cursor:'pointer',marginBottom:12}}>Analyser les {multiPreviews.length} pommes</button>
              <button onClick={reset} style={{width:'100%',padding:14,background:'transparent',color:'#64748b',border:'none',borderRadius:18,fontSize:15,cursor:'pointer'}}>Reprendre la photo</button>
            </div>
          </motion.div>
        )}

        {/* ANALYSE MULTI */}
        {phase==='multi-scanning' && (
          <motion.div key="multi-scanning" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={{position:'absolute',inset:0,background:'#0f172a',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:32}}>
            <div style={{display:'flex',gap:12}}>
              {multiPreviews.map((url,i) => (
                <motion.div key={i} animate={{opacity:[0.4,1,0.4],scale:[0.95,1,0.95]}} transition={{duration:1.5,repeat:Infinity,delay:i*0.3}} style={{position:'relative'}}>
                  <img src={url} style={{width:64,height:64,objectFit:'cover',borderRadius:12,border:'2px solid #4ade80'}}/>
                  <motion.div animate={{rotate:360}} transition={{duration:1,repeat:Infinity,ease:'linear'}} style={{position:'absolute',inset:-4,borderRadius:16,border:'2px solid transparent',borderTop:'2px solid #4ade80'}}/>
                </motion.div>
              ))}
            </div>
            <div style={{textAlign:'center'}}>
              <div style={{color:'#fff',fontSize:18,fontWeight:600}}>Analyse de {multiPreviews.length} pommes en cours...</div>
              <div style={{color:'#4ade80',fontSize:13,marginTop:6}}>IA lancée en parallèle</div>
            </div>
          </motion.div>
        )}

        {/* RÉSULTAT MULTI */}
        {phase==='multi-result' && multiResults.length>0 && (
          <motion.div key="multi-result" initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} exit={{opacity:0}} style={{position:'absolute',inset:0,background:'#f8fafc',overflowY:'auto'}}>
            <div style={{padding:'48px 20px 20px',background:'linear-gradient(135deg,#166534,#16a34a)'}}>
              <div style={{color:'#fff',fontWeight:800,fontSize:20}}>Analyse Terminée</div>
              <div style={{color:'#86efac',fontSize:13,marginTop:2}}>{multiResults.length} pommes analysées</div>
            </div>
            <div style={{padding:'16px 16px 32px',display:'flex',flexDirection:'column',gap:16}}>
              {multiResults.map((res,i) => (
                <motion.div key={i} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:i*0.1}} style={{background:'#fff',borderRadius:20,overflow:'hidden',boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
                  <div style={{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',borderBottom:'1px solid #f1f5f9'}}>
                    <img src={multiPreviews[i]} alt={`pomme ${i+1}`} style={{width:52,height:52,objectFit:'cover',borderRadius:10,border:'2px solid #e2e8f0'}}/>
                    <div>
                      <div style={{fontWeight:700,fontSize:15,color:'#1e293b'}}>Pomme {i+1}</div>
                      <div style={{fontSize:12,color:'#64748b',marginTop:2}}>ID: {res?.request_id?.slice(0,8)}...</div>
                    </div>
                  </div>
                  <div style={{padding:'0 16px 16px'}}>
                    <DiagnosisReport result={res} imagePreview={multiPreviews[i]} compact/>
                  </div>
                </motion.div>
              ))}
              <button onClick={reset} style={{width:'100%',padding:17,background:'linear-gradient(135deg,#166534,#22c55e)',color:'#fff',border:'none',borderRadius:18,fontSize:16,fontWeight:700,cursor:'pointer',marginTop:8}}>Scanner d'autres pommes</button>
            </div>
          </motion.div>
        )}

        {/* ANALYSE SIMPLE */}
        {phase==='scanning' && (
          <motion.div key="scanning" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={{position:'absolute',inset:0}}>
            <img src={preview} alt="scanning" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
            <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.55)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:24}}>
              <div style={{width:120,height:120,position:'relative',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <motion.div animate={{rotate:360}} transition={{duration:2,repeat:Infinity,ease:'linear'}} style={{position:'absolute',inset:0,border:'3px solid rgba(74,222,128,0.3)',borderTop:'3px solid #4ade80',borderRadius:'50%'}}/>
                <motion.div animate={{rotate:-360}} transition={{duration:3,repeat:Infinity,ease:'linear'}} style={{position:'absolute',inset:12,border:'2px solid rgba(74,222,128,0.15)',borderBottom:'2px solid #4ade80',borderRadius:'50%'}}/>
                <motion.div animate={{y:[-30,30,-30]}} transition={{duration:2,repeat:Infinity,ease:'easeInOut'}} style={{width:80,height:2,background:'linear-gradient(to right,transparent,#4ade80,transparent)',boxShadow:'0 0 16px #4ade80'}}/>
              </div>
              <div style={{textAlign:'center'}}>
                <div style={{color:'#fff',fontSize:18,fontWeight:600}}>Analyse en cours...</div>
                <div style={{color:'#4ade80',fontSize:13,marginTop:6}}>L'IA scanne le tissu de la pomme</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* RÉSULTAT SIMPLE */}
        {phase==='result' && result && (
          <motion.div key="result" initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} exit={{opacity:0}} style={{position:'absolute',inset:0,background:'#f8fafc',overflowY:'auto'}}>
            <div style={{position:'relative',height:260,flexShrink:0}}>
              <img src={preview} alt="result" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
              <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,rgba(0,0,0,0.2) 0%,rgba(248,250,252,1) 100%)'}}/>
              <button onClick={reset} style={{position:'absolute',top:16,left:16,background:'rgba(0,0,0,0.45)',backdropFilter:'blur(8px)',border:'none',color:'#fff',borderRadius:12,padding:'8px 14px',fontSize:13,fontWeight:600,cursor:'pointer'}}>Nouveau scan</button>
            </div>
            <div style={{padding:'0 16px calc(32px + env(safe-area-inset-bottom))',marginTop:-8}}>
              <DiagnosisReport result={result} imagePreview={preview}/>
              <button onClick={reset} style={{width:'100%',marginTop:20,padding:17,background:'linear-gradient(135deg,#166534,#22c55e)',color:'#fff',border:'none',borderRadius:18,fontSize:16,fontWeight:700,cursor:'pointer'}}>Scanner une autre pomme</button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
