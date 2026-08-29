import React, { useState } from 'react';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { InputField } from '../common/InputField';
import { PrimaryButton } from '../common/PrimaryButton';
import { useAuth } from '../../hooks/useAuth';

interface LoginFormProps {
  onSuccess?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('admin@codesight.dev');
  const [password, setPassword] = useState('admin123');
  const [rememberMe, setRememberMe] = useState(true);
  const { login, loading, error, clearError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    try {
      await login(email, password, rememberMe);
      if (onSuccess) onSuccess();
    } catch {
      // Handled by context
    }
  };

  return (
    <div className="w-full flex flex-col justify-center">
      {/* Error alert */}
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center justify-between">
          <span>{error}</span>
          <button
            type="button"
            onClick={clearError}
            className="text-red-400 hover:text-white font-bold text-sm ml-2"
          >
            ×
          </button>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField
          label="Admin Email"
          type="email"
          placeholder="admin@codesight.dev"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) clearError();
          }}
          icon={<Mail size={17} />}
          required
        />

        <InputField
          label="Password"
          isPassword
          placeholder="••••••••••••"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (error) clearError();
          }}
          icon={<Lock size={17} />}
          required
        />

        {/* Options */}
        <div className="flex items-center justify-between text-xs text-white/60 pt-1">
          <label className="flex items-center space-x-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded border-white/20 bg-white/5 text-[#007AFF] focus:ring-0 focus:ring-offset-0"
            />
            <span className="text-white/70">Remember session</span>
          </label>
        </div>

        {/* Action Button */}
        <PrimaryButton
          type="submit"
          loading={loading}
          className="w-full mt-3 font-semibold text-sm py-3.5"
          icon={<ArrowRight size={17} />}
        >
          Access Dashboard
        </PrimaryButton>
      </form>
    </div>
  );
};
