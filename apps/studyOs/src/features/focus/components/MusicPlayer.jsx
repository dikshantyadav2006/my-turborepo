import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Music, 
  Play, 
  Pause, 
  SkipForward, 
  Volume2,
  X,
  VolumeX
} from 'lucide-react';
import { useMusicStore } from '../store/musicStore';
import { Howl, Howler } from 'howler';

const MusicPlayer = () => {
  const { isPlaying, currentTrack, tracks, togglePlay, setTrack, volume, setVolume } = useMusicStore();
  const [sound, setSound] = useState(null);

  useEffect(() => {
    if (currentTrack) {
      if (sound) {
        sound.unload();
      }

      const newSound = new Howl({
        src: [currentTrack.url],
        html5: true,
        loop: true,
        volume: volume,
        onplay: () => !isPlaying && togglePlay(),
        onpause: () => isPlaying && togglePlay(),
      });

      setSound(newSound);

      if (isPlaying) {
        newSound.play();
      }
    }

    return () => {
      if (sound) sound.unload();
    };
  }, [currentTrack]);

  useEffect(() => {
    if (sound) {
      if (isPlaying) {
        sound.play();
      } else {
        sound.pause();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    Howler.volume(volume);
  }, [volume]);

  return (
    <div className="fixed bottom-24 lg:bottom-6 right-6 z-40">
      <AnimatePresence>
        {currentTrack ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="glass-dark p-4 rounded-3xl flex items-center gap-4 shadow-2xl min-w-[300px] border border-white/10"
          >
            <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center relative overflow-hidden ring-1 ring-primary/20">
              <Music className="text-primary w-6 h-6" />
              {isPlaying && (
                <div className="absolute bottom-1 flex gap-0.5 items-end h-3">
                  {[1, 2, 3].map(i => (
                    <motion.div
                      key={i}
                      animate={{ height: [4, 12, 6, 10, 4] }}
                      transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.2 }}
                      className="w-1 bg-primary rounded-full"
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black text-primary uppercase tracking-widest opacity-80">Ambient Mode</p>
              <p className="text-sm font-bold truncate text-white">{currentTrack.name}</p>
            </div>

            <div className="flex items-center gap-1">
              <button 
                onClick={togglePlay}
                className="p-2.5 text-white bg-primary rounded-full shadow-lg hover:scale-105 transition-transform"
              >
                {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
              </button>
              <button 
                onClick={() => setTrack(tracks[(tracks.indexOf(currentTrack) + 1) % tracks.length])}
                className="p-2 text-white/40 hover:text-white transition-colors"
              >
                <SkipForward size={20} />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setTrack(tracks[0])}
            className="w-14 h-14 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-xl shadow-primary/20 border border-primary/20"
          >
            <Music size={24} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MusicPlayer;
