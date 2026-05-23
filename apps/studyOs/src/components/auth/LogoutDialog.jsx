import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, X } from 'lucide-react';
import { Button } from '../ui/button';

const LogoutDialog = ({ isOpen, onOpenChange, onConfirm }) => {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {isOpen && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  transition={{ type: "spring", duration: 0.4, bounce: 0.3 }}
                  className="bg-card w-full max-w-[400px] rounded-2xl shadow-2xl border border-border overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
                        <LogOut size={24} />
                      </div>
                      <Dialog.Close asChild>
                        <button className="p-2 text-muted-foreground hover:bg-secondary rounded-full transition-colors">
                          <X size={18} />
                        </button>
                      </Dialog.Close>
                    </div>
                    
                    <Dialog.Title className="text-xl font-semibold mb-2">
                      Leave Study Session?
                    </Dialog.Title>
                    <Dialog.Description className="text-muted-foreground leading-relaxed">
                      You’ll need to login again to sync your progress. Any unsynced data might be lost.
                    </Dialog.Description>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 p-6 bg-secondary/30 border-t border-border">
                    <Dialog.Close asChild>
                      <Button variant="outline" className="flex-1 rounded-xl h-11 font-medium">
                        Cancel
                      </Button>
                    </Dialog.Close>
                    <Button 
                      variant="destructive" 
                      onClick={onConfirm}
                      className="flex-1 rounded-xl h-11 font-medium shadow-lg shadow-destructive/20"
                    >
                      Logout
                    </Button>
                  </div>
                </motion.div>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
};

export default LogoutDialog;
