import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';

const Key = memo(({ label, width = "w-12", isPressed, fingerHint }) => {
  const fingerColors = {
    l4: "border-blue-500/30 text-blue-400", // Left Pinky
    l3: "border-blue-400/30 text-blue-300", // Left Ring
    l2: "border-blue-300/30 text-blue-200", // Left Middle
    l1: "border-blue-200/30 text-blue-100", // Left Index
    r1: "border-emerald-200/30 text-emerald-100", // Right Index
    r2: "border-emerald-300/30 text-emerald-200", // Right Middle
    r3: "border-emerald-400/30 text-emerald-300", // Right Ring
    r4: "border-emerald-500/30 text-emerald-400", // Right Pinky
    thumb: "border-zinc-500/30 text-zinc-400"
  };

  return (
    <motion.div
      animate={{
        scale: isPressed ? 0.92 : 1,
        backgroundColor: isPressed ? "var(--color-primary)" : "rgba(255,255,255,0.03)",
        borderColor: isPressed ? "var(--color-primary)" : undefined,
        color: isPressed ? "var(--color-primary-foreground)" : undefined,
      }}
      className={cn(
        width,
        "h-12 rounded-xl border border-border/40 flex items-center justify-center text-[10px] font-black shadow-lg backdrop-blur-md transition-colors",
        !isPressed && fingerHint && fingerColors[fingerHint]
      )}
    >
      {label}
    </motion.div>
  );
});

const KeyboardVisualizer = ({ pressedKey }) => {
  const keyMap = [
    [
      { k: "Q", f: "l4" }, { k: "W", f: "l3" }, { k: "E", f: "l2" }, { k: "R", f: "l1" }, { k: "T", f: "l1" },
      { k: "Y", f: "r1" }, { k: "U", f: "r1" }, { k: "I", f: "r2" }, { k: "O", f: "r3" }, { k: "P", f: "r4" }
    ],
    [
      { k: "A", f: "l4" }, { k: "S", f: "l3" }, { k: "D", f: "l2" }, { k: "F", f: "l1" }, { k: "G", f: "l1" },
      { k: "H", f: "r1" }, { k: "J", f: "r1" }, { k: "K", f: "r2" }, { k: "L", f: "r3" }, { k: ";", f: "r4" }
    ],
    [
      { k: "Z", f: "l4" }, { k: "X", f: "l3" }, { k: "C", f: "l2" }, { k: "V", f: "l1" }, { k: "B", f: "l1" },
      { k: "N", f: "r1" }, { k: "M", f: "r1" }, { k: ",", f: "r2" }, { k: ".", f: "r3" }, { k: "/", f: "r4" }
    ]
  ];

  const pKey = pressedKey?.toUpperCase();

  return (
    <div className="flex flex-col gap-2 items-center p-8 bg-card/20 backdrop-blur-xl rounded-[3rem] border border-border/50 shadow-2xl relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
      
      {keyMap.map((row, i) => (
        <div key={i} className={cn("flex gap-2", i === 1 && "pl-4", i === 2 && "pl-8")}>
          {row.map(item => (
            <Key 
              key={item.k} 
              label={item.k} 
              fingerHint={item.f}
              isPressed={pKey === item.k} 
            />
          ))}
        </div>
      ))}
      
      <div className="flex gap-2 mt-2">
        <Key 
          label="SPACE" 
          width="w-64" 
          fingerHint="thumb"
          isPressed={pressedKey === ' '} 
        />
      </div>

      <div className="mt-6 flex gap-8">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Left Hand</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Right Hand</span>
        </div>
      </div>
    </div>
  );
};

export default memo(KeyboardVisualizer);
