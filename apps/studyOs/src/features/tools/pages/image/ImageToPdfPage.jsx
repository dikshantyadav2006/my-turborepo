import React, { useState } from 'react';
import { motion, Reorder } from 'framer-motion';
import { PDFDocument } from 'pdf-lib';
import { 
  FileImage, 
  Plus, 
  Trash2, 
  GripVertical, 
  Download, 
  FileType,
  FilePlus2,
  X,
  FileText
} from 'lucide-react';
import ToolLayout from '../../components/ToolLayout';
import { useFileUpload } from '../../hooks/useFileUpload';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const ImageToPdfPage = () => {
  const [images, setImages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const { onDragOver, onDragLeave, onDrop, handleFiles, isDragging } = useFileUpload({
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    onSuccess: (files) => {
      const newImages = Array.from(files).map(file => ({
        id: Math.random().toString(36).substring(7),
        file,
        name: file.name,
        preview: URL.createObjectURL(file)
      }));
      setImages(prev => [...prev, ...newImages]);
    }
  });

  const removeImage = (id) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const handleConvert = async () => {
    if (images.length === 0) {
      toast.error('Please add at least one image');
      return;
    }

    setIsProcessing(true);
    try {
      const pdfDoc = await PDFDocument.create();
      
      for (const imgObj of images) {
        const imgBytes = await imgObj.file.arrayBuffer();
        let pdfImg;
        
        if (imgObj.file.type === 'image/jpeg') {
          pdfImg = await pdfDoc.embedJpg(imgBytes);
        } else if (imgObj.file.type === 'image/png') {
          pdfImg = await pdfDoc.embedPng(imgBytes);
        } else {
          // For WebP/others, convert to PNG first on a canvas
          const canvas = document.createElement('canvas');
          const img = new Image();
          img.src = imgObj.preview;
          await new Promise(r => img.onload = r);
          canvas.width = img.width;
          canvas.height = img.height;
          canvas.getContext('2d').drawImage(img, 0, 0);
          const pngData = await new Promise(r => canvas.toBlob(r, 'image/png'));
          pdfImg = await pdfDoc.embedPng(await pngData.arrayBuffer());
        }

        const page = pdfDoc.addPage([pdfImg.width, pdfImg.height]);
        page.drawImage(pdfImg, {
          x: 0,
          y: 0,
          width: pdfImg.width,
          height: pdfImg.height,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `images-to-${Date.now()}.pdf`;
      link.click();
      
      toast.success('Images converted to PDF successfully!');
    } catch (e) {
      console.error(e);
      toast.error('Failed to convert images to PDF');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Image to PDF"
      description="Convert multiple images into a single PDF document"
      icon={FileType}
      onAction={handleConvert}
      actionLabel="Create PDF"
      isProcessing={isProcessing}
    >
      <div className="h-full flex flex-col gap-6">
        <motion.div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`relative min-h-[150px] flex flex-col items-center justify-center border-2 border-dashed rounded-[2.5rem] transition-all p-6 ${
            isDragging ? 'border-primary bg-primary/5 scale-[0.99]' : 'border-muted-foreground/20 hover:border-primary/50'
          }`}
        >
          <div className="p-3 rounded-2xl bg-muted mb-2">
            <Plus className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-bold mb-1">Add Images</h3>
          <p className="text-muted-foreground text-xs mb-4">Drag and drop or click to select</p>
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            id="img-to-pdf-upload"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <Button variant="outline" size="sm" className="rounded-full px-6 font-bold" onClick={() => document.getElementById('img-to-pdf-upload').click()}>
            <FilePlus2 className="h-4 w-4 mr-2" /> Select Images
          </Button>
        </motion.div>

        {images.length > 0 && (
          <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between px-2">
              <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Pages in PDF ({images.length})
              </h4>
              <p className="text-xs text-muted-foreground italic">Drag to reorder pages</p>
            </div>

            <Reorder.Group 
              axis="y" 
              values={images} 
              onReorder={setImages} 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {images.map((img) => (
                <Reorder.Item
                  key={img.id}
                  value={img}
                  className="group relative aspect-[3/4] rounded-2xl overflow-hidden border bg-card shadow-sm cursor-grab active:cursor-grabbing"
                >
                  <img src={img.preview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4">
                    <GripVertical className="h-6 w-6 text-white mb-2" />
                    <span className="text-white text-xs font-bold truncate w-full text-center">{img.name}</span>
                  </div>
                  <Button 
                    variant="destructive" 
                    size="icon" 
                    className="absolute top-2 right-2 rounded-full h-8 w-8 scale-0 group-hover:scale-100 transition-transform shadow-lg"
                    onClick={(e) => { e.stopPropagation(); removeImage(img.id); }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md text-white px-2 py-0.5 rounded-md text-[10px] font-bold">
                    Page {images.indexOf(img) + 1}
                  </div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </div>
        )}

        {images.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-muted-foreground/30 italic">
            No images added yet
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default ImageToPdfPage;
