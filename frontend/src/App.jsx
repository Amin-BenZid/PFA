import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import BottomNav from './components/BottomNav';
import DiagnosePage from './pages/DiagnosePage';
import HistoryPage from './pages/HistoryPage';

export default function App() {
  const location = useLocation();
  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', background: '#000', overflow: 'hidden' }}>
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<DiagnosePage />} />
            <Route path="/history" element={<HistoryPage />} />
          </Routes>
        </AnimatePresence>
      </div>
      <BottomNav />
    </div>
  );
}