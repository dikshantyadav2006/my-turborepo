import { create } from 'zustand';

export const useMusicStore = create((set) => ({
  isPlaying: false,
  currentTrack: null,
  volume: 0.5,
  tracks: [
    { id: 'lofi', name: 'Lofi Study', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
    { id: 'rain', name: 'Soft Rain', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
    { id: 'cafe', name: 'Cafe Ambience', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
  ],
  
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setTrack: (track) => set({ currentTrack: track, isPlaying: true }),
  setVolume: (volume) => set({ volume }),
}));
