import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  Loader2,
  AlertCircle,
  Download,
  Trash2,
  ChevronDown,
  ChevronUp,
  ImageIcon,
  ArrowRight,
} from 'lucide-react';
import { clsx } from 'clsx';

function fmt(bytes) {
  if (bytes == null) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function pct(orig, compressed) {
  if (!orig || !compressed) return null;
  return Math.round((1 - compressed / orig) * 100);
}

function StatusBadge({ status }) {
  if (status === 'idle') return null;
  if (status === 'compressing')
    return (
      <span className="flex items-center gap-1 text-xs font-medium text-blue-500">
        <Loader2 size={12} className="animate-spin" />
        Compressing
      </span>
    );
  if (status === 'done')
    return (
      <span className="flex items-center gap-1 text-xs font-medium text-emerald-500">
        <CheckCircle2 size={12} />
        Done
      </span>
    );
  if (status === 'error')
    return (
      <span className="flex items-center gap-1 text-xs font-medium text-destructive">
        <AlertCircle size={12} />
        Error
      </span>
    );
}

export function ImageCard({ item, onDownload, onRemove }) {
  const [expanded, setExpanded] = useState(false);
  const saving = pct(item.originalSize, item.compressedSize);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-card border border-border rounded-2xl overflow-hidden"
    >
      {/* Header row */}
      <div className="flex items-center gap-3 p-4">
        {/* Thumbnail */}
        <div className="w-12 h-12 rounded-xl overflow-hidden bg-secondary flex-shrink-0 flex items-center justify-center">
          {item.originalUrl ? (
            <img
              src={item.originalUrl}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <ImageIcon size={20} className="text-muted-foreground" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{item.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-muted-foreground">{fmt(item.originalSize)}</span>
            {item.compressedSize != null && (
              <>
                <ArrowRight size={10} className="text-muted-foreground/50" />
                <span className="text-xs font-semibold text-emerald-500">{fmt(item.compressedSize)}</span>
                {saving != null && (
                  <span className="text-xs bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded-full font-medium">
                    -{saving}%
                  </span>
                )}
              </>
            )}
            <StatusBadge status={item.status} />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {item.status === 'done' && (
            <button
              onClick={() => onDownload(item)}
              className="p-2 rounded-xl hover:bg-primary hover:text-primary-foreground text-muted-foreground transition-colors"
              title="Download"
            >
              <Download size={16} />
            </button>
          )}
          <button
            onClick={() => onRemove(item.id)}
            className="p-2 rounded-xl hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors"
            title="Remove"
          >
            <Trash2 size={16} />
          </button>
          {(item.originalUrl || item.compressedUrl) && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-2 rounded-xl hover:bg-secondary text-muted-foreground transition-colors"
            >
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {item.status === 'compressing' && (
        <div className="px-4 pb-3">
          <div className="h-1 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${item.progress}%` }}
              transition={{ ease: 'easeOut', duration: 0.3 }}
            />
          </div>
        </div>
      )}

      {/* Error */}
      {item.status === 'error' && item.error && (
        <div className="px-4 pb-3 text-xs text-destructive">{item.error}</div>
      )}

      {/* Expanded preview */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div
              className={clsx(
                'grid gap-3 px-4 pb-4',
                item.compressedUrl ? 'grid-cols-2' : 'grid-cols-1'
              )}
            >
              <div>
                <p className="text-xs text-muted-foreground mb-2 font-medium">Original</p>
                <div className="rounded-xl overflow-hidden border border-border bg-secondary/30">
                  <img
                    src={item.originalUrl}
                    alt="Original"
                    className="w-full h-40 object-contain"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1 text-center">{fmt(item.originalSize)}</p>
              </div>

              {item.compressedUrl && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2 font-medium">Compressed</p>
                  <div className="rounded-xl overflow-hidden border border-border bg-secondary/30">
                    <img
                      src={item.compressedUrl}
                      alt="Compressed"
                      className="w-full h-40 object-contain"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 text-center">{fmt(item.compressedSize)}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
