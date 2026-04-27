import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function BottomNav() {
  const { pathname } = useLocation();
  const tabs = [
    { path: '/', label: 'Scan', icon: <CamIcon /> },
    { path: '/history', label: 'History', icon: <ClockIcon /> },
  ];
  return (
    <nav style={{
      background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)',
      borderTop: '1px solid #f1f5f9', display: 'flex',
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {tabs.map(({ path, label, icon }) => {
        const active = pathname === path;
        return (
          <Link key={path} to={path} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '10px 0 8px', textDecoration: 'none' }}>
            <motion.div animate={{ scale: active ? 1.1 : 1, color: active ? '#16a34a' : '#94a3b8' }}
              style={{ color: active ? '#16a34a' : '#94a3b8' }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}>
              {icon}
            </motion.div>
            <span style={{ fontSize: 10, fontWeight: active ? 700 : 400, color: active ? '#16a34a' : '#94a3b8', letterSpacing: '0.02em' }}>
              {label}
            </span>
            {active && <motion.div layoutId="dot" style={{ width: 4, height: 4, borderRadius: 2, background: '#16a34a' }} />}
          </Link>
        );
      })}
    </nav>
  );
}

function CamIcon() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>;
}
function ClockIcon() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
}