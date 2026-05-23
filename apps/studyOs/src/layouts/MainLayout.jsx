import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Timer, 
  BookOpen, 
  Trophy, 
  Settings,
  User,
  LogOut,
  Zap,
  Keyboard,
  FileImage,
  Wrench,
  CheckCircle2
} from 'lucide-react';

import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { openLogin } from '../lib/authNavigation';
import LogoutDialog from '../components/auth/LogoutDialog';
import MusicPlayer from '../features/focus/components/MusicPlayer';
import { AICenter } from '../components/AICenter';
import CommandMenu from '../components/CommandMenu';
import FloatingWidgetsManager from '../components/FloatingWidgetsManager';
import { useNavigate } from 'react-router-dom';
import { useThemeStore } from '../store/themeStore';
import { Moon, Sun } from 'lucide-react';

const MainLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isGuest } = useAuthStore();
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isSidebarHovered, setSidebarHovered] = useState(false);

  React.useEffect(() => {
    const handleNavigation = (e) => {
      if (e.detail?.path) navigate(e.detail.path);
    };
    window.addEventListener('ai-navigate', handleNavigation);
    return () => window.removeEventListener('ai-navigate', handleNavigation);
  }, [navigate]);

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
    { path: '/habits', icon: CheckCircle2, label: 'Habits' },
    { path: '/timer', icon: Timer, label: 'Study Timer' },
    { path: '/typing', icon: Keyboard, label: 'Typing Master' },
    { path: '/notes', icon: BookOpen, label: 'Notes' },
    { path: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
    { path: '/tools', icon: Wrench, label: 'Study Tools' },
  ];


  const handleAuthAction = () => {
    if (isGuest) {
      openLogin();
    } else {
      setIsLogoutDialogOpen(true);
    }
  };

  const handleLogoutConfirm = async () => {
    await logout();
    setIsLogoutDialogOpen(false);
  };

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-background text-foreground relative theme-ambient">
      {/* Ambient Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-90">
        <div className="absolute inset-0 bg-noise opacity-[0.018]" />
      </div>
      {/* Sidebar (Desktop) */}
      <motion.aside
        className="
