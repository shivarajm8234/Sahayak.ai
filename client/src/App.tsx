import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Splash } from './pages/Splash';
import { Onboarding } from './pages/Onboarding';
import { Home } from './pages/Home';
import { VoiceOverlay } from './components/VoiceOverlay';

function App() {
  return (
    <BrowserRouter>
      <VoiceOverlay />
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
