import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from './store/useAppStore';
import { Loading } from './components/Loading';
import { Splash } from './pages/Splash';
import { Onboarding } from './pages/Onboarding';
import { Home } from './pages/Home';
import { Schemes } from './pages/Schemes';
import { VoiceOverlay } from './components/VoiceOverlay';

function App() {
  const initializeGuest = useAppStore(state => state.initializeGuest);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      await initializeGuest();
      setLoading(false);
    };
    init();
  }, [initializeGuest]);

  if (loading) return <Loading />;

  return (
    <BrowserRouter>
      <VoiceOverlay />
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/home" element={<Home />} />
        <Route path="/schemes" element={<Schemes />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