hidden lg:flex flex-col
border-r border-border/70
bg-card/80
backdrop-blur-2xl
supports-[backdrop-filter]:bg-card/80
shadow-[0_8px_40px_rgba(0,0,0,0.12)]
"
        initial={{ width: 84 }}
        animate={{ width: isSidebarHovered ? 272 : 84 }}
        transition={{
          type: 'spring',
          stiffness: 240,
          damping: 26,
          mass: 0.8
        }}
        onMouseEnter={() => setSidebarHovered(true)}
        onMouseLeave={() => setSidebarHovered(false)}
      >
        <div className={`p-5 flex items-center gap-3 ${isSidebarHovered ? '' : 'justify-center'}`}>
          <div className="w-9 h-9 bg-primary rounded-2xl flex items-center justify-center shadow-sm shadow-black/10">
            <Zap className="text-primary-foreground w-5 h-5" />
          </div>
          <motion.span
            initial={false}
            animate={{ opacity: isSidebarHovered ? 1 : 0, x: isSidebarHovered ? 0 : -6 }}
            className="overflow-hidden whitespace-nowrap font-semibold text-lg tracking-tight"
          >
            Study OS
          </motion.span>
        </div>

        <nav className="flex-1 px-3 pb-3 space-y-1">
          {navItems.map((item) => {
            const isActive = item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path);
            return (
              <Link key={item.path} to={item.path} className="block">
                <motion.div
                  whileHover={{
                    x: isSidebarHovered ? 4 : 0,
                    scale: 1.02
                  }}
                  whileTap={{ scale: 0.98 }}
                  className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-3xl transition-all duration-200 ${
                    isActive 
                      ? 'bg-primary/10 text-foreground shadow-sm shadow-black/5' 
                      : 'text-muted-foreground hover:bg-secondary/40 hover:text-foreground'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabDesktop"
                      className="absolute inset-y-2 left-1 w-1 rounded-full bg-primary"
                    />
                  )}
                  <div
                    className={`
                      relative flex items-center justify-center
                      w-10 h-10 rounded-2xl shrink-0
                      transition-all duration-300
                      ${
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                          : 'bg-secondary/50 text-muted-foreground group-hover:bg-secondary/70 group-hover:text-foreground'
                      }
                    `}
                  >
                    {isActive && (
                      <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-xl opacity-60" />
                    )}

                    <item.icon
                      size={18}
                      strokeWidth={isActive ? 2.4 : 2}
                      className="relative z-10"
                    />
                  </div>
                  <motion.span
                    initial={false}
                    animate={{ opacity: isSidebarHovered ? 1 : 0, x: isSidebarHovered ? 0 : -8 }}
                    className="overflow-hidden whitespace-nowrap text-sm font-[500] tracking-[-0.01em]"
                  >
                    {item.label}
                  </motion.span>
                  {isActive && (
                    <motion.div 
                      className={`ml-auto w-2 h-2 rounded-full bg-primary ${isSidebarHovered ? 'opacity-100' : 'opacity-0'}`} 
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border/70 space-y-3">
          <div className={`flex items-center gap-3 px-3 py-2 rounded-2xl bg-secondary/20 ${isSidebarHovered ? '' : 'justify-center'}`}>
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0 border border-border/60">
              {user?.avatar ? <img src={user.avatar} alt="User" /> : <User size={18} />}
            </div>
            <motion.div
              initial={false}
              animate={{ opacity: isSidebarHovered ? 1 : 0, x: isSidebarHovered ? 0 : -8 }}
              className="flex-1 min-w-0 overflow-hidden"
            >
              <p className="text-sm font-[500] tracking-[-0.01em] truncate">{user?.fullname || (isGuest ? 'Guest User' : 'Loading...')}</p>
              <p className="text-xs text-muted-foreground truncate font-[500] tracking-[-0.01em]">
                {isGuest ? 'Offline Mode' : (user?.username ? `@${user.username}` : user?.mobile || 'No details')}
              </p>
            </motion.div>
          </div>
          
          <button 
            onClick={handleAuthAction}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-2xl transition-colors ${
              isGuest 
                ? 'text-primary hover:bg-primary/10' 
                : 'text-muted-foreground hover:text-destructive hover:bg-destructive/10'
            }`}
          >
            <LogOut size={18} className={isGuest ? 'rotate-180' : ''} />
            <motion.span
              initial={false}
              animate={{ opacity: isSidebarHovered ? 1 : 0, x: isSidebarHovered ? 0 : -8 }}
              className="overflow-hidden whitespace-nowrap font-[500] tracking-[-0.01em]"
            >
              {isGuest ? 'Login to Sync' : 'Logout'}
            </motion.span>
          </button>

          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-2xl text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl shrink-0 bg-secondary/50 text-muted-foreground group-hover:bg-secondary/70 group-hover:text-foreground">
              {theme === 'dark' ? <Sun size={18} strokeWidth={2.3} /> : <Moon size={18} strokeWidth={2.3} />}
            </div>
            <span className="overflow-hidden whitespace-nowrap font-[500] tracking-[-0.01em]">
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-transparent p-4 pb-28 lg:p-8 relative z-10">
        <div className="max-w-5xl mx-auto h-full relative">
          <Outlet />
        </div>
      </main>

      {/* Mobile Navigation Dock */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-t border-border/70 pb-[env(safe-area-inset-bottom)] z-50">
        <div className="flex items-center gap-1 px-2 h-16 overflow-x-auto scrollbar-hide">
          {navItems.map((item) => {
            const isActive = item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path);
            return (
              <Link 
                key={item.path} 
                to={item.path}
                className="flex-none w-14 flex flex-col items-center justify-center h-full min-h-[44px] relative"
              >
                <div className={`relative flex items-center justify-center w-10 h-10 rounded-2xl transition-colors ${isActive ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'bg-secondary/50 text-muted-foreground hover:bg-secondary/70 hover:text-foreground'}`}>
                  <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                  {isActive && (
                    <motion.div 
                      layoutId="activeTabMobile"
                      className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" 
                    />
                  )}
                </div>
              </Link>
            );
          })}
          <button
            onClick={toggleTheme}
            className="flex-none w-14 flex flex-col items-center justify-center h-full min-h-[44px]"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-secondary/50 text-muted-foreground hover:bg-secondary/70 hover:text-foreground transition-colors">
              {theme === 'dark' ? <Sun size={18} strokeWidth={2.3} /> : <Moon size={18} strokeWidth={2.3} />}
            </div>
          </button>
          <button 
            onClick={handleAuthAction}
            className="flex-none w-14 flex flex-col items-center justify-center h-full min-h-[44px]"
          >
            <div className="w-10 h-10 rounded-2xl bg-secondary/50 flex items-center justify-center overflow-hidden border border-border/70 text-muted-foreground">
              {user?.avatar ? <img src={user.avatar} alt="User" /> : <User size={16} />}
            </div>
          </button>
        </div>
      </nav>

      <MusicPlayer />
      <AICenter />
      <CommandMenu />
      <FloatingWidgetsManager />

      <LogoutDialog 
        isOpen={isLogoutDialogOpen} 
        onOpenChange={setIsLogoutDialogOpen} 
        onConfirm={handleLogoutConfirm} 
      />
    </div>
  );
};

export default MainLayout;
