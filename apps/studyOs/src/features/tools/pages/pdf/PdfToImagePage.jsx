import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as pdfjs from 'pdfjs-dist';
import { 
  FileImage, 
  FileText, 
  Plus, 
  Trash2, 
  Download, 
  ImageIcon,
  Check,
  X,
  FilePlus2,
  FileVideo,
  Settings2
} from 'lucide-react';
import ToolLayout from '../../components/ToolLayout';
import { useFileUpload } from '../../hooks/useFileUpload';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';
import JSZip from 'jszip';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const PdfToImagePage = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [pages, setPages] = useState([]); 
  const [isProcessing, setIsProcessing] = useState(false);
  const [format, setFormat] = useState('png');
  const [scale, setScale] = useState('2');

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
        const viewport = page.getViewport({ scale: 0.3 });
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
      toast.error('Failed to load PDF');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConvert = async () => {
    const selectedPages = pages.filter(p => p.selected);
    if (selectedPages.length === 0) {
      toast.error('Please select at least one page');
      return;
    }

    setIsProcessing(true);
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      const zip = new JSZip();
      
      toast.info(`Converting ${selectedPages.length} pages...`);

      for (const pageObj of selectedPages) {
        const page = await pdf.getPage(pageObj.index);
        const viewport = page.getViewport({ scale: parseFloat(scale) });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport }).promise;
        const dataUrl = canvas.toDataURL(`image/${format}`, 0.9);
        const base64Data = dataUrl.split(',')[1];
        zip.file(`page-${pageObj.index}.${format}`, base64Data, { base64: true });
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `pdf-images-${Date.now()}.zip`;
      link.click();
      
      toast.success('Successfully converted PDF pages to images!');
    } catch (e) {
      console.error(e);
      toast.error('Conversion failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="PDF to Image"
      description="Convert PDF pages into high-quality JPG or PNG images"
      icon={ImageIcon}
      onAction={handleConvert}
      actionLabel="Convert to Images"
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
              <ImageIcon className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Drop PDF here</h3>
            <p className="text-muted-foreground mb-8">Each page will be converted to a separate image</p>
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              id="pdf-to-img-upload"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <Button variant="outline" className="rounded-full px-8 h-12 text-base font-bold" onClick={() => document.getElementById('pdf-to-img-upload').click()}>
              Select PDF
            </Button>
          </motion.div>
        ) : (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-8 overflow-hidden">
            <div className="lg:col-span-3 flex flex-col gap-4 overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    Pages to Convert ({pages.filter(p => p.selected).length})
                  </h4>
                </div>
                <div className="flex gap-2">
                   <Button variant="ghost" size="sm" className="rounded-full" onClick={() => setPages(prev => prev.map(p => ({ ...p, selected: true })))}>
                    Select All
                  </Button>
                  <Button variant="destructive" size="sm" className="rounded-full h-8 w-8 p-0" onClick={() => setPdfFile(null)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto pr-2">
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
                  {pages.map((page) => (
                    <div 
                      key={page.index} 
                      className={`relative aspect-[3/4] rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                        page.selected ? 'border-primary shadow-md' : 'border-transparent bg-muted/20 grayscale opacity-60'
                      }`}
                      onClick={() => setPages(prev => prev.map(p => p.index === page.index ? { ...p, selected: !p.selected } : p))}
                    >
                      <img src={page.previewUrl} alt={`Page ${page.index}`} className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-white/90 border flex items-center justify-center">
                        {page.selected && <Check className="h-3 w-3 text-primary stroke-[3px]" />}
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                        {page.index}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="p-6 rounded-3xl bg-card border shadow-sm space-y-6">
                <div className="flex items-center gap-2">
                  <Settings2 className="h-4 w-4 text-primary" />
                  <h3 className="font-bold text-sm uppercase">Export Settings</h3>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground">Image Format</label>
                    <Select value={format} onValueChange={setFormat}>
                      <SelectTrigger className="rounded-xl h-12 bg-muted/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="png">PNG (Best Quality)</SelectItem>
                        <SelectItem value="jpeg">JPG (Smaller Size)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground">Quality / Scale</label>
                    <Select value={scale} onValueChange={setScale}>
                      <SelectTrigger className="rounded-xl h-12 bg-muted/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Standard (1x)</SelectItem>
                        <SelectItem value="2">High (2x)</SelectItem>
                        <SelectItem value="3">Ultra (3x)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Selected pages will be converted and bundled into a .ZIP file for easy download.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default PdfToImagePage;
