import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Lock,
  User,
  School,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  UserCheck,
  GraduationCap,
  AlertCircle
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { loginWithCredentials } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await loginWithCredentials(identifier, password);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickFill = async (id: string, pass: string) => {
    setIdentifier(id);
    setPassword(pass);
    setError(null);
    setSubmitting(true);
    try {
      await loginWithCredentials(id, pass);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="bg-[#0b4d2c] p-6 text-white text-center relative">
          <div className="mx-auto w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mb-2">
            <School className="w-6 h-6 text-[#facc15]" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">GSTC Garki Central Portal</h2>
          <p className="text-xs text-emerald-100 mt-0.5">
            Single Sign-On • Automatic Role Detection
          </p>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white text-lg font-bold p-1"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-xs text-stone-600 leading-relaxed">
            Enter your username, institutional email, staff ID, or student admission number. The system will automatically detect if you are a <strong>Super Admin</strong>, <strong>Admin</strong>, <strong>Staff</strong>, or <strong>Student</strong> and route you directly to your dashboard.
          </p>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Identifier (Username, Email, Staff ID, or Admission No)
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Admin, admin_usman, GSTC/STF/001, or GSTC/2025/001"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Password <span className="font-normal text-stone-400">(Default: 0000)</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  placeholder="e.g. 0000"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-[#0b4d2c] hover:bg-[#07361e] text-white font-bold rounded-lg shadow-sm flex items-center justify-center gap-2 transition"
            >
              <span>{submitting ? 'Authenticating Role...' : 'Sign In to My Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Pre-fill helper badges */}
          <div className="pt-3 border-t border-stone-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-2">
              Quick Test Credentials:
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              <button
                type="button"
                onClick={() => handleQuickFill('Admin', '0000')}
                className="px-2 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded text-left text-amber-950 font-medium truncate"
              >
                👑 <strong>Super Admin</strong> (Admin / 0000)
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('admin_usman', '0000')}
                className="px-2 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded text-left text-emerald-950 font-medium truncate"
              >
                🛡️ <strong>Admin</strong> (admin_usman / 0000)
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('GSTC/STF/001', '0000')}
                className="px-2 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded text-left text-blue-950 font-medium truncate"
              >
                👨‍🏫 <strong>Teacher</strong> (GSTC/STF/001 / 0000)
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('GSTC/2025/001', '0000')}
                className="px-2 py-1.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded text-left text-purple-950 font-medium truncate"
              >
                🎓 <strong>Student</strong> (GSTC/2025/001 / 0000)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
