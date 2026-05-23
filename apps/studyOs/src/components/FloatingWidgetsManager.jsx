import React, { useState, useRef, useEffect } from 'react';
import { useWidgetStore } from '../store/widgetStore';
import { Plus, Trash2, RotateCcw, PenTool, Eraser, Check } from 'lucide-react';

// Draggable macOS Frame Wrapper
const FloatingWindow = ({ title, onClose, defaultX = 100, defaultY = 100, width = "w-80", children }) => {
  const [pos, setPos] = useState({ x: defaultX, y: defaultY });
  const windowRef = useRef(null);

  const handlePointerDown = (e) => {
    // Only drag with header click (avoid dragging when interactive elements are clicked)
    if (e.target.closest('button') || e.target.closest('input') || e.target.closest('canvas')) return;
    
    e.preventDefault();
    const header = e.currentTarget;
    header.setPointerCapture(e.pointerId);
    const startX = e.clientX - pos.x;
    const startY = e.clientY - pos.y;

    const handlePointerMove = (moveEvent) => {
      setPos({
        x: moveEvent.clientX - startX,
        y: moveEvent.clientY - startY
      });
    };

    const handlePointerUp = (upEvent) => {
      header.releasePointerCapture(upEvent.pointerId);
      header.removeEventListener('pointermove', handlePointerMove);
      header.removeEventListener('pointerup', handlePointerUp);
    };

    header.addEventListener('pointermove', handlePointerMove);
    header.addEventListener('pointerup', handlePointerUp);
  };

  return (
    <div
      ref={windowRef}
      style={{ transform: `translate(${pos.x}px, ${pos.y}px)`, zIndex: 9999 }}
      className={`fixed top-0 left-0 ${width} bg-zinc-950/90 backdrop-blur-2xl text-zinc-100 rounded-3xl border border-zinc-800 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col font-sans select-none transition-shadow duration-200 focus-within:shadow-[0_30px_60px_-15px_rgba(6,182,212,0.15)]`}
    >
      {/* Header bar (macOS Style) */}
      <div
        onPointerDown={handlePointerDown}
        className="px-4 py-3.5 bg-zinc-900/60 border-b border-zinc-800/80 flex justify-between items-center cursor-move active:cursor-grabbing select-none"
      >
        <div className="flex gap-2 items-center">
          <button
            onClick={onClose}
            className="w-3 h-3 bg-red-500 rounded-full hover:bg-red-600 transition flex items-center justify-center text-[7px] text-red-950 font-bold"
            title="Close"
          >
            ×
          </button>
          <div className="w-3 h-3 bg-yellow-500 rounded-full cursor-not-allowed" title="Minimize (Unavailable)" />
          <div className="w-3 h-3 bg-green-500 rounded-full cursor-not-allowed" title="Expand (Unavailable)" />
        </div>
        <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase select-none">{title}</span>
        <div className="w-12" /> {/* spacer to balance controls */}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto max-h-[75vh] p-4 bg-zinc-950/30">
        {children}
      </div>
    </div>
  );
};

