import React from 'react';
import { SEO, schemaBreadcrumb } from '../../../components/seo/SEO';
import { useNavigate } from 'react-router-dom';
import { useTypingStore } from '../store/typingStore';
import { lessons } from '../utils/wordUtils';
import { 
  GraduationCap, 
  Play, 
  Lock, 
  CheckCircle2, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { cn } from '../../../lib/utils';

const LessonCard = ({ lesson, isLocked, isCompleted, onStart }) => {
  return (
    <div className={cn(
      "group relative p-8 rounded-[2.5rem] border transition-all duration-300 overflow-hidden",
      isLocked 
        ? "bg-secondary/10 border-border/20 opacity-60" 
        : "bg-card border-border hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1"
    )}>
      {/* Background Decor */}
      <div className="absolute top-0 right-0 p-6 text-muted-foreground/5 group-hover:text-primary/10 transition-colors">
        <GraduationCap size={120} />
      </div>

      <div className="relative space-y-4">
        <div className="flex items-center justify-between">
          <span className={cn(
            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
            lesson.difficulty === 'Beginner' ? "bg-emerald-500/10 text-emerald-500" : "bg-blue-500/10 text-blue-500"
          )}>
            {lesson.difficulty}
          </span>
          {isCompleted && <CheckCircle2 className="text-emerald-500" size={20} />}
          {isLocked && <Lock className="text-muted-foreground" size={16} />}
        </div>

        <div>
          <h3 className="text-2xl font-black tracking-tight">{lesson.title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed mt-2 line-clamp-2">
            {lesson.description}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {lesson.characters.map((char) => (
            <span key={char} className="w-8 h-8 flex items-center justify-center bg-secondary/50 rounded-lg text-xs font-mono font-bold">
              {char}
            </span>
          ))}
        </div>

        <button
          disabled={isLocked}
          onClick={() => onStart(lesson)}
          className={cn(
            "w-full mt-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all",
            isLocked 
              ? "bg-secondary text-muted-foreground cursor-not-allowed" 
              : "bg-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/20"
          )}
        >
          {isLocked ? "Locked" : isCompleted ? "Practice Again" : "Start Lesson"}
          {!isLocked && <Play size={16} fill="currentColor" />}
        </button>
      </div>
    </div>
  );
};

const TypingLearnPage = () => {
  const navigate = useNavigate();
  const setLesson = useTypingStore(state => state.setLesson);

  const handleStartLesson = (lesson) => {
    // We transform the lesson characters into a repetitive practice text
    const practiceText = Array(10).fill(lesson.characters.join(' ')).join(' ');
    setLesson({ ...lesson, text: practiceText });
    navigate('/typing');
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-6 space-y-12 pb-32">
      <SEO
        title="Learning Path – Typing Master"
        description="Master touch typing with our step-by-step learning path. From home row basics to advanced symbols."
        canonical="/typing/learn"
        schema={[schemaBreadcrumb([{ name: 'Home', url: '/' }, { name: 'Typing', url: '/typing' }, { name: 'Learn', url: '/typing/learn' }])]}
      />

      <div className="space-y-4">
        <div className="flex items-center gap-3 text-primary">
          <Sparkles size={24} />
          <span className="text-xs font-black uppercase tracking-[0.3em]">Curriculum</span>
        </div>
        <h1 className="text-5xl font-black tracking-tight">Master Typing</h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Follow our structured curriculum to build muscle memory and reach professional typing speeds.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {lessons.map((lesson, i) => (
          <LessonCard 
            key={lesson.id} 
            lesson={lesson} 
            isLocked={i > 2} // Just as an example for UI
            isCompleted={i === 0} 
            onStart={handleStartLesson}
          />
        ))}
        
        {/* Placeholder for more */}
        <div className="p-8 rounded-[2.5rem] border border-dashed border-border/50 flex flex-col items-center justify-center text-center space-y-4 opacity-50">
          <div className="w-16 h-16 bg-secondary/50 rounded-2xl flex items-center justify-center text-muted-foreground">
            <ChevronRight size={32} />
          </div>
          <p className="font-bold text-muted-foreground">More lessons coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default TypingLearnPage;
