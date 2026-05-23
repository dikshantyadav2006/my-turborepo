import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Eraser, 
  Image as ImageIcon, 
  Trash2, 
  Download,
  Pipette,
  Layers,
  Settings,
  Check,
  Zap
} from 'lucide-react';
import ToolLayout from '../../components/ToolLayout';
import { useFileUpload } from '../../hooks/useFileUpload';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';


const BackgroundRemoverPage = () => {
  const [image, setImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef(null);
  const [tolerance, setTolerance] = useState(30);
  const [targetColor, setTargetColor] = useState({ r: 255, g: 255, b: 255 });
  const [originalImage, setOriginalImage] = useState(null);

  const { onDragOver, onDragLeave, onDrop, handleFiles, isDragging } = useFileUpload({
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    onSuccess: (files) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          setOriginalImage(img);
          setImage(e.target.result);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(files[0]);
    }
  });

  useEffect(() => {
    if (originalImage && canvasRef.current) {
      processImage();
    }
  }, [originalImage, tolerance, targetColor]);

  const processImage = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Scale canvas to fit image
    const maxWidth = 800;
    const scale = Math.min(1, maxWidth / originalImage.width);
    canvas.width = originalImage.width * scale;
    canvas.height = originalImage.height * scale;
    
    ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      const distance = Math.sqrt(
        Math.pow(r - targetColor.r, 2) +
        Math.pow(g - targetColor.g, 2) +
        Math.pow(b - targetColor.b, 2)
      );
      
      if (distance < tolerance) {
        data[i + 3] = 0; // Set alpha to 0
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
  };

  const pickColor = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvasRef.current.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvasRef.current.height;
    
    const ctx = canvasRef.current.getContext('2d');
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    
    setTargetColor({ r: pixel[0], g: pixel[1], b: pixel[2] });
    toast.info("Color selected for removal");
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    setIsProcessing(true);
    const link = document.createElement('a');
    link.href = canvasRef.current.toDataURL('image/png');
    link.download = `no-bg-${Date.now()}.png`;
    link.click();
    setIsProcessing(false);
    toast.success('Image exported as PNG!');
  };

  return (
    <ToolLayout
      title="Background Remover"
      description="Remove solid backgrounds or signatures instantly"
      icon={Eraser}
      onAction={handleDownload}
      actionLabel="Download PNG"
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
              <Eraser className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Drop image to remove background</h3>
            <p className="text-muted-foreground mb-8">Works best for solid colors, logos, and signatures</p>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              id="bg-upload"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <Button variant="outline" className="rounded-full px-8 h-12 text-base font-bold" onClick={() => document.getElementById('bg-upload').click()}>
              Select Image
            </Button>
          </motion.div>
        ) : (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-8 overflow-hidden">
            <div className="lg:col-span-3 flex flex-col gap-4 overflow-hidden">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="gap-2 px-3 py-1.5 rounded-full">
                  <Pipette className="h-3.5 w-3.5 text-primary" />
                  Click on the image to select background color
                </Badge>
                <Button variant="ghost" size="sm" onClick={() => setImage(null)} className="rounded-full h-8 w-8 p-0">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex-1 bg-[url('https://www.transparenttextures.com/patterns/checkerboard.png')] bg-repeat rounded-[2.5rem] border shadow-inner flex items-center justify-center p-8 overflow-hidden cursor-crosshair">
                <canvas 
                  ref={canvasRef} 
                  onClick={pickColor}
                  className="max-w-full max-h-full rounded-lg shadow-2xl transition-all hover:ring-4 hover:ring-primary/20"
                />
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="p-6 rounded-3xl bg-card border shadow-sm space-y-6">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-primary" />
                  <h3 className="font-bold text-sm uppercase tracking-wider">Adjustment</h3>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-muted-foreground">Tolerance</label>
                      <span className="text-xs font-mono">{tolerance}</span>
                    </div>
                    <Slider 
                      value={[tolerance]} 
                      min={1} 
                      max={150} 
                      step={1} 
                      onValueChange={([val]) => setTolerance(val)} 
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground">Target Color</label>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border">
                      <div 
                        className="w-8 h-8 rounded-lg border border-black/10 shadow-sm" 
                        style={{ backgroundColor: `rgb(${targetColor.r}, ${targetColor.g}, ${targetColor.b})` }}
                      />
                      <div className="text-[10px] font-mono text-muted-foreground">
                        RGB({targetColor.r}, {targetColor.g}, {targetColor.b})
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t space-y-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Zap className="h-3.5 w-3.5 text-primary" />
                    <span>Processing locally for speed</span>
                  </div>
                  <Button variant="outline" className="w-full rounded-xl" onClick={() => setTargetColor({ r: 255, g: 255, b: 255 })}>
                    Reset to White
                  </Button>
                </div>
              </div>
              
              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 text-[11px] text-muted-foreground leading-relaxed italic">
                Tip: Higher tolerance removes more similar colors. Use the picker for complex backgrounds.
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default BackgroundRemoverPage;
