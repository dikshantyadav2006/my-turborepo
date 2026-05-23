import React, { useState } from 'react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import { PDFDocument } from 'pdf-lib';
import * as pdfjs from 'pdfjs-dist';
import { 
  Layout, 
  FileText, 
  Plus, 
  Trash2, 
  Download, 
  GripVertical,
  RotateCw,
  X,
  FilePlus2,
  Columns,
  Grid3X3
} from 'lucide-react';
import ToolLayout from '../../components/ToolLayout';
import { useFileUpload } from '../../hooks/useFileUpload';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';


pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;


const PdfOrganizePage = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [pages, setPages] = useState([]); // { id, originalIndex, previewUrl, rotation }
  const [isProcessing, setIsProcessing] = useState(false);

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
        const viewport = page.getViewport({ scale: 0.4 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport }).promise;
        newPages.push({
          id: `page-${i}-${Math.random().toString(36).substring(7)}`,
          originalIndex: i - 1,
          previewUrl: canvas.toDataURL(),
          rotation: 0
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

  const rotatePage = (id) => {
    setPages(prev => prev.map(p => p.id === id ? { ...p, rotation: (p.rotation + 90) % 360 } : p));
  };

  const deletePage = (id) => {
    setPages(prev => prev.filter(p => p.id !== id));
    toast.info("Page removed");
  };

  const handleSave = async () => {
    if (pages.length === 0) {
      toast.error('PDF must have at least one page');
      return;
    }

    setIsProcessing(true);
    try {
      const pdfBytes = await pdfFile.arrayBuffer();
      const srcDoc = await PDFDocument.load(pdfBytes);
      const newDoc = await PDFDocument.create();
      
      for (const pageObj of pages) {
        const [copiedPage] = await newDoc.copyPages(srcDoc, [pageObj.originalIndex]);
        if (pageObj.rotation !== 0) {
          const currentRotation = copiedPage.getRotation().angle;
          copiedPage.setRotation({ angle: (currentRotation + pageObj.rotation) % 360 });
        }
        newDoc.addPage(copiedPage);
      }

      const newPdfBytes = await newDoc.save();
      const blob = new Blob([newPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `organized-${pdfFile.name}`;
      link.click();
      
      toast.success('PDF organized and saved!');
    } catch (e) {
      console.error(e);
      toast.error('Failed to save PDF');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Organize PDF"
      description="Rearrange, rotate, or delete pages with ease"
      icon={Grid3X3}
      onAction={handleSave}
      actionLabel="Save Changes"
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
              <Grid3X3 className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Drop PDF to organize</h3>
            <p className="text-muted-foreground mb-8">Rearrange pages visually</p>
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              id="organize-upload"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <Button variant="outline" className="rounded-full px-8 h-12 text-base font-bold" onClick={() => document.getElementById('organize-upload').click()}>
              Select PDF
            </Button>
          </motion.div>
        ) : (
          <div className="flex-1 flex flex-col gap-6 overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 transition-colors">
                  {pdfFile.name}
                </Badge>
                <span className="text-sm text-muted-foreground font-medium">
                  {pages.length} Pages
                </span>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground hover:text-destructive" onClick={() => setPdfFile(null)}>
                  <X className="h-4 w-4 mr-2" /> Cancel
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 pb-10">
              <Reorder.Group 
                axis="y" 
                values={pages} 
                onReorder={setPages} 
                className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6"
              >
                <AnimatePresence>
                  {pages.map((page, index) => (
                    <Reorder.Item
                      key={page.id}
                      value={page}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="group relative aspect-[3/4] rounded-2xl overflow-hidden border bg-card shadow-sm hover:shadow-xl hover:border-primary/30 transition-all cursor-grab active:cursor-grabbing"
                    >
                      <div className="w-full h-full p-2">
                        <motion.img 
                          src={page.previewUrl} 
                          alt={`Page ${index + 1}`} 
                          className="w-full h-full object-contain rounded-lg shadow-sm"
                          animate={{ rotate: page.rotation }}
                        />
                      </div>
                      
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                        <GripVertical className="h-6 w-6 text-white mb-2" />
                        <div className="flex gap-2">
                          <Button 
                            variant="secondary" 
                            size="icon" 
                            className="h-9 w-9 rounded-full bg-white/20 hover:bg-white/40 text-white border-0"
                            onClick={(e) => { e.stopPropagation(); rotatePage(page.id); }}
                          >
                            <RotateCw className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="icon" 
                            className="h-9 w-9 rounded-full shadow-lg"
                            onClick={(e) => { e.stopPropagation(); deletePage(page.id); }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md text-white px-2 py-0.5 rounded-md text-[10px] font-bold">
                        {index + 1}
                      </div>
                    </Reorder.Item>
                  ))}
                </AnimatePresence>
              </Reorder.Group>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default PdfOrganizePage;
