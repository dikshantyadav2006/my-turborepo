import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Zap, 
  BookOpen, 
  Activity, 
  Code, 
  Dumbbell, 
  Droplet, 
  Heart, 
  Smile, 
  Brain,
  Plus,
  Trash2
} from 'lucide-react';

const ICONS = {
  Zap: Zap,
  BookOpen: BookOpen,
  Activity: Activity,
  Code: Code,
  Dumbbell: Dumbbell,
  Droplet: Droplet,
  Heart: Heart,
  Smile: Smile,
  Brain: Brain
};

const COLORS = [
  { id: 'emerald', bg: 'bg-emerald-500', text: 'text-emerald-500', border: 'border-emerald-500/20' },
  { id: 'blue', bg: 'bg-blue-500', text: 'text-blue-500', border: 'border-blue-500/20' },
  { id: 'purple', bg: 'bg-purple-500', text: 'text-purple-500', border: 'border-purple-500/20' },
  { id: 'orange', bg: 'bg-orange-500', text: 'text-orange-500', border: 'border-orange-500/20' },
  { id: 'rose', bg: 'bg-rose-500', text: 'text-rose-500', border: 'border-rose-500/20' },
  { id: 'pink', bg: 'bg-pink-500', text: 'text-pink-500', border: 'border-pink-500/20' }
];

const WEEKDAYS = [
  { label: 'M', value: 1 },
  { label: 'T', value: 2 },
  { label: 'W', value: 3 },
  { label: 'T', value: 4 },
  { label: 'F', value: 5 },
  { label: 'S', value: 6 },
  { label: 'S', value: 0 }
];

