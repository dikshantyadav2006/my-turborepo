import React, { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Timer, 
  BookOpen, 
  Trophy, 
  Search,
  Zap,
  Moon,
  Sun
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStore } from '../store/themeStore';

const CommandMenu = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  useEffect(() => {
    const down = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = (command) => {
    setOpen(false);
    command();
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-background/80 backdrop-blur-sm px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-xl bg-card border border-border shadow-2xl rounded-2xl overflow-hidden"
          >
            <Command label="Command Menu" className="flex flex-col">
              <div className="flex items-center border-b border-border px-4">
                <Search className="text-muted-foreground mr-2" size={20} />
                <Command.Input 
                  placeholder="Type a command or search..." 
                  className="w-full py-4 bg-transparent outline-none text-sm font-medium"
                />
              </div>

              <Command.List className="max-h-[300px] overflow-y-auto p-2 scrollbar-hide">
                <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
                  No results found.
                </Command.Empty>

                <Command.Group heading="Navigation" className="px-2 py-3 text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                  <Item onSelect={() => runCommand(() => navigate('/'))} icon={LayoutDashboard} label="Dashboard" />
                  <Item onSelect={() => runCommand(() => navigate('/tasks'))} icon={CheckSquare} label="Tasks" />
                  <Item onSelect={() => runCommand(() => navigate('/timer'))} icon={Timer} label="Study Timer" />
                  <Item onSelect={() => runCommand(() => navigate('/notes'))} icon={BookOpen} label="Notes" />
                  <Item onSelect={() => runCommand(() => navigate('/leaderboard'))} icon={Trophy} label="Leaderboard" />
                </Command.Group>

                <Command.Group heading="Settings" className="px-2 py-3 text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                  <Item
                    onSelect={() => runCommand(() => toggleTheme())}
                    icon={theme === 'dark' ? Sun : Moon}
                    label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                  />
                  <Item onSelect={() => runCommand(() => navigate('/auth'))} icon={Zap} label="Logout" />
                </Command.Group>
              </Command.List>
            </Command>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const Item = ({ icon: Icon, label, onSelect }) => (
  <Command.Item 
    onSelect={onSelect}
    className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium hover:bg-secondary cursor-pointer aria-selected:bg-secondary transition-colors"
  >
    <Icon size={18} className="text-muted-foreground" />
    <span>{label}</span>
  </Command.Item>
);

export default CommandMenu;
