import Dexie from 'dexie';

export const db = new Dexie('StudyOS_DB');

db.version(3).stores({
  tasks: '++id, title, completed, storageType, createdAt',
  notes: '++id, title, createdAt, updatedAt',
  analytics: '++id, date, xp, studyMinutes',
  sessions: '++id, mode, timestamp, duration',
  typingSessions: '++id, wpm, accuracy, mode, duration, timestamp, synced',
  typingBestScores: 'mode, wpm, accuracy',
  typingWeakKeys: 'key, errors, attempts, avgTime',
  typingSyncQueue: '++id, payload, retries, createdAt'
});

export default db;
