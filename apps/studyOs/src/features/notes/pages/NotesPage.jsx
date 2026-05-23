import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Trash2, 
  FileText, 
  Save,
  Clock,
  ChevronLeft,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { useNotesStore } from '../store/notesStore';
import { clsx } from 'clsx';
import { MdEditor } from 'md-editor-rt';
import 'md-editor-rt/lib/style.css';
import { toast } from 'sonner';

const NotesPage = () => {
  const { notes, addNote, updateNote, deleteNote, initNotes } = useNotesStore();
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    initNotes();
  }, []);

  const activeNote = notes.find(n => n.id === activeNoteId);

  const handleCreateNote = () => {
    const id = Date.now().toString();
    addNote({
      id,
      title: 'Untitled Note',
      content: '',
    });
    setActiveNoteId(id);
    toast.success('Note created');
  };

  const handleSave = () => {
    toast.success('Note saved locally');
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (n.content && n.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className={clsx(
      "flex flex-col md:flex-row gap-4 md:gap-8 transition-all duration-500 h-full max-h-[calc(100vh-8rem)] md:h-[calc(100vh-8rem)]",
      isFullscreen ? "fixed inset-0 z-[60] bg-background p-4 md:p-8" : ""
    )}>
      {/* Notes Sidebar - Hidden on mobile if a note is active */}
      {!isFullscreen && (
        <div className={clsx(
          "w-full md:w-80 flex-col gap-4 animate-in slide-in-from-left duration-500 h-full",
          activeNoteId ? "hidden md:flex" : "flex"
        )}>
          <div className="flex justify-between items-center px-1">
            <h1 className="text-3xl font-bold tracking-tight">Notes</h1>
            <button 
              onClick={handleCreateNote}
              className="p-2 md:p-2.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <Plus size={20} />
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-secondary/50 border border-transparent focus:border-primary/10 px-10 py-2.5 rounded-xl text-sm outline-none transition-all min-h-[44px]"
            />
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-2 pb-24 md:pb-0">
            {filteredNotes.map((note) => (
              <button
                key={note.id}
                onClick={() => setActiveNoteId(note.id)}
                className={clsx(
                  "w-full text-left p-4 rounded-2xl border transition-all group min-h-[80px]",
                  activeNoteId === note.id 
                    ? "bg-card border-border shadow-sm ring-1 ring-primary/10" 
                    : "bg-transparent border-transparent hover:bg-secondary/50"
                )}
              >
                <h3 className="font-semibold text-sm truncate">{note.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                  {note.content || 'No content...'}
                </p>
                <div className="flex items-center gap-2 mt-3 text-[10px] text-muted-foreground">
                  <Clock size={10} />
                  <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Editor Area */}
      <div className={clsx(
        "flex-1 bg-card border border-border rounded-3xl overflow-hidden shadow-2xl flex flex-col h-full",
        !activeNoteId && "hidden md:flex"
      )}>
        <AnimatePresence mode="wait">
          {activeNote ? (
            <motion.div 
              key={activeNoteId}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col min-h-0"
            >
              <div className="p-4 md:p-6 border-b border-border flex justify-between items-center bg-secondary/20 flex-wrap gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <button 
                    onClick={() => setActiveNoteId(null)}
                    className="md:hidden p-2 text-muted-foreground hover:text-foreground rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center -ml-2"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <input
                    type="text"
                    value={activeNote.title}
                    onChange={(e) => updateNote(activeNote.id, { title: e.target.value })}
                    className="bg-transparent text-lg md:text-xl font-bold outline-none flex-1 truncate w-full"
                  />
                </div>
                <div className="flex items-center gap-1 md:gap-2">
                  <button 
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="hidden md:flex p-2 text-muted-foreground hover:text-foreground rounded-lg transition-colors min-w-[44px] min-h-[44px] items-center justify-center"
                  >
                    {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                  </button>
                  <button 
                    onClick={() => {
                      deleteNote(activeNote.id);
                      setActiveNoteId(null);
                      toast.error('Note deleted');
                    }}
                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-hidden">
                <MdEditor
                  modelValue={activeNote.content || ''}
                  onChange={(val) => updateNote(activeNote.id, { content: val })}
                  theme="dark"
                  preview={!isFullscreen && window.innerWidth < 768 ? false : true}
                  style={{ height: '100%', border: 'none' }}
                  language="en-US"
                  toolbarsExclude={['github', 'save', 'prettier']}
                />
              </div>
            </motion.div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-4 h-full">
              <div className="p-6 bg-secondary rounded-full animate-pulse">
                <FileText size={48} />
              </div>
              <p className="text-lg font-medium text-center px-4">Select or create a note to begin</p>
              <p className="text-sm opacity-60">Markdown support included</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default NotesPage;
