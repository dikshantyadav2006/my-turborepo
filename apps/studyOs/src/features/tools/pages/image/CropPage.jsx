import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { motion } from 'framer-motion';
import { Image as ImageIcon, Crop as CropIcon, RotateCw, ZoomIn, Check, Trash2, Download } from 'lucide-react';
import ToolLayout from '../../components/ToolLayout';
import { useFileUpload } from '../../hooks/useFileUpload';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';

const ImageCropPage = () => {
  const [image, setImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const { onDragOver, onDragLeave, onDrop, handleFiles, isDragging } = useFileUpload({
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    onSuccess: (files) => {
      const reader = new FileReader();
      reader.onload = () => setImage(reader.result);
      reader.readAsDataURL(files[0]);
    }
  });

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });

  const getCroppedImg = async (imageSrc, pixelCrop, rotation = 0) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const maxSize = Math.max(image.width, image.height);
    const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

    canvas.width = safeArea;
    canvas.height = safeArea;

    ctx.translate(safeArea / 2, safeArea / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-safeArea / 2, -safeArea / 2);

    ctx.drawImage(
      image,
      safeArea / 2 - image.width * 0.5,
      safeArea / 2 - image.height * 0.5
    );

    const data = ctx.getImageData(0, 0, safeArea, safeArea);

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.putImageData(
      data,
      Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
      Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
    );

    return new Promise((resolve) => {
      canvas.toBlob((file) => {
        resolve(URL.createObjectURL(file));
      }, 'image/jpeg');
    });
  };

  const handleProcess = async () => {
    if (!image || !croppedAreaPixels) return;
    setIsProcessing(true);
    try {
      const croppedImage = await getCroppedImg(image, croppedAreaPixels, rotation);
      const link = document.createElement('a');
      link.href = croppedImage;
      link.download = `cropped-${Date.now()}.jpg`;
      link.click();
      toast.success('Image cropped successfully!');
    } catch (e) {
      console.error(e);
      toast.error('Failed to crop image');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Crop Image"
      description="Trim and frame your images perfectly"
      icon={CropIcon}
      onAction={handleProcess}
      actionLabel="Download Cropped"
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
              <ImageIcon className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Drop your image here</h3>
            <p className="text-muted-foreground mb-8">Supports JPG, PNG, WEBP (Max 20MB)</p>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              id="image-upload"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <Button variant="outline" className="rounded-full px-8 h-12 text-base font-bold" onClick={() => document.getElementById('image-upload').click()}>
              Select File
            </Button>
          </motion.div>
        ) : (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Preview Area */}
            <div className="lg:col-span-3 relative bg-black/5 rounded-[2.5rem] overflow-hidden min-h-[500px]">
              <Cropper
                image={image}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={4 / 3}
                onCropChange={setCrop}
                onRotationChange={setRotation}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>

            {/* Controls Area */}
            <div className="flex flex-col gap-6">
              <div className="p-6 rounded-3xl bg-card border shadow-sm space-y-8">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-bold flex items-center gap-2"><ZoomIn className="h-4 w-4" /> Zoom</span>
                    <span className="text-xs font-mono text-muted-foreground">{Math.round(zoom * 100)}%</span>
                  </div>
                  <Slider 
                    value={[zoom]} 
                    min={1} 
                    max={3} 
                    step={0.1} 
                    onValueChange={([val]) => setZoom(val)} 
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-bold flex items-center gap-2"><RotateCw className="h-4 w-4" /> Rotation</span>
                    <span className="text-xs font-mono text-muted-foreground">{rotation}°</span>
                  </div>
                  <Slider 
                    value={[rotation]} 
                    min={0} 
                    max={360} 
                    step={1} 
                    onValueChange={([val]) => setRotation(val)} 
                  />
                </div>

                <div className="pt-4 border-t space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Quick Actions</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" className="rounded-xl h-10" onClick={() => setRotation(r => (r + 90) % 360)}>
                      Rotate 90°
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-xl h-10" onClick={() => { setZoom(1); setRotation(0); }}>
                      Reset
                    </Button>
                  </div>
                </div>
              </div>

              <Button 
                variant="destructive" 
                className="w-full rounded-2xl h-12 gap-2"
                onClick={() => setImage(null)}
              >
                <Trash2 className="h-4 w-4" /> Remove Image
              </Button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default ImageCropPage;
