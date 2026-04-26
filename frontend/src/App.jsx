import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import DiagnosePage from './pages/DiagnosePage';
import HistoryPage from './pages/HistoryPage';

export default function App() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<DiagnosePage />} />
          <Route path="/history" element={<HistoryPage />} />
        </Routes>
      </main>
    </div>
  );
}
