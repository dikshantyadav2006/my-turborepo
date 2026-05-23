import React from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  Circle, 
  Trash2, 
  Cloud, 
  Smartphone,
  Flag,
  Calendar,
  RotateCcw
} from 'lucide-react';
import { clsx } from 'clsx';

const TaskItem = ({ task, onToggle, onDelete }) => {
  const isCloud = task.storageType === 'cloud';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={clsx(
        "group flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-2xl border transition-all",
        task.completed 
          ? "bg-secondary/30 border-transparent opacity-60" 
          : "bg-card border-border hover:shadow-sm"
      )}
    >
      <button 
        onClick={() => onToggle(task.id)}
        className={clsx(
          "transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center -ml-2 md:ml-0",
          task.completed ? "text-emerald-500" : "text-muted-foreground hover:text-primary"
        )}
      >
        {task.completed ? <CheckCircle2 size={22} /> : <Circle size={22} />}
      </button>

      <div className="flex-1 min-w-0 py-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className={clsx(
            "text-sm font-medium truncate",
            task.completed && "line-through text-muted-foreground"
          )}>
            {task.title}
          </h3>
          {task.priority && (
            <span className={clsx(
              "px-1.5 py-0.5 rounded text-[10px] font-bold uppercase",
              task.priority === 'Urgent' ? "bg-red-500/10 text-red-500" :
              task.priority === 'High' ? "bg-orange-500/10 text-orange-500" :
              "bg-blue-500/10 text-blue-500"
            )}>
              {task.priority}
            </span>
          )}
        </div>
        
        <div className="flex flex-wrap items-center gap-3 mt-1 text-[11px] text-muted-foreground">
          {task.category && (
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
              {task.category}
            </span>
          )}
          {task.dueDate && (
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {new Date(task.dueDate).toLocaleDateString()}
            </span>
          )}
          <span className="hidden md:flex items-center gap-1">
            {isCloud ? <Cloud size={12} /> : <Smartphone size={12} />}
            {isCloud ? 'Synced' : 'Local'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
        {task.completed && (
          <button 
            onClick={() => onToggle(task.id)}
            className="p-2 md:p-2.5 text-muted-foreground hover:text-primary rounded-lg hover:bg-secondary transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            title="Restore Task"
          >
            <RotateCcw size={18} />
          </button>
        )}
        <button 
          onClick={() => onDelete(task.id)}
          className="p-2 md:p-2.5 text-muted-foreground hover:text-destructive rounded-lg hover:bg-destructive/10 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </motion.div>
  );
};

export default TaskItem;
