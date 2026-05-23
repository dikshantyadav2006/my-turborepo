import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import { 
  Stamp, 
  FileText, 
  Plus, 
  Trash2, 
  Download, 
  Type,
  Settings2,
  Check,
  X,
  FilePlus2,
  Droplets
} from 'lucide-react';
import ToolLayout from '../../components/ToolLayout';
import { useFileUpload } from '../../hooks/useFileUpload';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';


const PdfWatermarkPage = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [watermarkText, setWatermarkText] = useState('STUDY OS');
  const [opacity, setOpacity] = useState(0.3);
  const [rotation, setRotation] = useState(45);
  const [fontSize, setFontSize] = useState(50);
  const [isProcessing, setIsProcessing] = useState(false);

  const { onDragOver, onDragLeave, onDrop, handleFiles, isDragging } = useFileUpload({
    allowedTypes: ['application/pdf'],
    onSuccess: (files) => {
      setPdfFile(files[0]);
    }
  });

  const handleWatermark = async () => {
    if (!pdfFile) return;
    setIsProcessing(true);
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const pages = pdfDoc.getPages();

      for (const page of pages) {
        const { width, height } = page.getSize();
        page.drawText(watermarkText, {
          x: width / 2 - (watermarkText.length * fontSize) / 4,
          y: height / 2,
          size: fontSize,
          font: font,
          color: rgb(0.5, 0.5, 0.5),
          opacity: opacity,
          rotate: degrees(rotation),
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `watermarked-${pdfFile.name}`;
      link.click();
      
      toast.success('Watermark added successfully!');
    } catch (e) {
      console.error(e);
      toast.error('Failed to add watermark');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Add Watermark"
      description="Protect your documents with a text watermark"
      icon={Stamp}
      onAction={handleWatermark}
      actionLabel="Download Watermarked"
      isProcessing={isProcessing}
    >
      <div className="h-full flex flex-col gap-6">
        {!pdfFile ? (
          <motion.div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={`flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-[2.5rem] transition-all ${
              isDragging ? 'border-primary bg-primary/5 scale-[0.99]' : 'border-muted-foreground/20 hover:border-primary/50'
            }`}
          >
            <div className="p-8 rounded-full bg-muted mb-6">
              <Stamp className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Drop PDF here</h3>
            <p className="text-muted-foreground mb-8">Add text watermarks to all pages instantly</p>
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              id="watermark-upload"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <Button variant="outline" className="rounded-full px-8 h-12 text-base font-bold" onClick={() => document.getElementById('watermark-upload').click()}>
              Select PDF
            </Button>
          </motion.div>
        ) : (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-8 overflow-hidden">
            <div className="lg:col-span-3 flex flex-col gap-4 overflow-hidden">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="rounded-full">
                  {pdfFile.name}
                </Badge>
                <Button variant="ghost" size="sm" onClick={() => setPdfFile(null)} className="rounded-full h-8 w-8 p-0">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex-1 bg-muted/20 rounded-[2.5rem] border shadow-inner flex items-center justify-center p-8 relative overflow-hidden">
                <div className="w-full max-w-md aspect-[3/4] bg-white shadow-2xl rounded-lg border flex items-center justify-center relative overflow-hidden">
                  <div className="text-muted-foreground/20 text-xs text-center p-10">
                    PDF Preview Placeholder
                  </div>
                  <motion.div 
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    animate={{ rotate: rotation }}
                  >
                    <span 
                      style={{ 
                        opacity: opacity, 
                        fontSize: fontSize + 'px', 
                        color: 'gray',
                        fontWeight: 'bold',
                        fontFamily: 'sans-serif'
                      }}
                    >
                      {watermarkText || 'WATERMARK'}
                    </span>
                  </motion.div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="p-6 rounded-3xl bg-card border shadow-sm space-y-6">
                <div className="flex items-center gap-2">
                  <Settings2 className="h-4 w-4 text-primary" />
                  <h3 className="font-bold text-sm uppercase">Watermark Settings</h3>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground">Text</label>
                    <Input 
                      value={watermarkText} 
                      onChange={(e) => setWatermarkText(e.target.value)}
                      className="rounded-xl h-12 bg-muted/50"
                      placeholder="e.g. CONFIDENTIAL"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-muted-foreground">Opacity</label>
                      <span className="text-xs font-mono">{Math.round(opacity * 100)}%</span>
                    </div>
                    <Slider 
                      value={[opacity]} 
                      min={0.1} 
                      max={1} 
                      step={0.05} 
                      onValueChange={([val]) => setOpacity(val)} 
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-muted-foreground">Rotation</label>
                      <span className="text-xs font-mono">{rotation}°</span>
                    </div>
                    <Slider 
                      value={[rotation]} 
                      min={0} 
                      max={360} 
                      step={15} 
                      onValueChange={([val]) => setRotation(val)} 
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-muted-foreground">Font Size</label>
                      <span className="text-xs font-mono">{fontSize}px</span>
                    </div>
                    <Slider 
                      value={[fontSize]} 
                      min={10} 
                      max={200} 
                      step={5} 
                      onValueChange={([val]) => setFontSize(val)} 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default PdfWatermarkPage;
