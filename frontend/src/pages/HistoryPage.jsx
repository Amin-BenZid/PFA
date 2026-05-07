import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getHistory } from '../services/api';
import { getTreatmentByClass, URGENCY_COLORS } from '../services/treatments';

const DIAGNOSIS_META = {
  healthy:  { label: 'Saine',   color: '#16a34a', bg: '#f0fdf4', dot: '#16a34a' },
  diseased: { label: 'Malade',  color: '#b45309', bg: '#fffbeb', dot: '#d97706' },
  rotten:   { label: 'Pourrie', color: '#b91c1c', bg: '#fff1f2', dot: '#dc2626' },
  mixed:    { label: 'Mixte',   color: '#7c3aed', bg: '#f5f3ff', dot: '#8b5cf6' },
};
const SEVERITY_META = {
  none:     { label: 'Aucune',   color: '#16a34a' },
  mild:     { label: 'Légère',   color: '#65a30d' },
  moderate: { label: 'Modérée',  color: '#d97706' },
  severe:   { label: 'Sévère',   color: '#dc2626' },
};
function confidenceColor(c) { return c >= 0.85 ? '#16a34a' : c >= 0.65 ? '#d97706' : '#dc2626'; }
function formatDate(s) {
  const d = new Date(s);
  return { date: d.toLocaleDateString('fr-FR',{day:'2-digit',month:'short',year:'numeric'}), time: d.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}) };
}

