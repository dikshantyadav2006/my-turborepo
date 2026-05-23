import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2,
  ListTodo,
  MoreVertical,
  Calendar,
  Clock,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { useTaskStore } from '../store/taskStore';
import TaskItem from '../components/TaskItem';
import { 
  useReactTable, 
  getCoreRowModel, 
  flexRender,
  getFilteredRowModel
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { toast } from 'sonner';

const TasksPage = () => {
  const { tasks, addTask, toggleTask, deleteTask, initTasks } = useTaskStore();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [globalFilter, setGlobalFilter] = useState('');

  useEffect(() => {
    initTasks();
  }, []);

  const activeTasks = useMemo(() => tasks.filter(t => !t.completed), [tasks]);
  const completedTasks = useMemo(() => tasks.filter(t => t.completed), [tasks]);

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    
    addTask({
      title: newTaskTitle,
      priority: 'Medium',
      category: 'Study'
    });
    setNewTaskTitle('');
    setIsAdding(false);
    toast.success('Task added');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20 animate-in fade-in duration-700">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">Tasks</h1>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5 font-medium">
              <AlertCircle size={14} className="text-primary" />
              {activeTasks.length} pending
            </span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span>{completedTasks.length} completed</span>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative group flex-1 md:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search tasks..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-secondary/50 border border-transparent focus:border-primary/10 rounded-xl text-sm outline-none transition-all w-full md:w-64 min-h-[44px]"
            />
          </div>
          <button className="p-2.5 bg-secondary/50 rounded-xl hover:bg-secondary transition-colors text-muted-foreground min-w-[44px] min-h-[44px] flex items-center justify-center">
            <Filter size={20} />
          </button>
        </div>
      </header>

      {/* Add Task Input */}
      <motion.form 
        onSubmit={handleAddTask} 
        className="relative group bg-card border border-border shadow-sm rounded-3xl overflow-hidden focus-within:ring-2 ring-primary/10 transition-all"
      >
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          onFocus={() => setIsAdding(true)}
          placeholder="What needs to be done?"
          className="w-full bg-transparent px-14 py-6 text-lg font-medium outline-none placeholder:text-muted-foreground/50"
        />
        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground">
          <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center">
            <Plus size={16} />
          </div>
        </div>
        
        <AnimatePresence>
          {isAdding && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 bg-background p-1 rounded-2xl shadow-xl border border-border"
            >
              <div className="flex px-2 py-1 gap-4 mr-2">
                <button type="button" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground">Today</button>
                <button type="button" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground">Priority</button>
              </div>
              <button 
                type="submit"
                className="bg-primary text-primary-foreground text-xs font-bold px-6 py-2.5 rounded-xl hover:opacity-90 shadow-lg shadow-primary/20"
              >
                Add Task
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.form>

      {/* Lists */}
      <div className="space-y-12">
        {/* Active Tasks */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-2">
            <ListTodo size={14} className="text-primary" />
            <span>Active Focus</span>
          </div>
          <div className="grid gap-3">
            <AnimatePresence mode="popLayout">
              {activeTasks.length > 0 ? (
                activeTasks.map(task => (
                  <TaskItem 
                    key={task.id} 
                    task={task} 
                    onToggle={toggleTask} 
                    onDelete={(id) => {
                      deleteTask(id);
                      toast.error('Task deleted');
                    }} 
                  />
                ))
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-20 bg-secondary/10 rounded-[3rem] border-2 border-dashed border-border flex flex-col items-center gap-3"
                >
                  <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center">
                    <CheckCircle2 size={24} className="text-emerald-500" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold">You're all caught up</p>
                    <p className="text-sm text-muted-foreground">Relax or start a new study session</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-2">
              <CheckCircle2 size={14} className="text-emerald-500" />
              <span>Recently Completed</span>
            </div>
            <div className="grid gap-3">
              <AnimatePresence mode="popLayout">
                {completedTasks.map(task => (
                  <TaskItem 
                    key={task.id} 
                    task={task} 
                    onToggle={toggleTask} 
                    onDelete={deleteTask} 
                  />
                ))}
              </AnimatePresence>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default TasksPage;
