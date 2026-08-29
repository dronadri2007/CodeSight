import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GlassCard } from '../components/common/GlassCard';
import { LoginForm } from '../components/login/LoginForm';
import { RobotScene } from '../components/login/RobotScene';
import { SplineBackground } from '../components/login/SplineBackground';
import { useAuth } from '../hooks/useAuth';

export const AdminLogin: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Full-screen animated Spline Background */}
      <SplineBackground />

      {/* Main Glass Card container */}
      <div className="relative z-10 w-full max-w-4xl pt-24 sm:pt-32 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="w-full"
        >
          {/* Frosted Glass Card without internal separation divider */}
          <GlassCard glow className="w-full grid grid-cols-1 md:grid-cols-2 min-h-[460px] items-center">
            {/* Left Side: Sign In Form */}
            <div className="p-6 sm:p-10 lg:p-12 flex flex-col justify-center w-full">
              <LoginForm onSuccess={() => navigate('/dashboard')} />
            </div>

            {/* Right Side: Centered 3D Robot */}
            <div className="relative w-full h-full min-h-[380px] md:min-h-[460px] flex items-center justify-center p-2 sm:p-4 overflow-hidden">
              <RobotScene />
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
};
