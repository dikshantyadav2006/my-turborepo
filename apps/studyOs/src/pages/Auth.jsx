import React from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  Smartphone,
  ArrowRight,
  Globe,
  ShieldCheck,
  Layout
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { openLogin, openSignup } from '../lib/authNavigation';

const AuthPage = () => {
  const navigate = useNavigate();
  const { setGuestMode, isLoading } = useAuthStore();

  const handleGuestMode = () => {
    setGuestMode();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[440px] bg-card border border-border p-10 rounded-[2.5rem] shadow-2xl relative z-10"
      >
        <div className="flex flex-col items-center gap-4 mb-10">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Zap className="text-primary-foreground w-8 h-8" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-black tracking-tight">Study OS</h1>
            <p className="text-muted-foreground text-sm mt-1">One account. Endless possibilities.</p>
          </div>
        </div>

        <div className="space-y-4">
          <button 
            onClick={openLogin}
            className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/20"
          >
            <Globe size={20} />
            Continue with Shai Library
            <ArrowRight size={20} />
          </button>

          <button 
            onClick={openSignup}
            className="w-full bg-secondary text-secondary-foreground py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-secondary/80 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Create New Account
          </button>
        </div>

        <div className="mt-8 flex flex-col gap-6">
          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-border"></div>
            <span className="flex-shrink mx-4 text-muted-foreground text-[10px] font-bold uppercase tracking-widest">or</span>
            <div className="flex-grow border-t border-border"></div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <button 
              onClick={handleGuestMode}
              className="group flex items-center gap-4 p-4 rounded-2xl bg-secondary/30 border border-transparent hover:border-primary/20 hover:bg-secondary/50 transition-all text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Smartphone size={20} />
              </div>
              <div>
                <p className="text-sm font-bold">Guest Mode</p>
                <p className="text-[11px] text-muted-foreground">Offline only • Local storage</p>
              </div>
            </button>
          </div>
        </div>

        <div className="mt-10 flex items-center justify-center gap-6 text-muted-foreground">
          <div className="flex items-center gap-1.5 text-[11px] font-medium">
            <ShieldCheck size={14} />
            Secure Auth
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-medium">
            <Layout size={14} />
            Cross-app Sync
          </div>
        </div>
      </motion.div>

      <div className="absolute bottom-8 text-center text-[10px] text-muted-foreground font-medium uppercase tracking-[0.2em] max-w-xs leading-relaxed">
        Sync your study progress across all Shai Library platforms seamlessly
      </div>
    </div>
  );
};

export default AuthPage;
