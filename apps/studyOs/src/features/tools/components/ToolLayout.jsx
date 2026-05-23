import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Info, Settings2, Download, History, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ToolLayout = ({ 
  children, 
  title, 
  description, 
  icon: Icon,
  onAction,
  actionLabel = "Process File",
  isProcessing = false,
  showHistory = true,
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(-1)}
              className="rounded-full hover:bg-accent"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              {Icon && (
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
              )}
              <div>
                <h1 className="text-lg font-semibold tracking-tight leading-none mb-1">{title}</h1>
                <p className="text-sm text-muted-foreground line-clamp-1">{description}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full hidden md:flex">
              <Star className="h-4 w-4" />
            </Button>
            {showHistory && (
              <Button variant="ghost" size="icon" className="rounded-full">
                <History className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" size="icon" className="rounded-full">
              <Settings2 className="h-4 w-4" />
            </Button>
            <Button 
              className="ml-2 gap-2 rounded-full px-6 font-medium shadow-lg shadow-primary/20"
              onClick={onAction}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="h-4 w-4 border-2 border-current border-t-transparent rounded-full"
                />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {actionLabel}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="flex-1 container py-6 md:py-10 px-4 md:px-8"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Quick Tips / Bottom Bar */}
      <footer className="border-t bg-muted/30 py-3">
        <div className="container px-4 md:px-8 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5" />
              Processing happens entirely in your browser
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span>Privacy Guaranteed</span>
            <span className="h-1 w-1 bg-muted-foreground/30 rounded-full" />
            <span>StudyOS Tools</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ToolLayout;
