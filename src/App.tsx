/* ============================================
   LumiStrip — App Root
   Wraps providers and routes pages
   ============================================ */

import { ThemeProvider } from './context/ThemeContext';
import { PhotoBoothProvider, usePhotoBooth } from './context/PhotoBoothContext';
import { AppLayout } from './layouts/AppLayout';
import { LandingPage } from './pages/LandingPage';
import { GalleryPage } from './pages/GalleryPage';
import { CameraPage } from './pages/CameraPage';
import { CapturePage } from './pages/CapturePage';
import { EditorPage } from './pages/EditorPage';
import './App.css';

function AppContent() {
  const { state } = usePhotoBooth();

  const renderPage = () => {
    switch (state.currentPage) {
      case 'landing':
        return <LandingPage />;
      case 'gallery':
        return <GalleryPage />;
      case 'camera':
        return <CameraPage />;
      case 'capture':
        return <CapturePage />;
      case 'editor':
      case 'result':
        return <EditorPage />;
      default:
        return <LandingPage />;
    }
  };

  return <AppLayout>{renderPage()}</AppLayout>;
}

function App() {
  return (
    <ThemeProvider>
      <PhotoBoothProvider>
        <AppContent />
      </PhotoBoothProvider>
    </ThemeProvider>
  );
}

export default App;
