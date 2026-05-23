import React, { useState } from 'react';
import { motion, Reorder } from 'framer-motion';
import { PDFDocument } from 'pdf-lib';
import { 
  FileText, 
  Plus, 
  Trash2, 
  GripVertical, 
  Download, 
  Layers,
  FilePlus2,
  X
} from 'lucide-react';
import ToolLayout from '../../components/ToolLayout';
import { useFileUpload } from '../../hooks/useFileUpload';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const PdfMergePage = () => {
  const [pdfFiles, setPdfFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const { onDragOver, onDragLeave, onDrop, handleFiles, isDragging } = useFileUpload({
    allowedTypes: ['application/pdf'],
    onSuccess: (files) => {
      const newFiles = Array.from(files).map(file => ({
        id: Math.random().toString(36).substring(7),
        file,
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2) + ' MB'
      }));
      setPdfFiles(prev => [...prev, ...newFiles]);
    }
  });

  const removeFile = (id) => {
    setPdfFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleMerge = async () => {
    if (pdfFiles.length < 2) {
      toast.error('Please add at least 2 PDF files to merge');
      return;
    }

    setIsProcessing(true);
    try {
      const mergedPdf = await PDFDocument.create();
      
      for (const pdfObj of pdfFiles) {
        const pdfBytes = await pdfObj.file.arrayBuffer();
        const pdf = await PDFDocument.load(pdfBytes);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `merged-${Date.now()}.pdf`;
      link.click();
      
      toast.success('PDFs merged successfully!');
    } catch (e) {
      console.error(e);
      toast.error('Failed to merge PDFs');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Merge PDF"
      description="Combine multiple PDF files into a single document"
      icon={Layers}
      onAction={handleMerge}
      actionLabel="Merge & Download"
      isProcessing={isProcessing}
    >
      <div className="h-full flex flex-col gap-6">
        <motion.div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`relative min-h-[200px] flex flex-col items-center justify-center border-2 border-dashed rounded-[2.5rem] transition-all p-8 ${
            isDragging ? 'border-primary bg-primary/5 scale-[0.99]' : 'border-muted-foreground/20 hover:border-primary/50'
          }`}
        >
          <div className="p-4 rounded-2xl bg-muted mb-4">
            <Plus className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold mb-2">Add more PDFs</h3>
          <p className="text-muted-foreground text-sm mb-6">Drag and drop or click to select files</p>
          <input
            type="file"
            accept="application/pdf"
            multiple
            className="hidden"
            id="pdf-upload"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <Button variant="outline" className="rounded-full px-8 h-12 font-bold" onClick={() => document.getElementById('pdf-upload').click()}>
            <FilePlus2 className="h-4 w-4 mr-2" /> Select PDFs
          </Button>
        </motion.div>

        {pdfFiles.length > 0 && (
          <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between px-2">
              <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                Files to merge ({pdfFiles.length})
              </h4>
              <p className="text-xs text-muted-foreground italic">Drag to reorder</p>
            </div>

            <Reorder.Group axis="y" values={pdfFiles} onReorder={setPdfFiles} className="space-y-3">
              {pdfFiles.map((file) => (
                <Reorder.Item
                  key={file.id}
                  value={file}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="group flex items-center gap-4 p-4 rounded-2xl bg-card border shadow-sm hover:border-primary/30 transition-all cursor-grab active:cursor-grabbing"
                >
                  <div className="text-muted-foreground group-hover:text-primary transition-colors">
                    <GripVertical className="h-5 w-5" />
                  </div>
                  <div className="p-2.5 rounded-xl bg-red-500/10 text-red-500">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-sm truncate">{file.name}</h5>
                    <p className="text-xs text-muted-foreground">{file.size}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-full hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeFile(file.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </div>
        )}

        {pdfFiles.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-muted-foreground/40 italic">
            No files added yet
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default PdfMergePage;
