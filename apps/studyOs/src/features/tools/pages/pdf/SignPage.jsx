import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PDFDocument } from 'pdf-lib';
import * as pdfjs from 'pdfjs-dist';
import { 
  PenTool, 
  FileText, 
  Plus, 
  Trash2, 
  Download, 
  Check,
  X,
  RotateCcw,
  MousePointer2,
  Image as ImageIcon
} from 'lucide-react';
import ToolLayout from '../../components/ToolLayout';
import { useFileUpload } from '../../hooks/useFileUpload';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const PdfSignPage = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [pages, setPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [signature, setSignature] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const signatureCanvasRef = useRef(null);
  const [placedSignatures, setPlacedSignatures] = useState([]); // { x, y, pageIndex, image }

  const { onDragOver, onDragLeave, onDrop, handleFiles, isDragging } = useFileUpload({
    allowedTypes: ['application/pdf'],
    onSuccess: async (files) => {
      const file = files[0];
      setPdfFile(file);
      await generatePreviews(file);
    }
  });

  const generatePreviews = async (file) => {
    setIsProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;
      const newPages = [];

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.0 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport }).promise;
        newPages.push({
          index: i,
          previewUrl: canvas.toDataURL(),
          width: viewport.width,
          height: viewport.height
        });
      }
      setPages(newPages);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load PDF');
    } finally {
      setIsProcessing(false);
    }
  };

  const startDrawing = (e) => {
    const canvas = signatureCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = signatureCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const endDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = signatureCanvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignature(null);
  };

  const saveSignature = () => {
    const canvas = signatureCanvasRef.current;
    setSignature(canvas.toDataURL());
    toast.success("Signature saved! Click on the PDF to place it.");
  };

  const placeSignature = (e) => {
    if (!signature) {
      toast.error("Please create a signature first");
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setPlacedSignatures(prev => [...prev, { x, y, pageIndex: currentPage, image: signature }]);
  };

  const handleDownload = async () => {
    if (placedSignatures.length === 0) {
      toast.error("No signatures placed");
      return;
    }

    setIsProcessing(true);
    try {
      const pdfBytes = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);
      
      for (const sig of placedSignatures) {
        const page = pdfDoc.getPages()[sig.pageIndex];
        const signatureImage = await pdfDoc.embedPng(sig.image);
        
        // Convert screen coordinates to PDF coordinates
        // screen y starts from top, PDF y starts from bottom
        const { height } = page.getSize();
        const displayWidth = pages[sig.pageIndex].width;
        const displayHeight = pages[sig.pageIndex].height;
        
        const scaleX = page.getWidth() / displayWidth;
        const scaleY = page.getHeight() / displayHeight;

        page.drawImage(signatureImage, {
          x: sig.x * scaleX - 50,
          y: height - (sig.y * scaleY) - 25,
          width: 100,
          height: 50,
        });
      }

      const newPdfBytes = await pdfDoc.save();
      const blob = new Blob([newPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `signed-${pdfFile.name}`;
      link.click();
      
      toast.success('PDF signed successfully!');
    } catch (e) {
      console.error(e);
      toast.error('Failed to sign PDF');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Sign PDF"
      description="Draw your signature and place it anywhere in the document"
      icon={PenTool}
      onAction={handleDownload}
      actionLabel="Download Signed PDF"
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
              <PenTool className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Drop PDF to sign</h3>
            <p className="text-muted-foreground mb-8">Sign documents with your own handwriting</p>
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              id="sign-upload"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <Button variant="outline" className="rounded-full px-8 h-12 text-base font-bold" onClick={() => document.getElementById('sign-upload').click()}>
              Select PDF
            </Button>
          </motion.div>
        ) : (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-8 overflow-hidden">
            <div className="lg:col-span-3 flex flex-col gap-4 overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={currentPage === 0}
                    onClick={() => setCurrentPage(p => p - 1)}
                    className="rounded-full"
                  >
                    Prev
                  </Button>
                  <span className="text-sm font-bold">Page {currentPage + 1} of {pages.length}</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={currentPage === pages.length - 1}
                    onClick={() => setCurrentPage(p => p + 1)}
                    className="rounded-full"
                  >
                    Next
                  </Button>
                </div>
                <Button variant="destructive" size="sm" onClick={() => { setPdfFile(null); setPages([]); setPlacedSignatures([]); }} className="rounded-full">
                  <Trash2 className="h-4 w-4 mr-2" /> Reset
                </Button>
              </div>
              
              <div className="flex-1 bg-muted/30 rounded-[2.5rem] border shadow-inner flex items-center justify-center p-8 overflow-auto">
                <div 
                  className="relative shadow-2xl border bg-white cursor-crosshair"
                  onClick={placeSignature}
                  style={{ 
                    width: pages[currentPage]?.width, 
                    height: pages[currentPage]?.height 
                  }}
                >
                  <img src={pages[currentPage]?.previewUrl} alt="Page" className="w-full h-full" />
                  
                  {placedSignatures.filter(s => s.pageIndex === currentPage).map((sig, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute pointer-events-none"
                      style={{ 
                        left: sig.x - 50, 
                        top: sig.y - 25,
                        width: 100,
                        height: 50
                      }}
                    >
                      <img src={sig.image} className="w-full h-full object-contain" />
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="p-6 rounded-3xl bg-card border shadow-sm space-y-6">
                <div className="flex items-center gap-2 text-primary">
                  <PenTool className="h-4 w-4" />
                  <h3 className="font-bold text-sm uppercase">Draw Signature</h3>
                </div>

                <div className="bg-white border-2 border-muted rounded-2xl overflow-hidden aspect-[2/1] relative">
                  <canvas
                    ref={signatureCanvasRef}
                    width={300}
                    height={150}
                    className="w-full h-full cursor-crosshair"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={endDrawing}
                    onMouseLeave={endDrawing}
                  />
                  {!signature && !isDrawing && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-muted-foreground/30 text-xs font-bold">
                      Draw here
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" size="sm" onClick={clearSignature} className="rounded-xl">
                    <RotateCcw className="h-4 w-4 mr-2" /> Clear
                  </Button>
                  <Button variant="default" size="sm" onClick={saveSignature} className="rounded-xl font-bold">
                    <Check className="h-4 w-4 mr-2" /> Use
                  </Button>
                </div>
                
                {signature && (
                  <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 flex flex-col gap-2">
                    <div className="text-[10px] font-bold text-primary uppercase">Active Signature</div>
                    <img src={signature} className="h-10 object-contain" />
                  </div>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-muted/50 border text-[11px] text-muted-foreground leading-relaxed">
                <p className="font-bold mb-1 flex items-center gap-1">
                  <MousePointer2 className="h-3 w-3" /> Instructions:
                </p>
                1. Draw your signature above.<br/>
                2. Click 'Use' to save it.<br/>
                3. Click anywhere on the PDF to place it.
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default PdfSignPage;