const AddEditHabitModal = ({ isOpen, onClose, habitToEdit, onSave, onDelete }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('Zap');
  const [color, setColor] = useState('emerald');
  const [type, setType] = useState('boolean');
  const [target, setTarget] = useState(1);
  const [unit, setUnit] = useState('');
  const [frequency, setFrequency] = useState('daily');
  const [daysOfWeek, setDaysOfWeek] = useState([1, 2, 3, 4, 5]); // default weekdays

  useEffect(() => {
    if (habitToEdit) {
      setName(habitToEdit.name || '');
      setDescription(habitToEdit.description || '');
      setIcon(habitToEdit.icon || 'Zap');
      setColor(habitToEdit.color || 'emerald');
      setType(habitToEdit.type || 'boolean');
      setTarget(habitToEdit.target || 1);
      setUnit(habitToEdit.unit || '');
      setFrequency(habitToEdit.frequency || 'daily');
      setDaysOfWeek(habitToEdit.daysOfWeek || []);
    } else {
      setName('');
      setDescription('');
      setIcon('Zap');
      setColor('emerald');
      setType('boolean');
      setTarget(1);
      setUnit('');
      setFrequency('daily');
      setDaysOfWeek([1, 2, 3, 4, 5]);
    }
  }, [habitToEdit, isOpen]);

  // Adjust unit defaults based on type
  useEffect(() => {
    if (!habitToEdit) {
      if (type === 'boolean') {
        setTarget(1);
        setUnit('');
      } else if (type === 'number') {
        setTarget(2);
        setUnit('km');
      } else if (type === 'duration') {
        setTarget(45);
        setUnit('min');
      } else if (type === 'counter') {
        setTarget(30);
        setUnit('reps');
      }
    }
  }, [type]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      description: description.trim(),
      icon,
      color,
      type,
      target: parseFloat(target) || 1,
      unit,
      frequency,
      daysOfWeek: frequency === 'weekly' ? daysOfWeek : []
    });
    onClose();
  };

  const toggleDay = (day) => {
    if (daysOfWeek.includes(day)) {
      setDaysOfWeek(daysOfWeek.filter(d => d !== day));
    } else {
      setDaysOfWeek([...daysOfWeek, day]);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-background/60 backdrop-blur-md"
        />

        {/* Modal content body */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-border bg-card shadow-2xl p-6 md:p-8 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <h2 className="text-xl font-bold tracking-tight">
              {habitToEdit ? 'Edit Habit' : 'Create New Habit'}
            </h2>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-1 py-4 space-y-6 scrollbar-hide">
            
            {/* Input Name */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Habit Name</label>
              <input 
                type="text"
                required
                placeholder="e.g. Reading Books, Pushups, Drink Water"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-secondary/30 border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>

            {/* Input Description */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</label>
              <input 
                type="text"
                placeholder="e.g. 1 hour daily, build core strength"
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-secondary/30 border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>

            {/* Selector Visual (Icon + Color) */}
            <div className="grid grid-cols-2 gap-4">
              {/* Color list */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Theme Color</label>
                <div className="flex flex-wrap gap-2 py-1">
                  {COLORS.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setColor(c.id)}
                      className={`w-6 h-6 rounded-full ${c.bg} cursor-pointer transition-transform ${color === c.id ? 'scale-125 ring-2 ring-primary ring-offset-2 ring-offset-card' : 'opacity-70 hover:opacity-100'}`}
                    />
                  ))}
                </div>
              </div>

              {/* Icon selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Icon</label>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(ICONS).map(iconName => {
                    const IconComponent = ICONS[iconName];
                    const activeColorClass = COLORS.find(c => c.id === color)?.text || 'text-primary';
                    return (
                      <button
                        key={iconName}
                        type="button"
                        onClick={() => setIcon(iconName)}
                        className={`p-1.5 rounded-lg border transition-all ${icon === iconName ? `border-border bg-secondary/50 ${activeColorClass}` : 'border-transparent text-muted-foreground hover:bg-secondary/30 hover:text-foreground'}`}
                      >
                        <IconComponent size={18} />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Type selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Type</label>
              <div className="grid grid-cols-4 gap-2">
                {['boolean', 'number', 'duration', 'counter'].map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`py-2 rounded-xl text-xs font-medium border capitalize transition-all cursor-pointer ${type === t ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary/20 border-border text-muted-foreground hover:bg-secondary/40 hover:text-foreground'}`}
                  >
                    {t === 'boolean' ? 'Yes/No' : t}
                  </button>
                ))}
              </div>
            </div>

            {/* Goal target config (Numbers) */}
            {type !== 'boolean' && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="grid grid-cols-2 gap-4"
              >
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Daily Target Goal</label>
                  <input 
                    type="number"
                    min="0.1"
                    step="any"
                    value={target}
                    onChange={e => setTarget(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-secondary/30 border border-border text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Unit</label>
                  <input 
                    type="text"
                    placeholder="e.g. km, glasses, mins, reps"
                    value={unit}
                    onChange={e => setUnit(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-secondary/30 border border-border text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
              </motion.div>
            )}

            {/* Schedule Frequency selector */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Frequency</label>
                <div className="flex gap-2">
                  {['daily', 'weekly'].map(f => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFrequency(f)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border capitalize cursor-pointer transition-all ${frequency === f ? 'bg-secondary text-foreground border-border' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {frequency === 'weekly' && (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-2"
                >
                  <span className="text-[11px] text-muted-foreground block">Active on selected days:</span>
                  <div className="flex justify-between p-1 bg-secondary/20 rounded-2xl border border-border/50">
                    {WEEKDAYS.map(day => {
                      const isActive = daysOfWeek.includes(day.value);
                      return (
                        <button
                          key={day.value}
                          type="button"
                          onClick={() => toggleDay(day.value)}
                          className={`w-9 h-9 rounded-xl text-xs font-semibold flex items-center justify-center transition-all ${isActive ? 'bg-primary text-primary-foreground scale-105' : 'text-muted-foreground hover:bg-secondary/40 hover:text-foreground'}`}
                        >
                          {day.label}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </div>

          </form>

          {/* Footer controls */}
          <div className="pt-4 border-t border-border flex justify-between gap-3">
            {habitToEdit ? (
              <button
                type="button"
                onClick={() => {
                  onDelete(habitToEdit.id);
                  onClose();
                }}
                className="px-4 py-3 rounded-2xl bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all flex items-center gap-2 text-sm font-medium cursor-pointer"
              >
                <Trash2 size={16} />
                Delete
              </button>
            ) : (
              <div />
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-3 rounded-2xl bg-secondary/50 text-foreground hover:bg-secondary transition-colors text-sm font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!name.trim()}
                onClick={handleSubmit}
                className="px-6 py-3 rounded-2xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40 disabled:pointer-events-none text-sm font-medium cursor-pointer"
              >
                {habitToEdit ? 'Save Changes' : 'Create Habit'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddEditHabitModal;
