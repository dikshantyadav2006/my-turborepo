/**
 * useImageCompressor hook
 * -------------------------
 * All heavy processing runs through browser-image-compression (which internally
 * uses a web-worker if the browser supports it).  We never block the main thread.
 */
import { useCallback } from 'react';
import imageCompression from 'browser-image-compression';
import JSZip from 'jszip';
import { toast } from 'sonner';
import { useImageToolStore } from '../store/imageToolStore';

const FORMAT_MIME = {
  webp: 'image/webp',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  png: 'image/png',
  avif: 'image/avif',
};

/** Resize via canvas – also used to do format conversion */
async function resizeAndConvert(blob, { width, height, format }) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width || img.naturalWidth;
      canvas.height = height || img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const mime = FORMAT_MIME[format] || 'image/webp';
      canvas.toBlob(
        (result) => {
          URL.revokeObjectURL(url);
          if (result) resolve(result);
          else reject(new Error('Canvas toBlob failed'));
        },
        mime,
        0.92
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    img.src = url;
  });
}

/** Get image natural dimensions */
async function getImageDimensions(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => resolve({ w: null, h: null });
    img.src = url;
  });
}

/** Iterative quality targeting to approach a KB target */
async function compressToTarget(file, targetKB, outputFormat, resizeOpts, onProgress) {
  const targetBytes = targetKB * 1024;
  const mime = FORMAT_MIME[outputFormat] || 'image/webp';

  // Initial high quality compression
  let quality = 0.85;
  let result = null;

  for (let attempt = 0; attempt < 10; attempt++) {
    const options = {
      maxSizeMB: targetKB / 1024 + 0.01,
      useWebWorker: true,
      fileType: mime,
      initialQuality: quality,
      onProgress: (p) => onProgress?.(Math.round(10 + (attempt / 10) * 80 + p * 0.08)),
      ...(resizeOpts.width && { maxWidthOrHeight: Math.max(resizeOpts.width, resizeOpts.height || 0) }),
    };

    result = await imageCompression(file, options);

    const ratio = result.size / targetBytes;
    onProgress?.(Math.round(10 + ((attempt + 1) / 10) * 80));

    if (result.size <= targetBytes) break;
    if (ratio < 1.05) break; // close enough
    quality = Math.max(0.05, quality * (1 / Math.sqrt(ratio)));
  }

  // If we still need a specific output format / resize, run through canvas
  if (resizeOpts.width || resizeOpts.height || outputFormat !== 'jpeg') {
    result = await resizeAndConvert(result, {
      width: resizeOpts.width,
      height: resizeOpts.height,
      format: outputFormat,
    });
  }

  return result;
}

export function useImageCompressor() {
  const { updateImage, addToHistory } = useImageToolStore();

  const compressImage = useCallback(
    async (item, file) => {
      updateImage(item.id, { status: 'compressing', progress: 5 });

      try {
        // Get original dimensions
        const { w, h } = await getImageDimensions(item.originalUrl);
        updateImage(item.id, { originalWidth: w, originalHeight: h, progress: 10 });

        // Compute resize target preserving aspect ratio
        let rw = item.resizeWidth || null;
        let rh = item.resizeHeight || null;
        if (item.lockAspect && w && h) {
          if (rw && !rh) rh = Math.round((rw / w) * h);
          if (rh && !rw) rw = Math.round((rh / h) * w);
        }

        const compressed = await compressToTarget(
          file,
          item.targetKB || 100,
          item.outputFormat || 'webp',
          { width: rw, height: rh },
          (p) => updateImage(item.id, { progress: p })
        );

        const compressedUrl = URL.createObjectURL(compressed);

        updateImage(item.id, {
          status: 'done',
          progress: 100,
          compressedSize: compressed.size,
          compressedUrl,
          compressedBlob: compressed,
        });

        addToHistory({
          id: item.id,
          name: item.name,
          originalSize: item.originalSize,
          compressedSize: compressed.size,
          savedBytes: item.originalSize - compressed.size,
          format: item.outputFormat,
          timestamp: new Date().toISOString(),
        });
      } catch (err) {
        console.error('Compression error', err);
        updateImage(item.id, {
          status: 'error',
          error: err.message || 'Compression failed',
          progress: 0,
        });
        toast.error(`Failed to compress ${item.name}`);
      }
    },
    [updateImage, addToHistory]
  );

  const downloadSingle = useCallback((item) => {
    if (!item.compressedUrl) return;
    const ext = item.outputFormat || 'webp';
    const baseName = item.name.replace(/\.[^/.]+$/, '');
    const a = document.createElement('a');
    a.href = item.compressedUrl;
    a.download = `${baseName}_compressed.${ext}`;
    a.click();
    toast.success('Downloaded!');
  }, []);

  const downloadAll = useCallback(async (images) => {
    const done = images.filter((img) => img.status === 'done' && img.compressedBlob);
    if (!done.length) {
      toast.error('Nothing to download yet');
      return;
    }

    if (done.length === 1) {
      downloadSingle(done[0]);
      return;
    }

    toast.info('Zipping files...');
    const zip = new JSZip();
    done.forEach((img) => {
      const ext = img.outputFormat || 'webp';
      const baseName = img.name.replace(/\.[^/.]+$/, '');
      zip.file(`${baseName}_compressed.${ext}`, img.compressedBlob);
    });

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compressed_images_${Date.now()}.zip`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${done.length} files as ZIP`);
  }, [downloadSingle]);

  return { compressImage, downloadSingle, downloadAll };
}