function DetailModal({ item, onClose }) {
  const diag = DIAGNOSIS_META[item.overall_diagnosis] || DIAGNOSIS_META.healthy;
  const sev  = SEVERITY_META[item.severity] || SEVERITY_META.none;
  const diseases = (item.detections||[]).filter(d => d.class!=='Fresh' && d.class!=='healthy');
  const { date, time } = formatDate(item.createdAt);
  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={onClose}
      style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:100,display:'flex',flexDirection:'column',justifyContent:'flex-end'}}>
      <motion.div initial={{y:'100%'}} animate={{y:0}} exit={{y:'100%'}} transition={{type:'spring',stiffness:300,damping:35}}
        onClick={e=>e.stopPropagation()} style={{background:'#fff',borderRadius:'28px 28px 0 0',maxHeight:'92vh',overflowY:'auto'}}>
        <div style={{width:36,height:4,borderRadius:2,background:'#e2e8f0',margin:'14px auto 0'}}/>
        {item.image_url?.startsWith('https://') && (
          <div style={{margin:'16px 16px 0',borderRadius:18,overflow:'hidden',height:220}}>
            <img src={item.image_url} alt="pomme" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
          </div>
        )}
        <div style={{padding:'20px 20px 40px'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:4}}>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <div style={{width:10,height:10,borderRadius:'50%',background:diag.dot}}/>
              <span style={{fontWeight:800,fontSize:20,color:'#1e293b'}}>{diag.label}</span>
            </div>
            <span style={{background:diag.bg,color:diag.color,padding:'4px 12px',borderRadius:20,fontSize:12,fontWeight:700}}>Sévérité {sev.label}</span>
          </div>
          <div style={{color:'#94a3b8',fontSize:12,marginBottom:24}}>{date} à {time}</div>
          {item.detections?.length > 0 && (
            <div style={{marginBottom:24}}>
              <div style={{fontSize:11,fontWeight:700,color:'#94a3b8',letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:10}}>Conditions détectées</div>
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {item.detections.map((d,i) => (
                  <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 14px',background:'#f8fafc',borderRadius:12,border:'1px solid #f1f5f9'}}>
                    <div>
                      <div style={{fontWeight:600,fontSize:14,color:'#1e293b'}}>{d.class_fr||d.class}</div>
                      {d.class_fr && <div style={{fontSize:11,color:'#94a3b8',marginTop:1}}>{d.class}</div>}
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <div style={{width:60,height:4,borderRadius:2,background:'#e2e8f0',overflow:'hidden'}}>
                        <div style={{height:'100%',width:`${d.confidence*100}%`,background:confidenceColor(d.confidence),borderRadius:2}}/>
                      </div>
                      <span style={{fontSize:13,fontWeight:700,color:confidenceColor(d.confidence),minWidth:36,textAlign:'right'}}>{(d.confidence*100).toFixed(0)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {diseases.length > 0 && (
            <div style={{marginBottom:24}}>
              <div style={{fontSize:11,fontWeight:700,color:'#94a3b8',letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:10}}>Plan de traitement</div>
              <div style={{display:'flex',flexDirection:'column',gap:12}}>
                {diseases.map((d,i) => {
                  const t = getTreatmentByClass(d.class); if (!t) return null;
                  const urg = URGENCY_COLORS[t.urgency];
                  return (
                    <div key={i} style={{background:'#f8fafc',borderRadius:14,border:'1px solid #f1f5f9',overflow:'hidden'}}>
                      <div style={{padding:'12px 14px',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'1px solid #f1f5f9'}}>
                        <span style={{fontWeight:700,fontSize:14,color:'#1e293b'}}>{d.class_fr||d.class}</span>
                        {urg && <span style={{background:urg.bg,color:urg.text,fontSize:10,fontWeight:700,padding:'3px 10px',borderRadius:20}}>{urg.label}</span>}
                      </div>
                      <div style={{padding:'10px 14px 4px'}}>
                        {t.steps.map((step,j) => (
                          <div key={j} style={{display:'flex',gap:10,marginBottom:10}}>
                            <div style={{width:20,height:20,borderRadius:'50%',background:'#e2e8f0',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:'#64748b',flexShrink:0,marginTop:1}}>{j+1}</div>
                            <div style={{color:'#374151',fontSize:13,lineHeight:1.5}}>{step}</div>
                          </div>
                        ))}
                      </div>
                      {t.prevention && (
                        <div style={{margin:'0 14px 14px',background:'#f0fdf4',borderRadius:10,padding:'10px 12px',borderLeft:'3px solid #16a34a'}}>
                          <div style={{fontSize:11,fontWeight:700,color:'#166534',marginBottom:3}}>Prévention</div>
                          <div style={{fontSize:12,color:'#374151',lineHeight:1.5}}>{t.prevention}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <div style={{display:'flex',gap:8,flexWrap:'wrap',paddingTop:16,borderTop:'1px solid #f1f5f9'}}>
            {[['ID Requête',item.request_id?.slice(0,12)+'...'],['Modèle',item.model_version],['Inférence',item.inference_time_ms?`${item.inference_time_ms}ms`:null]].filter(([,v])=>v).map(([k,v])=>(
              <div key={k} style={{background:'#f8fafc',borderRadius:8,padding:'6px 10px',border:'1px solid #f1f5f9'}}>
                <div style={{fontSize:10,color:'#94a3b8',fontWeight:600}}>{k}</div>
                <div style={{fontSize:12,color:'#374151',fontWeight:600,marginTop:1}}>{v}</div>
              </div>
            ))}
          </div>
          <button onClick={onClose} style={{width:'100%',marginTop:20,padding:14,background:'#f1f5f9',color:'#374151',border:'none',borderRadius:14,fontSize:15,fontWeight:600,cursor:'pointer'}}>Fermer</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function HistoryCard({ item, onClick }) {
  const diag = DIAGNOSIS_META[item.overall_diagnosis] || DIAGNOSIS_META.healthy;
  const sev  = SEVERITY_META[item.severity] || SEVERITY_META.none;
  const { date, time } = formatDate(item.createdAt);
  const top = (item.detections||[]).find(d => d.class!=='Fresh' && d.class!=='healthy');
  const topConf = top ? top.confidence : null;
  return (
    <motion.button whileTap={{scale:0.98}} onClick={onClick}
      style={{width:'100%',background:'#fff',borderRadius:16,border:'1px solid #f1f5f9',overflow:'hidden',cursor:'pointer',textAlign:'left',display:'flex',alignItems:'center',gap:14,padding:14,boxShadow:'0 1px 4px rgba(0,0,0,0.04)'}}>
      {item.image_url?.startsWith('https://') ? (
        <img src={item.image_url} alt="pomme" style={{width:60,height:60,borderRadius:12,objectFit:'cover',flexShrink:0}}/>
      ) : (
        <div style={{width:60,height:60,borderRadius:12,flexShrink:0,background:diag.bg,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{width:16,height:16,borderRadius:'50%',background:diag.dot}}/>
        </div>
      )}
      <div style={{flex:1,minWidth:0}}>
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
          <div style={{width:8,height:8,borderRadius:'50%',background:diag.dot,flexShrink:0}}/>
          <span style={{fontWeight:700,fontSize:14,color:'#1e293b'}}>{diag.label}</span>
          <span style={{fontSize:11,color:sev.color,fontWeight:600}}>{sev.label}</span>
          {topConf && (
            <span style={{marginLeft:'auto',fontSize:12,fontWeight:700,color:confidenceColor(topConf),background:'#f8fafc',padding:'2px 8px',borderRadius:8,border:`1px solid ${confidenceColor(topConf)}33`}}>
              {(topConf*100).toFixed(0)}%
            </span>
          )}
        </div>
        {top && <div style={{fontSize:12,color:'#64748b',marginBottom:3,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{top.class_fr||top.class}</div>}
        <div style={{fontSize:11,color:'#94a3b8'}}>{date} · {time}</div>
      </div>
      <div style={{color:'#cbd5e1',fontSize:18,flexShrink:0}}>›</div>
    </motion.button>
  );
}

export default function HistoryPage() {
  const [items,setItems]       = useState([]);
  const [page,setPage]         = useState(1);
  const [total,setTotal]       = useState(0);
  const [loading,setLoading]   = useState(false);
  const [error,setError]       = useState(null);
  const [filter,setFilter]     = useState('all');
  const [selected,setSelected] = useState(null);
  const LIMIT = 10;

  async function load(p,f) {
    setLoading(true); setError(null);
    try { const data = await getHistory(p, f==='all'?null:f); setItems(data.data||[]); setTotal(data.total||0); }
    catch { setError('Impossible de charger l\'historique.'); }
    finally { setLoading(false); }
  }
  useEffect(()=>{ load(page,filter); },[page,filter]);
  const totalPages = Math.ceil(total/LIMIT);

  const FILTERS = [
    { id:'all',      label:'Tous'    },
    { id:'healthy',  label:'Saines'  },
    { id:'diseased', label:'Malades' },
    { id:'rotten',   label:'Pourries'},
    { id:'mixed',    label:'Mixtes'  },
  ];

  return (
    <>
      <motion.div initial={{x:30,opacity:0}} animate={{x:0,opacity:1}} exit={{x:-30,opacity:0}} transition={{duration:0.25}}
        style={{position:'absolute',inset:0,background:'#f8fafc',overflowY:'auto'}}>
        <div style={{padding:'48px 20px 20px',background:'linear-gradient(135deg, #166534, #16a34a)'}}>
          <div style={{color:'#fff',fontWeight:800,fontSize:22}}>Historique des Scans</div>
          <div style={{color:'#86efac',fontSize:13,marginTop:2}}>
            {total>0?`${total} diagnostic${total>1?'s':''} enregistré${total>1?'s':''}`:'Aucun scan pour l\'instant'}
          </div>
        </div>
        <div style={{padding:'16px 16px calc(24px + env(safe-area-inset-bottom))'}}>
          <div style={{display:'flex',gap:8,overflowX:'auto',paddingBottom:4,marginBottom:16,scrollbarWidth:'none'}}>
            {FILTERS.map(f=>(
              <button key={f.id} onClick={()=>{setFilter(f.id);setPage(1);}}
                style={{padding:'8px 16px',borderRadius:20,border:'none',cursor:'pointer',fontSize:13,fontWeight:600,whiteSpace:'nowrap',flexShrink:0,transition:'all 0.2s',
                  background:filter===f.id?'#1e293b':'#fff', color:filter===f.id?'#fff':'#64748b',
                  boxShadow:filter===f.id?'none':'0 1px 3px rgba(0,0,0,0.07)'}}>
                {f.label}
              </button>
            ))}
          </div>
          {loading && <div style={{display:'flex',justifyContent:'center',padding:'60px 0'}}><motion.div animate={{rotate:360}} transition={{duration:1,repeat:Infinity,ease:'linear'}} style={{width:32,height:32,border:'3px solid #e2e8f0',borderTop:'3px solid #16a34a',borderRadius:'50%'}}/></div>}
          {error && !loading && <div style={{background:'#fef2f2',border:'1px solid #fee2e2',borderRadius:14,padding:20,textAlign:'center',color:'#dc2626',fontSize:14}}>{error}</div>}
          {!loading && !error && items.length===0 && (
            <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} style={{background:'#fff',borderRadius:20,padding:'60px 32px',textAlign:'center',boxShadow:'0 1px 4px rgba(0,0,0,0.05)'}}>
              <div style={{fontWeight:700,color:'#1e293b',fontSize:16,marginBottom:8}}>Aucun résultat</div>
              <div style={{color:'#94a3b8',fontSize:13}}>{filter!=='all'?`Aucun résultat pour ce filtre.`:'Scannez votre première pomme pour commencer.'}</div>
            </motion.div>
          )}
          {!loading && !error && items.length>0 && (
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {items.map((item,i)=>(
                <motion.div key={item.request_id} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}}>
                  <HistoryCard item={item} onClick={()=>setSelected(item)}/>
                </motion.div>
              ))}
            </div>
          )}
          {totalPages>1 && !loading && (
            <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:12,marginTop:24}}>
              <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} style={pBtn(page===1)}>Précédent</button>
              <span style={{color:'#64748b',fontSize:13}}>{page} / {totalPages}</span>
              <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} style={pBtn(page===totalPages)}>Suivant</button>
            </div>
          )}
        </div>
      </motion.div>
      <AnimatePresence>{selected && <DetailModal item={selected} onClose={()=>setSelected(null)}/>}</AnimatePresence>
    </>
  );
}

function pBtn(disabled) {
  return { padding:'10px 20px',borderRadius:12,border:'none',cursor:disabled?'not-allowed':'pointer',fontSize:13,fontWeight:600,background:disabled?'#f1f5f9':'#1e293b',color:disabled?'#94a3b8':'#fff',opacity:disabled?0.6:1 };
}