// 1. Sleek Math Calculator Widget
const CalculatorWidget = () => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');

  const handleInput = (val) => {
    if (val === 'C') {
      setDisplay('0');
      setEquation('');
    } else if (val === 'del') {
      if (equation.length > 0) {
        const nextEq = equation.slice(0, -1);
        setEquation(nextEq);
        setDisplay(nextEq || '0');
      }
    } else if (val === '=') {
      try {
        const sanitized = equation.replace(/[^0-9+\-*/().]/g, '');
        if (!sanitized) return;
        const result = new Function(`return ${sanitized}`)();
        const output = Number.isFinite(result) ? Number(result.toFixed(6)).toString() : 'Error';
        setDisplay(output);
        setEquation(output);
      } catch (e) {
        setDisplay('Error');
        setEquation('');
      }
    } else {
      const nextEq = equation + val;
      setEquation(nextEq);
      setDisplay(nextEq);
    }
  };

  const btnClass = "h-11 rounded-xl bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-700/80 font-semibold text-sm transition-all border border-zinc-800/40 text-zinc-200";
  const opClass = "h-11 rounded-xl bg-cyan-600/10 hover:bg-cyan-600/25 text-cyan-400 font-bold text-sm transition-all border border-cyan-500/10";

  return (
    <div className="flex flex-col gap-3 font-mono">
      <div className="bg-zinc-950/80 rounded-2xl border border-zinc-800 p-3.5 text-right flex flex-col justify-end h-16 min-h-[4rem] overflow-hidden">
        <span className="text-[10px] text-zinc-500 truncate max-w-full mb-1">{equation || '0'}</span>
        <span className="text-xl font-bold tracking-tight text-cyan-400 truncate">{display}</span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        <button onClick={() => handleInput('C')} className="col-span-2 h-11 rounded-xl bg-red-950/20 hover:bg-red-950/40 text-red-400 font-bold text-sm border border-red-500/10 transition">CLEAR</button>
        <button onClick={() => handleInput('del')} className={opClass}>⌫</button>
        <button onClick={() => handleInput('/')} className={opClass}>÷</button>

        {['7', '8', '9', '*'].map((x, i) => (
          <button key={x} onClick={() => handleInput(x)} className={i === 3 ? opClass : btnClass}>{x === '*' ? '×' : x}</button>
        ))}
        {['4', '5', '6', '-'].map((x, i) => (
          <button key={x} onClick={() => handleInput(x)} className={i === 3 ? opClass : btnClass}>{x === '-' ? '−' : x}</button>
        ))}
        {['1', '2', '3', '+'].map((x, i) => (
          <button key={x} onClick={() => handleInput(x)} className={i === 3 ? opClass : btnClass}>{x}</button>
        ))}
        <button onClick={() => handleInput('0')} className={`${btnClass} col-span-2`}>0</button>
        <button onClick={() => handleInput('.')} className={btnClass}>.</button>
        <button onClick={() => handleInput('=')} className="h-11 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-black text-base border border-cyan-400 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]">=</button>
      </div>
    </div>
  );
};

// 2. Interactive Canvas Whiteboard
const WhiteboardWidget = () => {
  const canvasRef = useRef(null);
  const [color, setColor] = useState('#06b6d4'); // Cyan-500 default
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState('pencil'); // 'pencil', 'eraser'

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#09090b'; // zinc-950 fill
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = tool === 'eraser' ? '#09090b' : color;
    ctx.lineWidth = tool === 'eraser' ? strokeWidth * 3 : strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const colors = ['#06b6d4', '#10b981', '#ef4444', '#a855f7', '#f59e0b', '#f4f4f5'];

  return (
    <div className="flex flex-col gap-3">
      {/* Canvas Drawing Area */}
      <canvas
        ref={canvasRef}
        width={320}
        height={240}
        onPointerDown={startDrawing}
        onPointerMove={draw}
        onPointerUp={stopDrawing}
        onPointerLeave={stopDrawing}
        className="w-full bg-zinc-950 rounded-2xl border border-zinc-800 touch-none cursor-crosshair shadow-inner"
      />
      {/* Toolbar */}
      <div className="flex items-center justify-between bg-zinc-900/60 p-2 border border-zinc-800 rounded-2xl gap-2">
        <div className="flex gap-1">
          <button
            onClick={() => setTool('pencil')}
            className={`p-2 rounded-xl transition ${tool === 'pencil' ? 'bg-cyan-500 text-zinc-950 font-bold' : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'}`}
            title="Pencil"
          >
            <PenTool size={16} />
          </button>
          <button
            onClick={() => setTool('eraser')}
            className={`p-2 rounded-xl transition ${tool === 'eraser' ? 'bg-cyan-500 text-zinc-950 font-bold' : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'}`}
            title="Eraser"
          >
            <Eraser size={16} />
          </button>
          <button
            onClick={clearCanvas}
            className="p-2 rounded-xl text-red-400 hover:bg-red-500/10 transition"
            title="Clear Board"
          >
            <RotateCcw size={16} />
          </button>
        </div>

        {/* Color Palette */}
        {tool === 'pencil' && (
          <div className="flex gap-1">
            {colors.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                style={{ backgroundColor: c }}
                className={`w-5 h-5 rounded-full border transition ${color === c ? 'ring-2 ring-zinc-100 border-zinc-900 scale-110 shadow-lg' : 'border-transparent hover:scale-105'}`}
              />
            ))}
          </div>
        )}

        {/* Stroke Width Slider */}
        <input
          type="range"
          min="1"
          max="15"
          value={strokeWidth}
          onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
          className="w-16 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          title="Line Size"
        />
      </div>
    </div>
  );
};

