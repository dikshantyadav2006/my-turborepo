import React from 'react';
import { clsx } from 'clsx';

const PRESETS = [
  { label: 'Passport', sublabel: '20 KB', targetKB: 20 },
  { label: 'Gov Form', sublabel: '50 KB', targetKB: 50 },
  { label: 'Standard', sublabel: '100 KB', targetKB: 100 },
  { label: 'Web HD', sublabel: '300 KB', targetKB: 300 },
  { label: '1 MB', sublabel: '1024 KB', targetKB: 1024 },
];

const FORMATS = ['webp', 'jpeg', 'png', 'avif'];

export function CompressionSettings({ settings, onChange }) {
  const { targetKB, outputFormat, resizeWidth, resizeHeight, lockAspect } = settings;

  return (
    <div className="space-y-5">
      {/* Presets */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Quick Presets
        </p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.targetKB}
              onClick={() => onChange({ targetKB: p.targetKB })}
              className={clsx(
                'flex flex-col items-center px-3 py-2 rounded-xl border text-sm font-medium transition-all',
                targetKB === p.targetKB
                  ? 'border-primary bg-primary text-primary-foreground shadow-sm scale-[1.02]'
                  : 'border-border bg-card text-foreground hover:border-primary/50 hover:bg-secondary/40'
              )}
            >
              <span>{p.label}</span>
              <span className="text-[10px] font-normal opacity-70">{p.sublabel}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Target size */}
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Target Size
        </label>
        <div className="flex items-center gap-2 mt-2">
          <input
            type="number"
            min={1}
            max={10000}
            value={targetKB}
            onChange={(e) => onChange({ targetKB: Math.max(1, Number(e.target.value)) })}
            className="w-24 px-3 py-2 text-sm rounded-xl border border-border bg-secondary/30 focus:outline-none focus:ring-2 focus:ring-primary/30 font-medium"
          />
          <span className="text-sm text-muted-foreground">KB</span>
          <span className="text-xs text-muted-foreground/60">
            ≈ {(targetKB / 1024).toFixed(2)} MB
          </span>
        </div>
      </div>

      {/* Output format */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Output Format
        </p>
        <div className="flex gap-2 flex-wrap">
          {FORMATS.map((f) => (
            <button
              key={f}
              onClick={() => onChange({ outputFormat: f })}
              className={clsx(
                'px-4 py-2 rounded-xl border text-sm font-semibold uppercase transition-all',
                outputFormat === f
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/40'
              )}
            >
              {f}
            </button>
          ))}
        </div>
        {outputFormat === 'webp' && (
          <p className="text-xs text-muted-foreground/60 mt-1.5">
            ✦ WebP offers the best size-quality ratio for most images
          </p>
        )}
        {outputFormat === 'avif' && (
          <p className="text-xs text-muted-foreground/60 mt-1.5">
            ✦ AVIF has the highest compression, but slower and less supported
          </p>
        )}
      </div>

      {/* Resize */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Resize (optional)
        </p>
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <label className="text-xs text-muted-foreground mb-1 block">Width (px)</label>
            <input
              type="number"
              min={1}
              value={resizeWidth || ''}
              onChange={(e) =>
                onChange({ resizeWidth: e.target.value ? Number(e.target.value) : null })
              }
              placeholder="Auto"
              className="w-full px-3 py-2 text-sm rounded-xl border border-border bg-secondary/30 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-muted-foreground mb-1 block">Height (px)</label>
            <input
              type="number"
              min={1}
              value={resizeHeight || ''}
              onChange={(e) =>
                onChange({ resizeHeight: e.target.value ? Number(e.target.value) : null })
              }
              placeholder="Auto"
              className="w-full px-3 py-2 text-sm rounded-xl border border-border bg-secondary/30 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="mt-5">
            <button
              onClick={() => onChange({ lockAspect: !lockAspect })}
              title={lockAspect ? 'Aspect ratio locked' : 'Aspect ratio unlocked'}
              className={clsx(
                'px-3 py-2 text-xs rounded-xl border font-semibold transition-colors',
                lockAspect
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:border-primary/40'
              )}
            >
              {lockAspect ? '🔒' : '🔓'}
            </button>
          </div>
        </div>
        {(resizeWidth || resizeHeight) && (
          <p className="text-xs text-muted-foreground/60 mt-1.5">
            Leave one dimension empty to auto-calculate from aspect ratio
          </p>
        )}
      </div>
    </div>
  );
}
