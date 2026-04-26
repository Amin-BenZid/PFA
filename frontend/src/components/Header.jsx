import { Link, useLocation } from 'react-router-dom';

export default function Header() {
  const { pathname } = useLocation();

  const navStyle = (path) => ({
    padding: '8px 20px',
    borderRadius: 20,
    textDecoration: 'none',
    fontWeight: 500,
    fontSize: 15,
    transition: 'all 0.2s',
    background: pathname === path ? '#fff' : 'transparent',
    color: pathname === path ? '#16a34a' : '#fff',
  });

  return (
    <header style={{
      background: 'linear-gradient(135deg, #166534 0%, #16a34a 100%)',
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: 64,
      boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 28 }}>🍎</span>
        <div>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 18, lineHeight: 1.2 }}>
            Apple Doctor
          </div>
          <div style={{ color: '#86efac', fontSize: 11 }}>
            Disease Detection System
          </div>
        </div>
      </div>
      <nav style={{ display: 'flex', gap: 8 }}>
        <Link to="/" style={navStyle('/')}>Diagnose</Link>
        <Link to="/history" style={navStyle('/history')}>History</Link>
      </nav>
    </header>
  );
}
