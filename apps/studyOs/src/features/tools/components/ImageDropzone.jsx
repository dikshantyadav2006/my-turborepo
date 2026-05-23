import React, { useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, ImagePlus } from 'lucide-react';
import { clsx } from 'clsx';

const ACCEPTED = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'image/avif': ['.avif'],
  'image/gif': ['.gif'],
  'image/bmp': ['.bmp'],
};

export function ImageDropzone({ onFiles }) {
  const onDrop = useCallback(
    (accepted) => {
      if (accepted.length) onFiles(accepted);
    },
    [onFiles]
  );

  // Paste support
  const onPaste = useCallback(
    (e) => {
      const items = Array.from(e.clipboardData?.items || []);
      const files = items
        .filter((i) => i.kind === 'file' && i.type.startsWith('image/'))
        .map((i) => i.getAsFile())
        .filter(Boolean);
      if (files.length) onFiles(files);
    },
    [onFiles]
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: ACCEPTED,
    multiple: true,
    noClick: false,
  });

  return (
    <div
      {...getRootProps()}
      onPaste={onPaste}
      className={clsx(
        'relative flex flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed transition-all duration-300 cursor-pointer select-none',
        'min-h-[200px] p-8 text-center',
        isDragActive
          ? 'border-primary bg-primary/5 scale-[1.01]'
          : 'border-border hover:border-primary/50 hover:bg-secondary/30'
      )}
    >
      <input {...getInputProps()} />

      <AnimatePresence mode="wait">
        {isDragActive ? (
          <motion.div
            key="dragging"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="flex flex-col items-center gap-3"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <UploadCloud size={32} className="text-primary" />
            </div>
            <p className="font-semibold text-primary text-lg">Drop to compress</p>
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="flex flex-col items-center gap-3"
          >
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center">
              <ImagePlus size={28} className="text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Drop images here</p>
              <p className="text-sm text-muted-foreground mt-1">
                or <span className="text-primary font-medium cursor-pointer" onClick={open}>browse files</span> · Paste with Ctrl+V
              </p>
            </div>
            <p className="text-xs text-muted-foreground/60">
              JPG · PNG · WebP · AVIF · GIF — Multiple files supported
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
