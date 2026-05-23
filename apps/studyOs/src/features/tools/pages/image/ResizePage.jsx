import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Maximize, 
  Image as ImageIcon, 
  Trash2, 
  Link, 
  Unlink, 
  Download,
  Scaling
} from 'lucide-react';
import ToolLayout from '../../components/ToolLayout';
import { useFileUpload } from '../../hooks/useFileUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

const ResizePage = () => {
  const [image, setImage] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [originalDims, setOriginalDims] = useState({ width: 0, height: 0 });
  const [lockAspect, setLockAspect] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const { onDragOver, onDragLeave, onDrop, handleFiles, isDragging } = useFileUpload({
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    onSuccess: (files) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          setDimensions({ width: img.width, height: img.height });
          setOriginalDims({ width: img.width, height: img.height });
          setImage(e.target.result);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(files[0]);
    }
  });

  const handleWidthChange = (val) => {
    const width = parseInt(val) || 0;
    if (lockAspect && originalDims.width > 0) {
      const height = Math.round((width / originalDims.width) * originalDims.height);
      setDimensions({ width, height });
    } else {
      setDimensions(d => ({ ...d, width }));
    }
  };

  const handleHeightChange = (val) => {
    const height = parseInt(val) || 0;
    if (lockAspect && originalDims.height > 0) {
      const width = Math.round((height / originalDims.height) * originalDims.width);
      setDimensions({ width, height });
    } else {
      setDimensions(d => ({ ...d, height }));
    }
  };

  const handleProcess = async () => {
    if (!image) return;
    setIsProcessing(true);
    try {
      const img = new Image();
      img.src = image;
      await new Promise(r => img.onload = r);

      const canvas = document.createElement('canvas');
      canvas.width = dimensions.width;
      canvas.height = dimensions.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, dimensions.width, dimensions.height);

      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `resized-${dimensions.width}x${dimensions.height}.jpg`;
        link.click();
        toast.success('Image resized successfully!');
        setIsProcessing(false);
      }, 'image/jpeg', 0.9);
    } catch (e) {
      toast.error('Failed to resize image');
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Resize Image"
      description="Change dimensions while maintaining quality"
      icon={Scaling}
      onAction={handleProcess}
      actionLabel="Download Resized"
      isProcessing={isProcessing}
    >
      <div className="h-full flex flex-col gap-6">
        {!image ? (
          <motion.div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={`flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-[2.5rem] transition-all ${
              isDragging ? 'border-primary bg-primary/5 scale-[0.99]' : 'border-muted-foreground/20 hover:border-primary/50'
            }`}
          >
            <div className="p-8 rounded-full bg-muted mb-6">
              <Maximize className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Drop your image to resize</h3>
            <p className="text-muted-foreground mb-8">Supports JPG, PNG, WEBP (Max 20MB)</p>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              id="resize-upload"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <Button variant="outline" className="rounded-full px-8 h-12 text-base font-bold" onClick={() => document.getElementById('resize-upload').click()}>
              Select File
            </Button>
          </motion.div>
        ) : (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3 flex items-center justify-center bg-black/5 rounded-[2.5rem] overflow-hidden p-8 border">
              <div className="relative group">
                <img 
                  src={image} 
                  alt="Preview" 
                  className="max-h-[60vh] rounded-xl shadow-2xl transition-all"
                  style={{ width: 'auto', height: 'auto', maxWidth: '100%' }}
                />
                <div className="absolute inset-0 border-2 border-primary/20 rounded-xl pointer-events-none" />
                <div className="absolute -bottom-4 -right-4 bg-primary text-primary-foreground px-3 py-1 rounded-lg text-xs font-bold shadow-lg">
                  {dimensions.width} x {dimensions.height}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="p-6 rounded-3xl bg-card border shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold">Dimensions</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Lock Aspect</span>
                    <Switch checked={lockAspect} onCheckedChange={setLockAspect} />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Width (px)</label>
                    <Input 
                      type="number" 
                      value={dimensions.width} 
                      onChange={(e) => handleWidthChange(e.target.value)}
                      className="rounded-xl h-12 bg-muted/50"
                    />
                  </div>

                  <div className="flex justify-center py-1">
                    {lockAspect ? <Link className="h-4 w-4 text-primary" /> : <Unlink className="h-4 w-4 text-muted-foreground" />}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Height (px)</label>
                    <Input 
                      type="number" 
                      value={dimensions.height} 
                      onChange={(e) => handleHeightChange(e.target.value)}
                      className="rounded-xl h-12 bg-muted/50"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Original:</span>
                    <span className="font-mono">{originalDims.width}x{originalDims.height}</span>
                  </div>
                </div>
              </div>

              <Button 
                variant="destructive" 
                className="w-full rounded-2xl h-12 gap-2"
                onClick={() => setImage(null)}
              >
                <Trash2 className="h-4 w-4" /> Remove Image
              </Button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default ResizePage;
