import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PDFDocument } from 'pdf-lib';
import * as pdfjs from 'pdfjs-dist';
import { 
  Scissors, 
  FileText, 
  Plus, 
  Trash2, 
  Download, 
  Split as SplitIcon,
  Check,
  X,
  FilePlus2,
  Columns
} from 'lucide-react';
import ToolLayout from '../../components/ToolLayout';
import { useFileUpload } from '../../hooks/useFileUpload';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';


// Set worker path for pdfjs
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;


const PdfSplitPage = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [pages, setPages] = useState([]); // { index, previewUrl, selected }
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
        const viewport = page.getViewport({ scale: 0.5 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport }).promise;
        newPages.push({
          index: i,
          previewUrl: canvas.toDataURL(),
          selected: true
        });
      }
      setPages(newPages);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load PDF pages');
    } finally {
      setIsProcessing(false);
    }
  };

  const togglePage = (index) => {
    setPages(prev => prev.map(p => p.index === index ? { ...p, selected: !p.selected } : p));
  };

  const handleSplit = async () => {
    const selectedIndices = pages.filter(p => p.selected).map(p => p.index - 1);
    if (selectedIndices.length === 0) {
      toast.error('Please select at least one page');
      return;
    }

    setIsProcessing(true);
    try {
      const pdfBytes = await pdfFile.arrayBuffer();
      const srcDoc = await PDFDocument.load(pdfBytes);
      const newDoc = await PDFDocument.create();
      
      const copiedPages = await newDoc.copyPages(srcDoc, selectedIndices);
      copiedPages.forEach(page => newDoc.addPage(page));

      const newPdfBytes = await newDoc.save();
      const blob = new Blob([newPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `split-${pdfFile.name}`;
      link.click();
      
      toast.success('PDF split successfully!');
    } catch (e) {
      console.error(e);
      toast.error('Failed to split PDF');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Split PDF"
      description="Extract specific pages or split document into parts"
      icon={SplitIcon}
      onAction={handleSplit}
      actionLabel="Extract Selected"
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
              <Columns className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Drop PDF to split</h3>
            <p className="text-muted-foreground mb-8">Select pages to extract into a new document</p>
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              id="split-upload"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <Button variant="outline" className="rounded-full px-8 h-12 text-base font-bold" onClick={() => document.getElementById('split-upload').click()}>
              Select PDF File
            </Button>
          </motion.div>
        ) : (
          <div className="flex-1 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="rounded-full px-4 py-1">
                  {pdfFile.name}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {pages.filter(p => p.selected).length} of {pages.length} pages selected
                </span>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="rounded-full" onClick={() => setPages(prev => prev.map(p => ({ ...p, selected: true })))}>
                  Select All
                </Button>
                <Button variant="ghost" size="sm" className="rounded-full" onClick={() => setPages(prev => prev.map(p => ({ ...p, selected: false })))}>
                  Deselect All
                </Button>
                <Button variant="destructive" size="sm" className="rounded-full" onClick={() => { setPdfFile(null); setPages([]); }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                <AnimatePresence>
                  {pages.map((page) => (
                    <motion.div
                      key={page.index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`relative group aspect-[3/4] rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${
                        page.selected ? 'border-primary shadow-lg shadow-primary/10' : 'border-transparent bg-muted/30'
                      }`}
                      onClick={() => togglePage(page.index)}
                    >
                      <img src={page.previewUrl} alt={`Page ${page.index}`} className="w-full h-full object-cover" />
                      <div className={`absolute inset-0 transition-colors ${page.selected ? 'bg-primary/5' : 'bg-transparent group-hover:bg-black/5'}`} />
                      
                      <div className="absolute top-3 left-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          page.selected ? 'bg-primary border-primary text-white' : 'bg-white/80 border-muted-foreground/30'
                        }`}>
                          {page.selected && <Check className="h-3.5 w-3.5" />}
                        </div>
                      </div>

                      <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white px-2 py-0.5 rounded-md text-[10px] font-bold">
                        {page.index}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default PdfSplitPage;
