import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Image as ImageIcon, 
  FileText, 
  RefreshCw, 
  Search, 
  ArrowRight,
  Zap,
  ShieldCheck,
  Smartphone,
  Star,
  History
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const categories = [
  {
    id: 'image',
    title: 'Image Tools',
    icon: ImageIcon,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    tools: [
      { id: 'compress-image', name: 'Compress Image', desc: 'Reduce file size while keeping quality', path: '/tools/image-compressor' },
      { id: 'resize-image', name: 'Resize Image', desc: 'Change dimensions by px or %', path: '/tools/image-resize' },
      { id: 'crop-image', name: 'Crop Image', desc: 'Trim edges for the perfect frame', path: '/tools/image-crop' },
      { id: 'convert-image', name: 'Convert Image', desc: 'PNG, JPG, WebP, AVIF', path: '/tools/image-convert' },
      { id: 'edit-image', name: 'Image Editor', desc: 'Filter, rotate, flip & annotate', path: '/tools/image-editor' },
      { id: 'bg-remover', name: 'Background Remover', desc: 'Remove solid backgrounds instantly', path: '/tools/background-remover' },

    ]
  },
  {
    id: 'pdf',
    title: 'PDF Tools',
    icon: FileText,
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    tools: [
      { id: 'merge-pdf', name: 'Merge PDF', desc: 'Combine multiple PDFs into one', path: '/tools/pdf-merge' },
      { id: 'split-pdf', name: 'Split PDF', desc: 'Extract pages or split into parts', path: '/tools/pdf-split' },
      { id: 'compress-pdf', name: 'Compress PDF', desc: 'Optimize PDF for web and email', path: '/tools/pdf-compress' },
      { id: 'pdf-to-img', name: 'PDF to Image', desc: 'Convert PDF pages to JPG/PNG', path: '/tools/pdf-to-image' },
      { id: 'img-to-pdf', name: 'Image to PDF', desc: 'Convert images to a PDF document', path: '/tools/image-to-pdf' },
      { id: 'organize-pdf', name: 'Organize PDF', desc: 'Rearrange, rotate, or delete pages', path: '/tools/pdf-organize' },
      { id: 'sign-pdf', name: 'Sign PDF', desc: 'Add digital signature to PDF', path: '/tools/pdf-sign' },
      { id: 'protect-pdf', name: 'Protect PDF', desc: 'Add password to PDF document', path: '/tools/pdf-protect' },
      { id: 'watermark-pdf', name: 'Add Watermark', desc: 'Add text or image watermark', path: '/tools/pdf-watermark' },


    ]
  },
  {
    id: 'conversion',
    title: 'Conversion Tools',
    icon: RefreshCw,
    color: 'text-green-500',
    bg: 'bg-green-500/10',
    tools: [
      { id: 'svg-to-png', name: 'SVG to PNG', desc: 'Render vector files to bitmaps', path: '/tools/svg-to-png' },
      { id: 'base64', name: 'Base64 Converter', desc: 'Encode/decode files to base64', path: '/tools/base64' },
    ]
  }
];

const ToolsLandingPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const filteredCategories = categories.map(cat => ({
    ...cat,
    tools: cat.tools.filter(tool => 
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.desc.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(cat => cat.tools.length > 0);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="container max-w-6xl relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-6 tracking-wider uppercase border border-primary/20 shadow-sm"
          >
            <Zap className="h-3.5 w-3.5" />
            Powerful productivity suite
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent"
          >
            Universal Tools for <span className="text-primary italic">Students</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-lg mb-10 max-w-2xl mx-auto"
          >
            High-performance tools for your files. 100% private, browser-first processing. No uploads to server required.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative max-w-xl mx-auto"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              type="text" 
              placeholder="Search for a tool (e.g. compress pdf)..." 
              className="w-full h-14 pl-12 pr-4 bg-muted/50 border-muted-foreground/10 rounded-2xl text-lg shadow-xl shadow-primary/5 focus:ring-primary/20 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </motion.div>
          
          <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-sm text-muted-foreground font-medium">
            <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-primary" /> Browser-Side Only</span>
            <span className="flex items-center gap-1.5"><Smartphone className="h-4 w-4 text-primary" /> Mobile Ready</span>
            <span className="flex items-center gap-1.5"><Star className="h-4 w-4 text-primary" /> Free Always</span>
          </div>
        </div>
      </section>

      {/* Grid Section */}
      <div className="container max-w-6xl px-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-16"
        >
          {filteredCategories.map((category) => (
            <div key={category.id}>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${category.bg} ${category.color}`}>
                    <category.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight">{category.title}</h2>
                    <p className="text-sm text-muted-foreground">{category.tools.length} available tools</p>
                  </div>
                </div>
                <div className="hidden md:flex gap-2">
                  <Button variant="outline" size="sm" className="rounded-full gap-2">
                    <History className="h-4 w-4" /> History
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {category.tools.map((tool) => (
                  <motion.div
                    key={tool.id}
                    variants={itemVariants}
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="group relative p-6 rounded-3xl border bg-card/50 backdrop-blur-sm hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5 transition-all cursor-pointer overflow-hidden"
                    onClick={() => navigate(tool.path)}
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight className="h-5 w-5 text-primary" />
                    </div>
                    
                    <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-muted group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      <category.icon className="h-6 w-6" />
                    </div>
                    
                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{tool.name}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{tool.desc}</p>
                    
                    <div className="mt-6 flex items-center justify-between">
                      <Badge variant="secondary" className="bg-muted-foreground/5 text-[10px] uppercase font-bold tracking-wider">Fast</Badge>
                      <span className="text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">Launch Tool</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Floating Action Hint */}
      {!searchQuery && (
        <motion.div 
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 md:hidden"
        >
          <Button className="rounded-full px-8 h-12 shadow-2xl gap-2 font-bold">
            <Star className="h-4 w-4" /> Recent Files
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default ToolsLandingPage;
