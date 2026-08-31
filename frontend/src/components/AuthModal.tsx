import React, { useState } from 'react';
import { X, Lock, Mail, User, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface AuthModalProps {
  onClose: () => void;
}

export function AuthModal({ onClose }: AuthModalProps) {
  const { login } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const displayName = name.trim() || email.split('@')[0] || 'Alex Morgan';
    login(displayName);
    toast.success(`Welcome to CodeSight, ${displayName}!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-rise">
      <div className="relative w-full max-w-md rounded-2xl border border-[#2E2238] bg-[#17121C] p-8 shadow-2xl text-[#F5EFE6]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-[#AAA2B5] hover:text-[#F5EFE6] transition-colors"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="brand-mark mx-auto mb-3">
            <span className="brand-mark__bracket brand-mark__bracket--left">&lt;</span>
            <span className="brand-mark__sight" />
            <span className="brand-mark__bracket brand-mark__bracket--right">&gt;</span>
          </div>
          <h2 className="display text-2xl font-bold">
            {isRegister ? 'Create CodeSight Account' : 'Sign in to CodeSight'}
          </h2>
          <p className="mt-1 text-xs text-[#AAA2B5]">
            {isRegister ? 'Start your debugging & AI engineering journey.' : 'Access your workspace, problems, and promotion exams.'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {isRegister && (
            <div>
              <label className="block mb-1 font-mono text-[10px] text-[#AAA2B5] uppercase">Full Name</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-3 text-[#AAA2B5]" />
                <input
                  type="text"
                  required
                  placeholder="Alex Morgan"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full rounded-lg border border-[#2E2238] bg-[#0B0A0F] py-2.5 pl-9 pr-3 text-xs text-[#F5EFE6] outline-none focus:border-[#C96A32]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block mb-1 font-mono text-[10px] text-[#AAA2B5] uppercase">Email Address</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-3 text-[#AAA2B5]" />
              <input
                type="email"
                required
                placeholder="alex@codesight.dev"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full rounded-lg border border-[#2E2238] bg-[#0B0A0F] py-2.5 pl-9 pr-3 text-xs text-[#F5EFE6] outline-none focus:border-[#C96A32]"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 font-mono text-[10px] text-[#AAA2B5] uppercase">Password</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-3 text-[#AAA2B5]" />
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full rounded-lg border border-[#2E2238] bg-[#0B0A0F] py-2.5 pl-9 pr-3 text-xs text-[#F5EFE6] outline-none focus:border-[#C96A32]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary w-full py-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-lg mt-2"
          >
            {isRegister ? 'Register Account' : 'Sign In'} <ArrowRight size={14} />
          </button>
        </form>

        {/* Toggle Register / Login */}
        <div className="mt-6 border-t border-[#2E2238] pt-4 text-center text-xs text-[#AAA2B5]">
          {isRegister ? (
            <span>Already have an account? <button onClick={() => setIsRegister(false)} className="text-[#C96A32] font-bold hover:underline">Sign In</button></span>
          ) : (
            <span>Don't have an account? <button onClick={() => setIsRegister(true)} className="text-[#C96A32] font-bold hover:underline">Register Now</button></span>
          )}
        </div>
      </div>
    </div>
  );
}
