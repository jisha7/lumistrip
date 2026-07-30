/* ============================================
   LumiStrip — Landing Page
   Full dreamy landing experience with
   hero, features, and how-it-works sections
   ============================================ */

import { usePhotoBooth } from '../context/PhotoBoothContext';
import { LandingHero } from '../components/landing/LandingHero';
import { FeatureShowcase } from '../components/landing/FeatureShowcase';
import { HowItWorks } from '../components/landing/HowItWorks';

export function LandingPage() {
  const { setPage } = usePhotoBooth();

  return (
    <div>
      <LandingHero
        onStart={() => setPage('camera')}
        onExploreTemplates={() => setPage('gallery')}
      />
      <FeatureShowcase />
      <HowItWorks />
    </div>
  );
}

