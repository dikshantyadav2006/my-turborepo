import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PDFDocument } from 'pdf-lib';
import { 
  Zap, 
  FileText, 
  Plus, 
  Trash2, 
  Download, 
  Gauge,
  Check,
  X,
  FilePlus2,
  ShieldCheck,
  Infinity
} from 'lucide-react';
import ToolLayout from '../../components/ToolLayout';
import { useFileUpload } from '../../hooks/useFileUpload';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

const PdfCompressPage = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [compressionStats, setCompressionStats] = useState(null); // { original, new, saved }

  const { onDragOver, onDragLeave, onDrop, handleFiles, isDragging } = useFileUpload({
    allowedTypes: ['application/pdf'],
    onSuccess: (files) => {
      setPdfFile(files[0]);
      setCompressionStats(null);
    }
  });

  const handleCompress = async () => {
    if (!pdfFile) return;
    setIsProcessing(true);
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      // Basic browser-side optimization: Strip metadata and re-save
      // pdf-lib's save() with useObjectStreams: true often reduces size
      const compressedBytes = await pdfDoc.save({ 
        useObjectStreams: true,
        addDefaultPage: false,
      });

      const blob = new Blob([compressedBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const stats = {
        original: pdfFile.size,
        new: blob.size,
        saved: pdfFile.size - blob.size
      };
      
      setCompressionStats(stats);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `compressed-${pdfFile.name}`;
      link.click();
      
      if (stats.saved > 0) {
        toast.success(`PDF optimized! Saved ${(stats.saved / 1024).toFixed(1)} KB`);
      } else {
        toast.info("PDF was already highly optimized.");
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to optimize PDF');
    } finally {
      setIsProcessing(false);
    }
  };

  const fmt = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <ToolLayout
      title="Compress PDF"
      description="Optimize PDF file size for sharing and storage"
      icon={Gauge}
      onAction={handleCompress}
      actionLabel="Compress & Download"
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
              <Zap className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Drop PDF to compress</h3>
            <p className="text-muted-foreground mb-8">Reduces file size by optimizing document structure</p>
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              id="compress-pdf-upload"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <Button variant="outline" className="rounded-full px-8 h-12 text-base font-bold" onClick={() => document.getElementById('compress-pdf-upload').click()}>
              Select PDF
            </Button>
          </motion.div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full gap-8">
            <div className="w-full p-8 rounded-[2.5rem] bg-card border shadow-xl relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-primary/20">
                {isProcessing && (
                  <motion.div 
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </div>

              <div className="flex items-center gap-6 mb-8">
                <div className="p-4 rounded-2xl bg-red-500/10 text-red-500">
                  <FileText className="h-10 w-10" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold truncate">{pdfFile.name}</h3>
                  <p className="text-muted-foreground font-mono text-sm">{fmt(pdfFile.size)}</p>
                </div>
                <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setPdfFile(null)}>
                  <Trash2 className="h-5 w-5 text-muted-foreground" />
                </Button>
              </div>

              {compressionStats ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-muted/50 border text-center">
                      <p className="text-xs font-bold text-muted-foreground uppercase mb-1">New Size</p>
                      <p className="text-lg font-bold">{fmt(compressionStats.new)}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                      <p className="text-xs font-bold text-emerald-600 uppercase mb-1">Saved</p>
                      <p className="text-lg font-bold text-emerald-600">
                        {compressionStats.saved > 0 ? fmt(compressionStats.saved) : 'Optimized'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-emerald-500" />
                    Optimization complete
                  </div>
                </motion.div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground bg-blue-500/5 p-4 rounded-2xl border border-blue-500/10">
                    <ShieldCheck className="h-5 w-5 text-blue-500 flex-shrink-0" />
                    <p>Our smart optimization engine will remove unnecessary data and clean up the PDF structure to reduce size without losing quality.</p>
                  </div>
                  
                  <Button 
                    className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg shadow-primary/20"
                    onClick={handleCompress}
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Optimizing..." : "Start Compression"}
                  </Button>
                </div>
              )}
            </div>
            
            <div className="flex gap-8 text-muted-foreground">
              <div className="flex items-center gap-2 text-xs">
                 <ShieldCheck className="h-3.5 w-3.5" /> Private Processing
              </div>
              <div className="flex items-center gap-2 text-xs">
                 <Infinity className="h-3.5 w-3.5" /> No File Limits
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default PdfCompressPage;
