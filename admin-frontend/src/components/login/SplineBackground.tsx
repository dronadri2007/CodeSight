import React, { useState } from 'react';
import Spline from '@splinetool/react-spline';

export const SplineBackground: React.FC = () => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-auto select-none bg-[#08080A]">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[20%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-br from-[#007AFF]/15 via-[#BF5AF2]/10 to-transparent blur-[140px] animate-pulse-glow" />
        <div
          className="absolute bottom-[10%] right-[15%] w-[55vw] h-[55vw] rounded-full bg-gradient-to-tl from-[#007AFF]/18 via-[#30D158]/08 to-transparent blur-[160px] animate-pulse-glow"
          style={{ animationDelay: '1.5s' }}
        />
      </div>

      {/* Self-hosted Local Spline Scene */}
      <div
        className={`absolute inset-0 w-full h-full transition-opacity duration-700 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <Spline
          scene="/assets/bg.splinecode"
          onLoad={() => setLoaded(true)}
          className="w-full h-full"
        />
      </div>

      {/* Vignette overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_40%,#08080A_95%)] opacity-70" />
    </div>
  );
};

export default SplineBackground;
