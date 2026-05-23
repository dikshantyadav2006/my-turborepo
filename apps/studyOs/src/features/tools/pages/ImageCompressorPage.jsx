import React, { useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  Download,
  Trash2,
  History,
  FileImage,
  ArrowDownToLine,
} from 'lucide-react';
import { toast } from 'sonner';
import { SEO, schemaBreadcrumb, schemaFAQ } from '../../../components/seo/SEO';

import { useImageToolStore } from '../store/imageToolStore';
import { useImageCompressor } from '../hooks/useImageCompressor';
import { ImageDropzone } from '../components/ImageDropzone';
import { ImageCard } from '../components/ImageCard';
import { CompressionSettings } from '../components/CompressionSettings';

function fmt(bytes) {
  if (bytes == null || isNaN(bytes)) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function ImageCompressorPage() {
  const {
    images,
    settings,
    history,
    addImages,
    removeImage,
    clearAll,
    updateSettings,
    clearHistory,
  } = useImageToolStore();
  const { compressImage, downloadSingle, downloadAll } = useImageCompressor();

  // Keep a ref map of files for re-compression
  const fileCache = useRef({});

  const handleFiles = useCallback(
    async (files) => {
      const items = addImages(files);
      // Cache files and immediately start compressing
      files.forEach((f, i) => {
        fileCache.current[items[i].id] = f;
      });
      // Compress all concurrently (browser-image-compression uses workers internally)
      await Promise.all(items.map((item, i) => compressImage(item, files[i])));
    },
    [addImages, compressImage]
  );

  const handleRemove = useCallback(
    (id) => {
      delete fileCache.current[id];
      removeImage(id);
    },
    [removeImage]
  );

  const handleClearAll = useCallback(() => {
    fileCache.current = {};
    clearAll();
  }, [clearAll]);

  const doneImages = images.filter((i) => i.status === 'done');
  const totalSaved = doneImages.reduce(
    (acc, i) => acc + (i.originalSize - (i.compressedSize || 0)),
    0
  );

  const compressionFAQ = schemaFAQ([
    { q: 'Does this upload my images?', a: 'No. All compression happens locally in your browser. Your images never leave your device.' },
    { q: 'What formats are supported?', a: 'JPG, PNG, WebP, AVIF, GIF and BMP. You can convert between formats too.' },
    { q: 'Can I compress multiple images at once?', a: 'Yes, drag and drop multiple files or paste images with Ctrl+V to compress them in batch.' },
    { q: 'Is there a file size limit?', a: 'No artificial limit. Processing happens in your browser using Web Workers.' },
  ]);

  return (
    <div className="space-y-6 pb-10">
      <SEO
        title="Image Compressor – Compress & Resize Images Free Online"
        description="Compress JPG, PNG, WebP and AVIF images online for free. Reduce file size without quality loss. Works locally in your browser – no uploads, completely private."
        keywords={['image compressor', 'compress images online', 'reduce image size', 'resize image free', 'webp converter', 'jpg compressor', 'image optimizer', 'sai library tools', 'local image compression']}
        canonical="/tools/image-compressor"
        robots="index,follow"
        schema={[
          schemaBreadcrumb([{ name: 'Home', url: '/' }, { name: 'Tools', url: '/tools/image-compressor' }, { name: 'Image Compressor', url: '/tools/image-compressor' }]),
          compressionFAQ
        ]}
      />
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FileImage className="text-primary" size={24} />
            Image Compressor
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Local-first · Private · Offline · Instant
          </p>
        </div>
        {doneImages.length > 0 && (
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-4 py-2">
            <ArrowDownToLine size={16} className="text-emerald-500" />
            <span className="text-sm font-semibold text-emerald-600">
              Saved {fmt(totalSaved)} total
            </span>
          </div>
        )}
      </div>

      {/* Layout: Settings Left + Content Right on desktop */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Settings Sidebar */}
        <div className="lg:w-72 xl:w-80 flex-shrink-0">
          <div className="bg-card border border-border rounded-2xl p-5 sticky top-4">
            <CompressionSettings settings={settings} onChange={updateSettings} />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Drop Zone */}
          <ImageDropzone onFiles={handleFiles} />

          {/* Action bar */}
          {images.length > 0 && (
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <p className="text-sm text-muted-foreground">
                {images.length} image{images.length !== 1 ? 's' : ''}
                {doneImages.length > 0 && ` · ${doneImages.length} compressed`}
              </p>
              <div className="flex gap-2">
                {doneImages.length > 0 && (
                  <button
                    onClick={() => downloadAll(images)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity"
                  >
                    <Download size={15} />
                    {doneImages.length > 1 ? `Download All (${doneImages.length})` : 'Download'}
                  </button>
                )}
                <button
                  onClick={handleClearAll}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
                >
                  <Trash2 size={14} />
                  Clear
                </button>
              </div>
            </div>
          )}

          {/* Image cards */}
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {images.map((img) => (
                <ImageCard
                  key={img.id}
                  item={img}
                  onDownload={downloadSingle}
                  onRemove={handleRemove}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* Empty state */}
          {images.length === 0 && (
            <div className="text-center py-16 text-muted-foreground/40 space-y-3">
              <Zap size={48} strokeWidth={1} className="mx-auto" />
              <p className="text-sm">
                Add images above to start compressing
              </p>
            </div>
          )}
        </div>
      </div>

      {/* History Section */}
      {history.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold flex items-center gap-2">
              <History size={18} />
              Recent History
            </h2>
            <button
              onClick={clearHistory}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              Clear history
            </button>
          </div>
          <div className="bg-card border border-border rounded-2xl divide-y divide-border overflow-hidden">
            {history.slice(0, 10).map((h) => (
              <div key={h.id + h.timestamp} className="flex items-center gap-3 px-4 py-3">
                <FileImage size={16} className="text-muted-foreground flex-shrink-0" />
                <span className="text-sm flex-1 truncate">{h.name}</span>
                <span className="text-xs text-muted-foreground">{fmt(h.originalSize)}</span>
                <span className="text-xs text-muted-foreground">→</span>
                <span className="text-xs text-emerald-500 font-medium">{fmt(h.compressedSize)}</span>
                <span className="text-xs bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded-full font-medium ml-1">
                  -{Math.round((h.savedBytes / h.originalSize) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
