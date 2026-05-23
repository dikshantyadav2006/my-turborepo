import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const useFileUpload = (options = {}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState([]);
  const navigate = useNavigate();

  const validateFile = useCallback((file) => {
    const { maxSize, allowedTypes } = options;
    
    if (maxSize && file.size > maxSize) {
      toast.error(`File ${file.name} is too large. Max size is ${maxSize / (1024 * 1024)}MB`);
      return false;
    }
    
    if (allowedTypes && !allowedTypes.includes(file.type)) {
      // Basic smart detection
      if (file.type.startsWith('image/')) {
        toast.info("Suggesting image tools for your image file.");
      } else if (file.type === 'application/pdf') {
        toast.info("Suggesting PDF tools for your PDF file.");
      } else {
        toast.error(`File type ${file.type} is not supported here.`);
      }
      return false;
    }
    
    return true;
  }, [options]);

  const handleFiles = useCallback((incomingFiles) => {
    const validFiles = Array.from(incomingFiles).filter(validateFile);
    if (validFiles.length > 0) {
      setFiles((prev) => [...prev, ...validFiles]);
      if (options.onSuccess) options.onSuccess(validFiles);
    }
  }, [validateFile, options]);

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  return {
    files,
    setFiles,
    isDragging,
    onDragOver,
    onDragLeave,
    onDrop,
    handleFiles,
  };
};