// 3. Double-Sided Study Flashcards Widget (3D Flip Effect)
const FlashcardsWidget = () => {
  const [cards, setCards] = useState([
    { id: 1, front: "What is E = mc²?", back: "Energy (E) equals mass (m) times speed of light squared (c²). Formulated by Einstein in 1905." },
    { id: 2, front: "What is the pH of pure water?", back: "The pH of pure water is 7 (neutral) at 25°C." },
    { id: 3, front: "Known as the powerhouse of the cell?", back: "Mitochondria. It generates chemical energy in the form of ATP." }
  ]);
  const [index, setIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // New card form
  const [frontInput, setFrontInput] = useState('');
  const [backInput, setBackInput] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const addCard = (e) => {
    e.preventDefault();
    if (!frontInput.trim() || !backInput.trim()) return;
    const newCard = {
      id: Date.now(),
      front: frontInput.trim(),
      back: backInput.trim()
    };
    setCards([...cards, newCard]);
    setFrontInput('');
    setBackInput('');
    setShowAddForm(false);
    setIndex(cards.length); // switch to the newly created card
    setIsFlipped(false);
  };

  const deleteCard = () => {
    if (cards.length <= 1) {
      alert("You need at least one card in the deck!");
      return;
    }
    const nextDeck = cards.filter((_, i) => i !== index);
    setCards(nextDeck);
    setIndex(Math.max(0, index - 1));
    setIsFlipped(false);
  };

  return (
    <div className="flex flex-col gap-3 font-sans">
      {!showAddForm ? (
        <>
          {/* 3D Flip Card Container */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-full h-40 cursor-pointer [perspective:1000px]"
          >
            <div className={`relative w-full h-full duration-500 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
              {/* Front Side */}
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl p-4 flex flex-col justify-between items-center text-center [backface-visibility:hidden]">
                <span className="text-[9px] font-bold text-cyan-400/80 uppercase tracking-widest">FRONT • CLICK TO FLIP</span>
                <p className="text-sm font-semibold text-zinc-100 max-h-24 overflow-y-auto leading-relaxed">{cards[index]?.front}</p>
                <span className="text-[10px] text-zinc-500 font-mono">Card {index + 1} of {cards.length}</span>
              </div>
              {/* Back Side */}
              <div className="absolute inset-0 bg-zinc-900 border border-cyan-500/30 rounded-2xl p-4 flex flex-col justify-between items-center text-center [backface-visibility:hidden] [transform:rotateY(180deg)] shadow-[0_0_20px_rgba(6,182,212,0.05)]">
                <span className="text-[9px] font-bold text-emerald-400/80 uppercase tracking-widest">BACK • CLICK TO FLIP</span>
                <p className="text-xs text-zinc-300 max-h-24 overflow-y-auto leading-relaxed px-1">{cards[index]?.back}</p>
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex gap-2 items-center justify-between mt-1">
            <div className="flex gap-1.5">
              <button
                onClick={() => {
                  setIsFlipped(false);
                  setIndex((index - 1 + cards.length) % cards.length);
                }}
                className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold border border-zinc-800 transition"
              >
                Prev
              </button>
              <button
                onClick={() => {
                  setIsFlipped(false);
                  setIndex((index + 1) % cards.length);
                }}
                className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold border border-zinc-800 transition"
              >
                Next
              </button>
            </div>
            <div className="flex gap-1.5">
              <button
                onClick={() => setShowAddForm(true)}
                className="p-1.5 rounded-xl bg-cyan-600/10 hover:bg-cyan-600/25 border border-cyan-500/10 text-cyan-400 text-xs font-bold transition flex items-center gap-1"
                title="Add New Card"
              >
                <Plus size={14} /> Add
              </button>
              <button
                onClick={deleteCard}
                className="p-1.5 rounded-xl bg-red-950/20 hover:bg-red-950/40 border border-red-500/10 text-red-400 text-xs transition"
                title="Delete Card"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </>
      ) : (
        /* Create Card Form */
        <form onSubmit={addCard} className="flex flex-col gap-2.5">
          <span className="text-[10px] font-bold text-zinc-400 tracking-wider">CREATE STUDY FLASHCARD</span>
          <input
            type="text"
            placeholder="Front (Question/Concept)"
            value={frontInput}
            onChange={(e) => setFrontInput(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 focus:border-cyan-500/50 rounded-xl px-3 py-2 text-xs focus:outline-none text-zinc-100 transition"
            maxLength={100}
            required
          />
          <textarea
            placeholder="Back (Answer/Explanation)"
            value={backInput}
            onChange={(e) => setBackInput(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 focus:border-cyan-500/50 rounded-xl px-3 py-2 text-xs focus:outline-none text-zinc-100 h-16 resize-none transition"
            maxLength={250}
            required
          />
          <div className="flex gap-2 justify-end mt-1">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 text-xs font-bold shadow-[0_0_10px_rgba(6,182,212,0.2)] transition"
            >
              Save Card
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

// 4. Interactive Periodic Table Widget
const PeriodicTableWidget = () => {
  const [selected, setSelected] = useState(null);

  // First 20 elements (Hydrogen to Calcium)
  const elements = [
    { num: 1, sym: "H", name: "Hydrogen", wt: "1.008", cat: "nonmetal", desc: "Most abundant chemical substance in the Universe." },
    { num: 2, sym: "He", name: "Helium", wt: "4.003", cat: "noble", desc: "Colorless, odorless, tasteless, non-toxic, inert gas." },
    { num: 3, sym: "Li", name: "Lithium", wt: "6.94", cat: "alkali", desc: "Soft, silvery-white alkali metal. Lightest solid element." },
    { num: 4, sym: "Be", name: "Beryllium", wt: "9.012", cat: "alkaline", desc: "Relatively rare element in the universe. Extremely strong." },
    { num: 5, sym: "B", name: "Boron", wt: "10.81", cat: "metalloid", desc: "Low-abundance element. Used extensively in fiberglass." },
    { num: 6, sym: "C", name: "Carbon", wt: "12.011", cat: "nonmetal", desc: "Tetravalent nonmetal. Chemical basis for all organic life." },
    { num: 7, sym: "N", name: "Nitrogen", wt: "14.007", cat: "nonmetal", desc: "Makes up about 78% of Earth's atmosphere." },
    { num: 8, sym: "O", name: "Oxygen", wt: "15.999", cat: "nonmetal", desc: "Highly reactive nonmetal. Crucial for respiration of life." },
    { num: 9, sym: "F", name: "Fluorine", wt: "18.998", cat: "halogen", desc: "Extremely toxic halogen gas. Most electronegative element." },
    { num: 10, sym: "Ne", name: "Neon", wt: "20.18", cat: "noble", desc: "Noble gas. Glows reddish-orange in high-voltage glow discharge." },
    { num: 11, sym: "Na", name: "Sodium", wt: "22.99", cat: "alkali", desc: "Soft, reactive alkali metal. Key component of salt (NaCl)." },
    { num: 12, sym: "Mg", name: "Magnesium", wt: "24.305", cat: "alkaline", desc: "Shiny gray solid. Essential nutrient for biological systems." },
    { num: 13, sym: "Al", name: "Aluminum", wt: "26.982", cat: "post-transition", desc: "Low density metal. Resistant to corrosion." },
    { num: 14, sym: "Si", name: "Silicon", wt: "28.085", cat: "metalloid", desc: "Hard, crystalline semiconductor. Basis of microchips." },
    { num: 15, sym: "P", name: "Phosphorus", wt: "30.974", cat: "nonmetal", desc: "Highly reactive. Key role in DNA/RNA structures." },
    { num: 16, sym: "S", name: "Sulfur", wt: "32.06", cat: "nonmetal", desc: "Abundant, multivalent nonmetal. Yellow crystalline solid." },
    { num: 17, sym: "Cl", name: "Chlorine", wt: "35.45", cat: "halogen", desc: "Halogen gas. Strong disinfectant used in water pools." },
    { num: 18, sym: "Ar", name: "Argon", wt: "39.948", cat: "noble", desc: "Third-most abundant gas in Earth's atmosphere." },
    { num: 19, sym: "K", name: "Potassium", wt: "39.098", cat: "alkali", desc: "Silvery alkali metal. Crucial electrolyte for neurons." },
    { num: 20, sym: "Ca", name: "Calcium", wt: "40.078", cat: "alkaline", desc: "Essential for living organisms, especially in bone building." }
  ];

  const catColors = {
    nonmetal: "bg-blue-500/10 border-blue-500/40 text-blue-300 hover:bg-blue-500/20",
    noble: "bg-pink-500/10 border-pink-500/40 text-pink-300 hover:bg-pink-500/20",
    alkali: "bg-amber-500/10 border-amber-500/40 text-amber-300 hover:bg-amber-500/20",
    alkaline: "bg-orange-500/10 border-orange-500/40 text-orange-300 hover:bg-orange-500/20",
    metalloid: "bg-teal-500/10 border-teal-500/40 text-teal-300 hover:bg-teal-500/20",
    halogen: "bg-purple-500/10 border-purple-500/40 text-purple-300 hover:bg-purple-500/20",
    "post-transition": "bg-emerald-500/10 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20"
  };

  return (
    <div className="flex flex-col gap-3 font-sans">
      <div className="grid grid-cols-5 gap-1.5 max-h-56 overflow-y-auto p-0.5">
        {elements.map((el) => (
          <button
            key={el.num}
            onClick={() => setSelected(el)}
            className={`p-1.5 rounded-xl border flex flex-col items-center justify-center transition active:scale-95 ${catColors[el.cat] || 'bg-zinc-800 border-zinc-700 text-zinc-300'} ${selected?.num === el.num ? 'ring-2 ring-cyan-400 scale-105 shadow-[0_0_10px_rgba(6,182,212,0.25)]' : ''}`}
          >
            <span className="text-[8px] text-zinc-500 self-start font-mono leading-none">{el.num}</span>
            <span className="text-sm font-black leading-none my-0.5">{el.sym}</span>
            <span className="text-[7px] truncate max-w-full text-zinc-400 leading-none">{el.name}</span>
          </button>
        ))}
      </div>

      {selected ? (
        <div className="bg-zinc-900/80 rounded-2xl border border-zinc-800 p-3.5 flex flex-col gap-1.5 shadow-inner">
          <div className="flex justify-between items-baseline">
            <h4 className="font-bold text-zinc-100 flex items-center gap-1.5">
              <span className="text-xl text-cyan-400 font-mono">{selected.sym}</span>
              <span>{selected.name}</span>
            </h4>
            <span className="text-xs text-zinc-500 font-mono">No. {selected.num} • {selected.wt} u</span>
          </div>
          <p className="text-[10px] leading-relaxed text-zinc-400 italic">"{selected.desc}"</p>
          <div className="flex items-center justify-between text-[8px] font-bold uppercase tracking-wider text-cyan-500/80 border-t border-zinc-800/60 pt-1.5 mt-0.5">
            <span>Category: {selected.cat.replace("-", " ")}</span>
            <button onClick={() => setSelected(null)} className="text-zinc-500 hover:text-zinc-300">Clear</button>
          </div>
        </div>
      ) : (
        <div className="bg-zinc-900/40 rounded-2xl border border-zinc-800/40 p-3 text-center text-xs text-zinc-500 italic py-5">
          Tap any chemical element above to inspect detailed molecular chemistry atomic metadata
        </div>
      )}
    </div>
  );
};

// 5. Physics & Chemistry Calculator/Solver Widget
const PhysicsWidget = () => {
  const [activeTab, setActiveTab] = useState('physics'); // 'physics', 'chemistry'
  
  // Physics Solver State
  const [mass, setMass] = useState('');
  const [acceleration, setAcceleration] = useState('');
  const [force, setForce] = useState(null);

  const [keMass, setKeMass] = useState('');
  const [velocity, setVelocity] = useState('');
  const [ke, setKe] = useState(null);

  // Chemistry Solver State
  const [formula, setFormula] = useState('');
  const [chemResult, setChemResult] = useState(null);

  const calculateForce = (e) => {
    e.preventDefault();
    const m = parseFloat(mass);
    const a = parseFloat(acceleration);
    if (!isNaN(m) && !isNaN(a)) {
      setForce((m * a).toFixed(3));
    }
  };

  const calculateKE = (e) => {
    e.preventDefault();
    const m = parseFloat(keMass);
    const v = parseFloat(velocity);
    if (!isNaN(m) && !isNaN(v)) {
      setKe((0.5 * m * v * v).toFixed(3));
    }
  };

  const calculateMolarMass = (e) => {
    e.preventDefault();
    if (!formula.trim()) return;
    
    const atomicWeights = {
      H: 1.008, He: 4.003, Li: 6.94, Be: 9.012, B: 10.81, C: 12.011,
      N: 14.007, O: 15.999, F: 18.998, Ne: 20.18, Na: 22.99, Mg: 24.305,
      Al: 26.982, Si: 28.085, P: 30.974, S: 32.06, Cl: 35.45, Ar: 39.948,
      K: 39.098, Ca: 40.078
    };

    const regex = /([A-Z][a-z]*)(\d*)/g;
    let match;
    let totalMass = 0;
    let parsedElements = [];
    
    try {
      while ((match = regex.exec(formula.trim())) !== null) {
        const element = match[1];
        const count = parseInt(match[2] || "1", 10);
        
        if (atomicWeights[element]) {
          const weight = atomicWeights[element] * count;
          totalMass += weight;
          parsedElements.push(`${element}(${atomicWeights[element]}×${count})`);
        } else {
          setChemResult({ error: `Unknown/unsupported element: ${element}` });
          return;
        }
      }
      
      if (totalMass > 0) {
        setChemResult({
          mass: totalMass.toFixed(3),
          breakdown: parsedElements.join(" + ")
        });
      } else {
        setChemResult({ error: "Invalid formula layout. Example: H2O, C6H12O6" });
      }
    } catch (err) {
      setChemResult({ error: "Failed to parse formula." });
    }
  };

  return (
    <div className="flex flex-col gap-3 font-sans">
      {/* Tabs */}
      <div className="flex bg-zinc-900 p-1 border border-zinc-800 rounded-2xl">
        <button
          onClick={() => setActiveTab('physics')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition ${activeTab === 'physics' ? 'bg-cyan-500 text-zinc-950 shadow-sm' : 'text-zinc-400 hover:text-zinc-100'}`}
        >
          Physics Formulas
        </button>
        <button
          onClick={() => setActiveTab('chemistry')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition ${activeTab === 'chemistry' ? 'bg-cyan-500 text-zinc-950 shadow-sm' : 'text-zinc-400 hover:text-zinc-100'}`}
        >
          Chemistry Molar Mass
        </button>
      </div>

      {activeTab === 'physics' ? (
        <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
          {/* F = ma Solver */}
          <form onSubmit={calculateForce} className="bg-zinc-900/60 p-3 rounded-2xl border border-zinc-800 flex flex-col gap-2">
            <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest">FORCE SOLVER (F = ma)</span>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                step="any"
                placeholder="Mass (kg)"
                value={mass}
                onChange={(e) => setMass(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-500/50 text-zinc-200"
                required
              />
              <input
                type="number"
                step="any"
                placeholder="Accel (m/s²)"
                value={acceleration}
                onChange={(e) => setAcceleration(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-500/50 text-zinc-200"
                required
              />
            </div>
            <div className="flex items-center justify-between mt-1">
              <button type="submit" className="px-3.5 py-1.5 bg-zinc-850 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-[10px] font-bold text-zinc-300 transition">Compute</button>
              {force !== null && <span className="text-xs font-bold text-emerald-400 font-mono">{force} N</span>}
            </div>
          </form>

          {/* KE = 1/2 m v2 Solver */}
          <form onSubmit={calculateKE} className="bg-zinc-900/60 p-3 rounded-2xl border border-zinc-800 flex flex-col gap-2">
            <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest">KINETIC ENERGY (KE = ½mv²)</span>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                step="any"
                placeholder="Mass (kg)"
                value={keMass}
                onChange={(e) => setKeMass(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-500/50 text-zinc-200"
                required
              />
              <input
                type="number"
                step="any"
                placeholder="Velocity (m/s)"
                value={velocity}
                onChange={(e) => setVelocity(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-500/50 text-zinc-200"
                required
              />
            </div>
            <div className="flex items-center justify-between mt-1">
              <button type="submit" className="px-3.5 py-1.5 bg-zinc-850 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-[10px] font-bold text-zinc-300 transition">Compute</button>
              {ke !== null && <span className="text-xs font-bold text-emerald-400 font-mono">{ke} J</span>}
            </div>
          </form>
        </div>
      ) : (
        /* Chemistry Molar Mass Solver */
        <form onSubmit={calculateMolarMass} className="bg-zinc-900/60 p-3 rounded-2xl border border-zinc-800 flex flex-col gap-2.5">
          <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest">MOLAR MASS SOLVER (FIRST 20 ELEMENTS)</span>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. H2O, CO2, NaCl, C6H12O6"
              value={formula}
              onChange={(e) => setFormula(e.target.value)}
              className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-500/50 text-zinc-200 uppercase font-mono"
              required
            />
            <button type="submit" className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs rounded-xl shadow transition-all">Solve</button>
          </div>
          
          {chemResult && (
            <div className="bg-zinc-950/80 rounded-xl border border-zinc-800 p-2.5 mt-0.5 text-xs">
              {chemResult.error ? (
                <span className="text-red-400 font-semibold">{chemResult.error}</span>
              ) : (
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Molar Mass:</span>
                    <span className="text-emerald-400 font-black font-mono text-sm">{chemResult.mass} g/mol</span>
                  </div>
                  <div className="text-[9px] text-zinc-400 font-mono border-t border-zinc-800/80 pt-1.5 leading-normal break-all">
                    {chemResult.breakdown}
                  </div>
                </div>
              )}
            </div>
          )}
        </form>
      )}
    </div>
  );
};

// 6. Custom Study Goal Planner Widget
const StudyPlannerWidget = () => {
  const [goals, setGoals] = useState([
    { id: 1, text: "Revise organic chemistry mechanics", completed: false },
    { id: 2, text: "Finish Newton's laws assignments", completed: true },
    { id: 3, text: "Memorize first 20 elements names", completed: false }
  ]);
  const [newGoal, setNewGoal] = useState('');

  const addGoal = (e) => {
    e.preventDefault();
    if (!newGoal.trim()) return;
    setGoals([...goals, { id: Date.now(), text: newGoal.trim(), completed: false }]);
    setNewGoal('');
  };

  const toggleGoal = (id) => {
    setGoals(goals.map((g) => g.id === id ? { ...g, completed: !g.completed } : g));
  };

  const deleteGoal = (id) => {
    setGoals(goals.filter((g) => g.id !== id));
  };

  const completedCount = goals.filter((g) => g.completed).length;
  const progressPercent = goals.length > 0 ? Math.round((completedCount / goals.length) * 100) : 0;

  return (
    <div className="flex flex-col gap-3 font-sans">
      {/* Progress Card */}
      <div className="bg-zinc-900/60 rounded-2xl border border-zinc-800 p-3 flex items-center justify-between gap-4">
        <div className="flex flex-col">
          <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest">TODAY'S STUDY GOALS</span>
          <span className="text-sm font-semibold text-zinc-200 mt-0.5">{completedCount} of {goals.length} completed</span>
        </div>
        <div className="relative w-12 h-12 flex items-center justify-center">
          {/* Simple Circular Progress (SVG) */}
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="24" cy="24" r="18" className="stroke-zinc-800 fill-none" strokeWidth="3.5" />
            <circle
              cx="24"
              cy="24"
              r="18"
              className="stroke-cyan-500 fill-none transition-all duration-500"
              strokeWidth="3.5"
              strokeDasharray={2 * Math.PI * 18}
              strokeDashoffset={2 * Math.PI * 18 * (1 - progressPercent / 100)}
            />
          </svg>
          <span className="absolute text-[10px] font-mono font-black text-cyan-400">{progressPercent}%</span>
        </div>
      </div>

      {/* Input box */}
      <form onSubmit={addGoal} className="flex gap-2">
        <input
          type="text"
          placeholder="Add new study goal..."
          value={newGoal}
          onChange={(e) => setNewGoal(e.target.value)}
          className="flex-1 bg-zinc-900 border border-zinc-800 focus:border-cyan-500/50 rounded-xl px-3 py-2 text-xs focus:outline-none text-zinc-200 transition"
          required
        />
        <button type="submit" className="p-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold transition flex items-center justify-center">
          <Plus size={16} />
        </button>
      </form>

      {/* Goal Items List */}
      <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
        {goals.length === 0 ? (
          <span className="text-xs text-zinc-500 italic text-center py-4">No goals for today yet. Add one above!</span>
        ) : (
          goals.map((g) => (
            <div key={g.id} className="flex items-center justify-between bg-zinc-900/40 border border-zinc-800/60 p-2.5 rounded-xl gap-2 transition hover:bg-zinc-900/60">
              <button
                onClick={() => toggleGoal(g.id)}
                className={`w-4 h-4 rounded border transition flex items-center justify-center ${g.completed ? 'bg-cyan-500 border-cyan-400 text-zinc-950' : 'border-zinc-700 hover:border-zinc-500 bg-zinc-950'}`}
              >
                {g.completed && <Check size={12} strokeWidth={3.5} />}
              </button>
              <span className={`flex-1 text-xs text-zinc-300 truncate ${g.completed ? 'line-through text-zinc-500' : ''}`}>{g.text}</span>
              <button onClick={() => deleteGoal(g.id)} className="text-zinc-500 hover:text-red-400 transition" title="Delete">
                <Trash2 size={12} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Global Draggable Widgets Controller
export const FloatingWidgetsManager = () => {
  const { activeWidgets, closeWidget } = useWidgetStore();

  return (
    <>
      {activeWidgets.calculator && (
        <FloatingWindow title="Calculator" onClose={() => closeWidget('calculator')} defaultX={80} defaultY={100} width="w-72">
          <CalculatorWidget />
        </FloatingWindow>
      )}
      {activeWidgets.whiteboard && (
        <FloatingWindow title="Interactive Whiteboard" onClose={() => closeWidget('whiteboard')} defaultX={120} defaultY={140} width="w-88">
          <WhiteboardWidget />
        </FloatingWindow>
      )}
      {activeWidgets.flashcards && (
        <FloatingWindow title="Science Flashcards" onClose={() => closeWidget('flashcards')} defaultX={160} defaultY={180} width="w-80">
          <FlashcardsWidget />
        </FloatingWindow>
      )}
      {activeWidgets.periodicTable && (
        <FloatingWindow title="Periodic Table (H - Ca)" onClose={() => closeWidget('periodicTable')} defaultX={200} defaultY={220} width="w-88">
          <PeriodicTableWidget />
        </FloatingWindow>
      )}
      {activeWidgets.physics && (
        <FloatingWindow title="Science Solver (m/z)" onClose={() => closeWidget('physics')} defaultX={240} defaultY={260} width="w-80">
          <PhysicsWidget />
        </FloatingWindow>
      )}
      {activeWidgets.planner && (
        <FloatingWindow title="Study Planner Goals" onClose={() => closeWidget('planner')} defaultX={280} defaultY={120} width="w-80">
          <StudyPlannerWidget />
        </FloatingWindow>
      )}
    </>
  );
};

export default FloatingWidgetsManager;
