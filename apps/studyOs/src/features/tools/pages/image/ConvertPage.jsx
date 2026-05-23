import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  RefreshCw, 
  Image as ImageIcon, 
  Trash2, 
  Download,
  Settings,
  FileCheck
} from 'lucide-react';
import ToolLayout from '../../components/ToolLayout';
import { useFileUpload } from '../../hooks/useFileUpload';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';

const ImageConvertPage = () => {
  const [image, setImage] = useState(null);
  const [imageName, setImageName] = useState('');
  const [format, setFormat] = useState('webp');
  const [quality, setQuality] = useState('0.8');
  const [isProcessing, setIsProcessing] = useState(false);

  const { onDragOver, onDragLeave, onDrop, handleFiles, isDragging } = useFileUpload({
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
    onSuccess: (files) => {
      const file = files[0];
      setImageName(file.name.split('.')[0]);
      const reader = new FileReader();
      reader.onload = (e) => setImage(e.target.result);
      reader.readAsDataURL(file);
    }
  });

  const handleProcess = async () => {
    if (!image) return;
    setIsProcessing(true);
    try {
      const img = new Image();
      img.src = image;
      await new Promise(r => img.onload = r);

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const mimeType = `image/${format}`;
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${imageName}.${format}`;
        link.click();
        toast.success(`Converted to ${format.toUpperCase()}!`);
        setIsProcessing(false);
      }, mimeType, parseFloat(quality));
    } catch (e) {
      toast.error('Failed to convert image');
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Convert Image"
      description="Convert between PNG, JPG, WebP, and AVIF"
      icon={RefreshCw}
      onAction={handleProcess}
      actionLabel="Convert & Download"
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
              <RefreshCw className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Drop image to convert</h3>
            <p className="text-muted-foreground mb-8">PNG, JPG, WEBP, AVIF supported</p>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              id="convert-upload"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <Button variant="outline" className="rounded-full px-8 h-12 text-base font-bold" onClick={() => document.getElementById('convert-upload').click()}>
              Select Image
            </Button>
          </motion.div>
        ) : (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3 flex items-center justify-center bg-black/5 rounded-[2.5rem] overflow-hidden p-8 border relative">
              <img 
                src={image} 
                alt="Preview" 
                className="max-h-[60vh] rounded-xl shadow-2xl transition-all"
              />
              <div className="absolute top-6 left-6">
                <Badge className="bg-primary/90 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg">
                  Source: {imageName}
                </Badge>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="p-6 rounded-3xl bg-card border shadow-sm space-y-6">
                <div className="flex items-center gap-2 mb-2">
                  <Settings className="h-4 w-4 text-primary" />
                  <h3 className="font-bold text-sm uppercase tracking-wider">Output Settings</h3>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground">Target Format</label>
                    <Select value={format} onValueChange={setFormat}>
                      <SelectTrigger className="rounded-xl h-12 bg-muted/50">
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="webp">WebP (Recommended)</SelectItem>
                        <SelectItem value="png">PNG (Lossless)</SelectItem>
                        <SelectItem value="jpeg">JPG (Standard)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground">Quality</label>
                    <Select value={quality} onValueChange={setQuality}>
                      <SelectTrigger className="rounded-xl h-12 bg-muted/50">
                        <SelectValue placeholder="Select quality" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1.0">Highest (100%)</SelectItem>
                        <SelectItem value="0.8">High (80%)</SelectItem>
                        <SelectItem value="0.6">Medium (60%)</SelectItem>
                        <SelectItem value="0.4">Low (40%)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center gap-3 text-sm text-green-500 font-bold bg-green-500/5 p-3 rounded-xl border border-green-500/10">
                    <FileCheck className="h-4 w-4" />
                    <span>Ready for conversion</span>
                  </div>
                </div>
              </div>

              <Button 
                variant="destructive" 
                className="w-full rounded-2xl h-12 gap-2"
                onClick={() => setImage(null)}
              >
                <Trash2 className="h-4 w-4" /> Start Over
              </Button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default ImageConvertPage;
