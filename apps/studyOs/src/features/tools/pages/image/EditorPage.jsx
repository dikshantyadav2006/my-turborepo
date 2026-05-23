import React, { useState, useEffect, useRef } from 'react';
import * as fabric from 'fabric';
import { motion } from 'framer-motion';
import { 
  Type, 
  Droplet, 
  Image as ImageIcon, 
  Trash2, 
  Download,
  MousePointer2,
  Square,
  Undo2,
  Redo2,
  Eraser,
  PenTool
} from 'lucide-react';
import ToolLayout from '../../components/ToolLayout';
import { useFileUpload } from '../../hooks/useFileUpload';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';

const ImageEditorPage = () => {
  const [image, setImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef(null);
  const fabricCanvas = useRef(null);
  const [activeTool, setActiveTool] = useState('select');
  const [blurStrength, setBlurStrength] = useState(10);

  const { onDragOver, onDragLeave, onDrop, handleFiles, isDragging } = useFileUpload({
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    onSuccess: (files) => {
      const reader = new FileReader();
      reader.onload = (e) => setImage(e.target.result);
      reader.readAsDataURL(files[0]);
    }
  });

  useEffect(() => {
    if (image && canvasRef.current) {
      fabricCanvas.current = new fabric.Canvas(canvasRef.current, {
        width: 800,
        height: 600,
        backgroundColor: '#f8fafc'
      });

      fabric.Image.fromURL(image, (img) => {
        const scale = Math.min(800 / img.width, 600 / img.height);
        img.set({
          scaleX: scale,
          scaleY: scale,
          selectable: false,
          evented: false,
        });
        fabricCanvas.current.add(img);
        fabricCanvas.current.centerObject(img);
        fabricCanvas.current.renderAll();
      });

      return () => {
        fabricCanvas.current.dispose();
      };
    }
  }, [image]);

  const addText = () => {
    const text = new fabric.IText('Edit me', {
      left: 100,
      top: 100,
      fontFamily: 'Inter',
      fontSize: 40,
      fill: '#000000',
    });
    fabricCanvas.current.add(text);
    fabricCanvas.current.setActiveObject(text);
  };

  const addBlurArea = () => {
    const rect = new fabric.Rect({
      left: 150,
      top: 150,
      width: 200,
      height: 100,
      fill: 'rgba(255,255,255,0.3)',
      stroke: 'rgba(0,0,0,0.1)',
      strokeWidth: 1,
    });
    
    // In a real app, we'd apply a blur filter to the area underneath
    // For now, we'll simulate it with a frosted glass look
    rect.set({
      shadow: new fabric.Shadow({
        color: 'rgba(0,0,0,0.1)',
        blur: 20,
        offsetX: 0,
        offsetY: 0
      })
    });
    
    fabricCanvas.current.add(rect);
    fabricCanvas.current.setActiveObject(rect);
    toast.info("Blur area added. Position it over sensitive info.");
  };

  const handleDownload = () => {
    if (!fabricCanvas.current) return;
    setIsProcessing(true);
    try {
      const dataURL = fabricCanvas.current.toDataURL({
        format: 'jpeg',
        quality: 0.9,
      });
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = `edited-${Date.now()}.jpg`;
      link.click();
      toast.success('Image exported successfully!');
    } catch (e) {
      toast.error('Export failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Image Editor"
      description="Blur sensitive areas, add text, and annotate"
      icon={PenTool}
      onAction={handleDownload}
      actionLabel="Export Image"
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
              <PenTool className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Drop image to edit</h3>
            <p className="text-muted-foreground mb-8">Add text, blur areas, or draw</p>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              id="editor-upload"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <Button variant="outline" className="rounded-full px-8 h-12 text-base font-bold" onClick={() => document.getElementById('editor-upload').click()}>
              Start Editing
            </Button>
          </motion.div>
        ) : (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3 flex flex-col gap-4">
              {/* Toolbar */}
              <div className="flex items-center gap-2 p-2 rounded-2xl bg-muted/50 border self-start">
                <Button 
                  variant={activeTool === 'select' ? 'default' : 'ghost'} 
                  size="icon" 
                  className="rounded-xl"
                  onClick={() => setActiveTool('select')}
                >
                  <MousePointer2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-xl" onClick={addText}>
                  <Type className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-xl" onClick={addBlurArea}>
                  <Droplet className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-xl">
                  <Square className="h-4 w-4" />
                </Button>
                <div className="w-px h-6 bg-border mx-1" />
                <Button variant="ghost" size="icon" className="rounded-xl">
                  <Undo2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-xl">
                  <Redo2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Canvas Area */}
              <div className="flex-1 bg-muted/20 rounded-[2.5rem] border shadow-inner flex items-center justify-center p-8 overflow-hidden">
                <div className="shadow-2xl rounded-lg overflow-hidden bg-white">
                  <canvas ref={canvasRef} />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="p-6 rounded-3xl bg-card border shadow-sm space-y-6">
                <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Editor Options</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold">Selection Color</label>
                    <div className="flex gap-2">
                      {['#000000', '#ffffff', '#3b82f6', '#ef4444', '#10b981'].map(color => (
                        <button 
                          key={color}
                          className="w-6 h-6 rounded-full border border-black/10"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-muted-foreground uppercase">Opacity</label>
                      <span className="text-xs font-mono">100%</span>
                    </div>
                    <Slider defaultValue={[100]} max={100} step={1} />
                  </div>
                </div>

                <div className="pt-4 border-t space-y-2">
                  <Button variant="outline" className="w-full rounded-xl justify-start gap-3" onClick={() => {
                    const active = fabricCanvas.current.getActiveObject();
                    if (active) fabricCanvas.current.remove(active);
                  }}>
                    <Eraser className="h-4 w-4" /> Delete Selected
                  </Button>
                </div>
              </div>

              <Button 
                variant="destructive" 
                className="w-full rounded-2xl h-12 gap-2"
                onClick={() => setImage(null)}
              >
                <Trash2 className="h-4 w-4" /> Discard All
              </Button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default ImageEditorPage;
