import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, Bot, X } from 'lucide-react';
import { useAiStore } from '../store/aiStore';

const StudyAI = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const { messages, isTyping, sendMessage } = useAiStore();

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input);
    setInput('');
  };

  return (
    <div className="fixed bottom-24 lg:bottom-6 right-6 lg:right-24 z-40">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-4 w-[calc(100vw-3rem)] sm:w-[400px] h-[400px] sm:h-[500px] bg-card border border-border rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden right-0"
          >
            {/* Header */}
            <div className="p-6 bg-primary text-primary-foreground flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Sparkles size={20} />
                <h2 className="font-bold">AI Study Assistant</h2>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:opacity-80">
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-10 space-y-2">
                  <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Bot className="text-primary" />
                  </div>
                  <p className="text-sm font-semibold">How can I help you study today?</p>
                  <p className="text-xs text-muted-foreground px-10">Try: "Create a study plan for 2 hours" or "Generate a quiz about React hooks"</p>
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-primary text-primary-foreground rounded-tr-none' 
                      : 'bg-secondary text-foreground rounded-tl-none'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-secondary p-4 rounded-2xl rounded-tl-none flex gap-1">
                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-muted-foreground rounded-full" />
                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-muted-foreground rounded-full" />
                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-muted-foreground rounded-full" />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 border-t border-border flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything..."
                className="flex-1 bg-secondary px-4 py-2 rounded-xl text-sm outline-none focus:ring-1 ring-primary/20"
              />
              <button type="submit" className="p-2 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity">
                <Send size={18} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20"
      >
        <Sparkles size={20} />
      </motion.button>
    </div>
  );
};

export default StudyAI;
