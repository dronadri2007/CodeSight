import React from 'react';
import { useApp } from '../../context/AppContext';
import darkBgImage from '../../assets/backgrounds/dark-bg.jpg';
import lightBgImage from '../../assets/backgrounds/light-bg.jpg';

export const BackgroundLayer: React.FC = () => {
  const { theme } = useApp();

  return (
    <>
      {/* Dark background layer */}
      <div
        className={`fixed inset-0 w-full h-full pointer-events-none bg-cover bg-center transition-opacity duration-500 ease-in-out ${
          theme === 'dark' ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          zIndex: -10,
          backgroundImage: `url(${darkBgImage})`
        }}
      />

      {/* Light background layer */}
      <div
        className={`fixed inset-0 w-full h-full pointer-events-none bg-cover bg-center transition-opacity duration-500 ease-in-out ${
          theme === 'light' ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          zIndex: -10,
          backgroundImage: `url(${lightBgImage})`
        }}
      />

      {/* Subtle atmospheric contrast layer without heavy gradient masking */}
      <div
        className={`fixed inset-0 w-full h-full pointer-events-none transition-opacity duration-500 ease-in-out ${
          theme === 'dark'
            ? 'bg-[#0b1326]/30'
            : 'bg-[#f8fafc]/40'
        }`}
        style={{ zIndex: -5 }}
      />
    </>
  );
};
