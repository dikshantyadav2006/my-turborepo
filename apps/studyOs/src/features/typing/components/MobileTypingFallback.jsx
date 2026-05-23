import React from 'react';
import { motion } from 'framer-motion';
import { Keyboard, Laptop, ArrowRight } from 'lucide-react';
import { openLogin } from '../../../lib/authNavigation';

const MobileTypingFallback = () => {
  return (
    <div className="h-[80vh] flex flex-col items-center justify-center px-6 text-center animate-in fade-in duration-700">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-w-md w-full bg-card/80 backdrop-blur-xl border border-border p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-blue-500 to-purple-500" />
        
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary">
          <Keyboard size={32} />
        </div>
        
        <h2 className="text-2xl font-black tracking-tight mb-3">
          Desktop Only Feature
        </h2>
        
        <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
          Typing practice requires a physical keyboard for the full premium experience. 
          Please connect a keyboard or open Study OS on a laptop or desktop.
        </p>

        <div className="flex items-center justify-center gap-4 text-muted-foreground mb-8">
          <Laptop size={24} />
          <span className="w-1 h-1 rounded-full bg-border" />
          <Keyboard size={24} />
        </div>

        <button 
          onClick={() => {
            const mainWebsite = import.meta.env.VITE_MAIN_WEBSITE || 'https://www.sailibrary.online';
            window.open(mainWebsite, '_blank');
          }}
          className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-primary/20"
        >
          Open Main Website
          <ArrowRight size={18} />
        </button>
      </motion.div>
    </div>
  );
};

export default MobileTypingFallback;
