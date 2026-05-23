import React, { memo } from 'react';
import { motion } from 'framer-motion';

const TypingCaret = ({ isActive }) => {
  return (
    <motion.div
      className="absolute w-[2px] h-[1.2em] bg-primary rounded-full z-10"
      animate={{
        opacity: [1, 0, 1],
      }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      style={{
        // Use translate3d for GPU acceleration
        transform: 'translate3d(0, 0, 0)',
        // Adjust vertical alignment to match text
        marginTop: '0.1em'
      }}
    />
  );
};

export default memo(TypingCaret);
