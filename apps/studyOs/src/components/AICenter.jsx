import React, { useState, useEffect, useRef } from 'react';
import { useAIStore } from '../store/aiStore';
import { processAICommand, approvePendingAction, rejectPendingAction } from '../services/ai/pipeline';
import { parseIntent } from '../services/ai/parser';
import { dispatchIntent } from '../services/ai/dispatcher';

// High-performance dynamic inline AudioWorklet processor to execute real-time voice capture on a background worker thread
const voiceWorkletCode = `
  class VoiceStreamProcessor extends AudioWorkletProcessor {
    process(inputs, outputs, parameters) {
      const input = inputs[0];
      if (input && input[0]) {
        // Send the raw Float32 audio channel 0 buffer back to the main UI thread
        this.port.postMessage(input[0]);
      }
      return true;
    }
  }
  registerProcessor('voice-stream-processor', VoiceStreamProcessor);
`;

export const AICenter = () => {
  const { 
    isListening, setIsListening, transcript, setTranscript, 
    logs, status, setStatus, latency, pendingAction 
  } = useAIStore();
  const [inputText, setInputText] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [dictationMode, setDictationMode] = useState(false);
  const [vadSpeaking, setVadSpeaking] = useState(false);
  const [isAlwaysListening, setIsAlwaysListening] = useState(false);
  
  // Realtime Debugging states
  const [bypassWakeWord, setBypassWakeWord] = useState(false);
  const [debugInfo, setDebugInfo] = useState({
    rawTranscript: '',
    wakeMatched: null, // 'success', 'failed', null
    extractedCommand: '',
    parsedIntent: 'None',
    intentConfidence: 0.0
  });
  
  const logsEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  
  // Audio Visualizer Refs
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const animationFrameIdRef = useRef(null);
  
  // Realtime Direct DOM Refs to bypass React reconciliation bottleneck at 60fps
  const micLevelBarRef = useRef(null);
  const micLevelTextRef = useRef(null);
  
  // High-performance client-side audio accumulator buffer to prevent network socket congestion
  const audioAccumulatorRef = useRef(new Float32Array(0));

  useEffect(() => {
    // Initial connection simulation
    if (status === 'disconnected') {
      setTimeout(() => setStatus('connected'), 500);
    }
  }, [status, setStatus]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs, isMinimized]);

  // Dispatcher listener to open AI center when voice requested
  useEffect(() => {
    const handleOpen = () => setIsMinimized(false);
    window.addEventListener('ai-center-open', handleOpen);
    return () => window.removeEventListener('ai-center-open', handleOpen);
  }, []);

  // Premium Mirrored Frequency Visualizer (Siri / Apple Music Style) using unified AnalyserNode
  const startAudioVisualizer = (analyser) => {
    if (!canvasRef.current || !analyser) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    try {
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const draw = () => {
        if (!analyserRef.current) return;
        animationFrameIdRef.current = requestAnimationFrame(draw);

        analyserRef.current.getByteFrequencyData(dataArray);

        // 1. Calculate average volume level for local raw mic debugging
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        const normalizedVolume = Math.min(100, Math.round((avg / 128.0) * 100));
        
        // 2. Direct DOM update bypassing React reconciliation for buttery smooth 60fps updates
        if (micLevelBarRef.current) {
          micLevelBarRef.current.style.width = `${normalizedVolume}%`;
        }
        if (micLevelTextRef.current) {
          micLevelTextRef.current.textContent = `${normalizedVolume}%`;
        }

        // Local frequency debugging logs (throttled to avoid browser lockup)
        if (Math.random() < 0.05) {
          console.log(`🎙️ [Voice OS Debug] chunk capture. size=${dataArray.length}. Volume level=${normalizedVolume}%`);
        }

        // 3. Render zinc black glass background matching macOS Style UI
        ctx.fillStyle = 'rgba(9, 9, 11, 0.22)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 3. Draw Mirrored Premium Frequency Bars
        const barWidth = (canvas.width / bufferLength) * 1.6;
        let barHeight;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          // React to speech status for peak animation multipliers
          const scale = (vadSpeaking || dictationMode) ? 1.5 : 0.6;
          barHeight = (dataArray[i] / 255.0) * canvas.height * scale;

          // Glowing Color theme selection
          let color = 'rgba(6, 182, 212, 0.7)'; // Glowing Cyan-500
          if (dictationMode) {
            color = 'rgba(168, 85, 247, 0.7)'; // Glowing Purple-500
          } else if (vadSpeaking) {
            color = 'rgba(16, 185, 129, 0.9)'; // Glowing Emerald-500
          }

          ctx.fillStyle = color;
          
          // Draw symmetric vertical reflection centered on the Y mid-axis
          const y = (canvas.height - barHeight) / 2;
          ctx.fillRect(x, y, barWidth - 1.5, barHeight);

          x += barWidth;
        }
      };

      draw();
    } catch (err) {
      console.warn("Could not initiate audio visualizer canvas:", err);
    }
  };

  const stopAudioVisualizer = () => {
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    analyserRef.current = null;
  };

  const wsRef = useRef(null);
  const processorRef = useRef(null);

  // Helper function to downsample audio to 16kHz float32 for Whisper/VAD
  const downsampleBuffer = (buffer, inputSampleRate, outputSampleRate) => {
    if (inputSampleRate === outputSampleRate) return buffer;
    const sampleRateRatio = inputSampleRate / outputSampleRate;
    const newLength = Math.round(buffer.length / sampleRateRatio);
    const result = new Float32Array(newLength);
    
    let offsetResult = 0;
    let offsetBuffer = 0;
    while (offsetResult < result.length) {
      const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
      let accum = 0;
      let count = 0;
      for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
        accum += buffer[i];
        count++;
      }
      result[offsetResult] = accum / count;
      offsetResult++;
      offsetBuffer = nextOffsetBuffer;
    }
    return result;
  };

  // Toggle persistent continuous always-listening voice connection
  const toggleAlwaysListening = async () => {
    if (isAlwaysListening) {
      stopAlwaysListening();
      return;
    }

    try {
      // 1. Get continuous microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // 2. Persistent WebSocket stream to Voice OS python server with bypass param
      const wsUrl = `ws://localhost:8001/stream?bypass_wake=${bypassWakeWord}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("🎙️ Voice OS Pipeline: ALWAYS-LISTENING websocket connected.");
        setStatus('listening');
        setIsAlwaysListening(true);
        setIsListening(true);
        useAIStore.getState().addLog({
          type: 'system',
          message: `🎙️ Voice OS: Always-Listening active. ${bypassWakeWord ? "Wake word bypassed!" : "Say 'os ...' to trigger commands."}`
        });
      };

      ws.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'vad') {
            setVadSpeaking(data.speaking);
            if (data.speaking) {
              setStatus('speech');
            } else {
              // If we were just speaking, transition to transcribing
              setStatus(prev => (prev === 'speech') ? 'transcribing' : prev);
            }
          } 
          else if (data.type === 'voice_os_command') {
            const command = data.text ? data.text.trim() : "";
            if (command) {
              setTranscript(command);
              setStatus('processing');
              
              useAIStore.getState().addLog({
                type: 'input',
                message: `🗣️ Voice OS: "${command}"`
              });

              const startTime = performance.now();
              
              // 1. Local Intent Parsing (leveraging command grammar & fuzzy synonyms)
              const intent = parseIntent(command);
              useAIStore.getState().addLog({ type: 'intent', message: JSON.stringify(intent) });

              // Update Debug dashboard states
              setDebugInfo(prev => ({
                ...prev,
                rawTranscript: data.raw_transcript || command,
                wakeMatched: true,
                extractedCommand: command,
                parsedIntent: intent?.tool || 'UNKNOWN',
                intentConfidence: intent?.confidence || 0.0
              }));

              if (intent && intent.tool !== "UNKNOWN" && intent.confidence >= 0.70) {
                // Check if it is a destructive action (requires approval)
                if (intent.tool === "DELETE_ALL_TASKS" || intent.tool === "DELETE_NOTE") {
                  useAIStore.getState().addLog({ 
                    type: 'system', 
                    message: `⚠️ Action requires approval: ${intent.tool}` 
                  });
                  useAIStore.setState({ pendingAction: intent, status: 'waiting_approval' });
                  return;
                }

                // 2. Blazing fast direct local execution (0ms LLM bypass!)
                await dispatchIntent(intent);
                
                const latencyMs = performance.now() - startTime;
                useAIStore.setState({ latency: latencyMs });

                useAIStore.getState().addLog({
                  type: 'success',
                  message: `🚀 Executed: ${intent.tool} (${latencyMs.toFixed(0)}ms)`
                });
                setStatus('listening');
              } else {
                setStatus('error');
                useAIStore.getState().addLog({
                  type: 'error',
                  message: `❓ Command unrecognized. Try saying: "os start stopwatch" or "os open notes".`
                });
                setTimeout(() => setStatus('listening'), 2500);
              }
            }
          }
          else if (data.type === 'dictation_started') {
            setDictationMode(true);
            setTranscript("Dictation Mode Active... Speak freely.");
            setStatus('listening');
            useAIStore.getState().addLog({
              type: 'system',
              message: "🎙️ Dictation Mode: Active (Swapped to high-accuracy model). Say 'STOP DICTATION' to end."
            });
          }
          else if (data.type === 'dictation_segment') {
            const text = data.text ? data.text.trim() : "";
            if (text) {
              setTranscript(text);
              useAIStore.getState().addLog({
                type: 'input',
                message: `📝 Dictated: "${text}"`
              });
              
              // Directly save dictation segment as a note
              const intent = {
                tool: "CREATE_NOTE",
                payload: {
                  title: `Voice Note - ${new Date().toLocaleTimeString()}`,
                  content: text
                }
              };
              await dispatchIntent(intent);
            }
          }
          else if (data.type === 'dictation_ended') {
            setDictationMode(false);
            setTranscript("Command Mode Active.");
            setStatus('listening');
            useAIStore.getState().addLog({
              type: 'system',
              message: "🎙️ Dictation Mode: Ended. Swapped back to 'tiny.en' Command Model."
            });
          }
          else if (data.type === 'ignored') {
            if (data.text) {
              setDebugInfo(prev => ({
                ...prev,
                rawTranscript: data.text,
                wakeMatched: false,
                extractedCommand: 'None (Ignored)',
                parsedIntent: 'None',
                intentConfidence: 0.0
              }));
              
              useAIStore.getState().addLog({
                type: 'ignored',
                message: `🔕 Ignored: "${data.text}" (Missing wake word prefix 'os')`
              });
              setStatus('failed');
              setTimeout(() => {
                setStatus('listening');
              }, 2000);
            }
          }
        } catch (msgErr) {
          console.error("Error parsing WebSocket packet:", msgErr);
        }
      };

      ws.onerror = (err) => {
        console.error("Always-Listening connection error:", err);
        setStatus('error');
      };

      ws.onclose = () => {
        console.log("🎙️ Voice OS Pipeline: ALWAYS-LISTENING WebSocket closed.");
        stopAlwaysListening();
      };

      // 3. Audio context streaming and processing via high-performance AudioWorklet
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioContext();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      sourceRef.current = source;

      // Create a single unified AnalyserNode to share between voice stream and frequency visualizer
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64; // Optimized for frequency bin bars
      analyserRef.current = analyser;

      // Explicitly resume AudioContext to bypass Chrome browser Autoplay suspensions!
      await audioCtx.resume();

      // Dynamically compile the inline AudioWorklet on startup
      const blob = new Blob([voiceWorkletCode], { type: 'application/javascript' });
      const workletUrl = URL.createObjectURL(blob);
      await audioCtx.audioWorklet.addModule(workletUrl);

      const workletNode = new AudioWorkletNode(audioCtx, 'voice-stream-processor');
      processorRef.current = workletNode;

      // Connect unified pipeline nodes
      source.connect(analyser);
      source.connect(workletNode);
      workletNode.connect(audioCtx.destination);

      // Connect wave visualization using shared analyser
      startAudioVisualizer(analyser);

      // Reset the audio accumulator when initiating always-listening stream
      audioAccumulatorRef.current = new Float32Array(0);

      workletNode.port.onmessage = (e) => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

        const inputBuffer = e.data; // e.data contains the Float32Array mono channel data
        // Downsample to 16kHz for whisper & Silero VAD
        const resampled = downsampleBuffer(inputBuffer, audioCtx.sampleRate, 16000);
        
        // Accumulate audio samples client-side to prevent flooding the backend with 340 tiny packets per second
        const currentAccumulated = audioAccumulatorRef.current;
        const newAccumulated = new Float32Array(currentAccumulated.length + resampled.length);
        newAccumulated.set(currentAccumulated);
        newAccumulated.set(resampled, currentAccumulated.length);
        audioAccumulatorRef.current = newAccumulated;

        // When we accumulate exactly 200ms of audio (3200 samples at 16000Hz), send the binary frame over the WebSocket!
        const CHUNK_SIZE = 3200;
        if (audioAccumulatorRef.current.length >= CHUNK_SIZE) {
          const chunkToSend = audioAccumulatorRef.current.slice(0, CHUNK_SIZE);
          wsRef.current.send(chunkToSend.buffer);
          
          // Retain leftover samples in the accumulator
          audioAccumulatorRef.current = audioAccumulatorRef.current.slice(CHUNK_SIZE);
        }
      };

    } catch (err) {
      console.error("Failed to initialize continuous Voice OS Pipeline:", err);
      setStatus('error');
      useAIStore.getState().addLog({
        type: 'error',
        message: '🎙️ Voice OS: Backend offline or microphone disabled. Run setup_voice_backend.bat on port 8001.'
      });
    }
  };

  // Gracefully stop continuous microphone streaming and close connection
  const stopAlwaysListening = () => {
    setIsAlwaysListening(false);
    setIsListening(false);
    setVadSpeaking(false);
    setDictationMode(false);
    setStatus('connected');
    
    stopAudioVisualizer();
    audioAccumulatorRef.current = new Float32Array(0);

    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (wsRef.current) {
      // Send a reset message and close gracefully
      if (wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "reset" }));
      }
      wsRef.current.close();
      wsRef.current = null;
    }

    useAIStore.getState().addLog({
      type: 'system',
      message: "🎙️ Voice OS: Always-Listening offline."
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    processAICommand(inputText);
    setInputText('');
  };

  const statusColors = {
    idle: 'bg-zinc-500',
    connected: 'bg-emerald-500',
    listening: 'bg-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.6)] animate-pulse',
    speech: 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.7)] animate-pulse',
    transcribing: 'bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.7)] animate-pulse',
    processing: 'bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.7)] animate-pulse',
    error: 'bg-red-500',
    failed: 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.75)] animate-pulse',
    waiting_approval: 'bg-yellow-500 animate-pulse'
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button 
          onClick={() => setIsMinimized(false)}
          className="bg-zinc-900/90 backdrop-blur-xl text-zinc-100 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-zinc-800 p-3.5 flex items-center gap-2.5 hover:bg-zinc-800 transition-all duration-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
            <line x1="12" y1="19" x2="12" y2="22"></line>
          </svg>
          <span className="text-xs font-black uppercase tracking-wider">AI Voice OS</span>
          <div className={`w-2 h-2 rounded-full ${statusColors[status] || 'bg-zinc-500'}`} />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-zinc-950/90 backdrop-blur-2xl text-zinc-100 rounded-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden border border-zinc-850 flex flex-col font-sans z-[999]">
      {/* Header */}
      <div className="p-4 border-b border-zinc-850 flex justify-between items-center bg-zinc-900/40">
        <div>
          <h3 className="font-extrabold text-sm tracking-widest text-zinc-300 uppercase">AI COMMAND CENTER</h3>
          <p className="text-[10px] text-zinc-500 font-mono mt-0.5">LOCAL INTENT PIPELINE • V1.0</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono">
            {latency > 0 && <span>{(latency / 1000).toFixed(2)}s</span>}
            <span className="capitalize">{status.replace('_', ' ')}</span>
            <div className={`w-2 h-2 rounded-full ${statusColors[status] || 'bg-zinc-500'}`} />
          </div>
          <button 
            onClick={() => setIsMinimized(true)}
            className="text-zinc-500 hover:text-zinc-100 p-1 rounded-lg hover:bg-zinc-900 transition"
            title="Minimize AI Center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        </div>
      </div>

      {/* Logs Area */}
      <div className="h-64 overflow-y-auto p-4 space-y-2.5 text-xs font-mono flex flex-col scrollbar-hide">
        {logs.length === 0 ? (
          <div className="text-zinc-500 italic mt-auto flex flex-col gap-1.5 p-2">
            <span className="text-cyan-400 font-bold uppercase tracking-wider text-[10px]">🎙️ Voice OS Instructions:</span>
            <span className="text-[10px] text-zinc-400 font-sans">• Click the MIC icon at the bottom to toggle **Always-Listening Mode**!</span>
            <span className="text-[10px] text-zinc-400 font-sans">• Say **"os ..."** before any command. Example: **"os start pomodoro"** or **"os open whiteboard"**.</span>
            <span className="text-[10px] text-zinc-400 font-sans">• Say **"os dictation mode"** to dictate long text without wake word. Say **"stop dictation"** to end!</span>
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className={`p-2.5 rounded-2xl border border-zinc-850/60 ${
              log.type === 'input' ? 'bg-cyan-600/10 text-cyan-200 border-cyan-500/20 self-end max-w-[85%] rounded-tr-none' :
              log.type === 'error' ? 'text-red-400 bg-red-950/20 border-red-500/20 self-start max-w-[90%]' :
              log.type === 'success' ? 'text-emerald-400 bg-emerald-950/20 border-emerald-500/20 self-start max-w-[90%]' :
              log.type === 'intent' ? 'text-zinc-450 text-[10px] self-start w-full overflow-x-auto whitespace-pre-wrap break-all bg-zinc-950/80 p-2.5 border border-zinc-900 rounded-xl font-mono' :
              log.type === 'system' ? 'text-cyan-400 bg-cyan-950/10 border-cyan-800/10 self-start w-full p-2 rounded-xl text-[10px]' :
              'text-zinc-500 text-[10px] self-start'
            }`}>
              {log.message}
            </div>
          ))
        )}
        <div ref={logsEndRef} />
      </div>

      {/* Pending Approval Overlay */}
      {pendingAction && (
        <div className="p-4 bg-yellow-900/10 border-y border-yellow-800/30 flex flex-col gap-2">
          <p className="text-xs text-yellow-300 font-bold flex items-center gap-1.5 uppercase tracking-wide">
            <span>⚠️</span> Action Requires Approval
          </p>
          <p className="text-[10px] text-zinc-400 font-mono">Tool Request: {pendingAction.tool}</p>
          <div className="flex gap-2 mt-1">
            <button onClick={approvePendingAction} className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-zinc-950 font-bold py-1.5 rounded-xl text-xs transition">
              Approve Action
            </button>
            <button onClick={rejectPendingAction} className="flex-1 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 font-semibold py-1.5 rounded-xl text-xs border border-zinc-800 transition">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Live Waveform Display during listening */}
      {isAlwaysListening && (
        <div className="px-4 py-3 bg-zinc-950 border-t border-zinc-900/60 flex flex-col gap-2.5">
          <p className="text-[10px] text-cyan-400 italic flex items-center gap-2 uppercase tracking-widest font-black">
            <span className={`w-2 h-2 rounded-full animate-ping ${dictationMode ? 'bg-purple-500' : vadSpeaking ? 'bg-emerald-500' : 'bg-cyan-500'}`} />
            {dictationMode ? '🎙️ DICTATION MODEL ACTIVE • SPEAK FREELY' : vadSpeaking ? '🎙️ SPEECH DETECTED • TRANSCRIBING...' : '🎙️ VOICE OS ALWAYS-LISTENING...'}
          </p>
          
          {/* Audio Visualizer Canvas */}
          <canvas 
            ref={canvasRef} 
            width={350} 
            height={32} 
            className="w-full h-8 rounded-xl bg-zinc-950 border border-zinc-900 shadow-inner"
          />
        </div>
      )}

      {/* 4-Layer Voice OS Diagnostics Dashboard */}
      {isAlwaysListening && (
        <div className="mx-4 mb-3 p-3.5 bg-zinc-900/60 rounded-2xl border border-zinc-800/80 backdrop-blur-md flex flex-col gap-2.5">
          {/* Header Row */}
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-widest flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${statusColors[status] || 'bg-zinc-500'} ${status === 'listening' || status === 'speech' || status === 'transcribing' ? 'animate-pulse' : ''}`} />
              Voice OS Engine
            </span>
            <div className="flex items-center gap-2">
              <label htmlFor="bypass-toggle" className="text-[9px] text-zinc-500 hover:text-zinc-300 font-semibold cursor-pointer select-none">Bypass Wake Word</label>
              <input
                id="bypass-toggle"
                type="checkbox"
                checked={bypassWakeWord}
                onChange={(e) => {
                  setBypassWakeWord(e.target.checked);
                  useAIStore.getState().addLog({
                    type: 'system',
                    message: `⚙️ Voice OS: Wake word bypass toggled ${e.target.checked ? 'ON' : 'OFF'}`
                  });
                }}
                className="w-3.5 h-3.5 accent-cyan-500 rounded border-zinc-800 bg-zinc-950 cursor-pointer"
              />
            </div>
          </div>

          {/* Raw Mic Power Meter (Layer 1) */}
          <div className="flex items-center gap-3">
            <span className="text-[9px] text-zinc-500 font-mono w-16">Raw Mic:</span>
            <div className="flex-1 h-1.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-900">
              <div 
                ref={micLevelBarRef}
                className={`h-full transition-all duration-100 ${dictationMode ? 'bg-purple-500 shadow-[0_0_8px_#a855f7]' : vadSpeaking ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-cyan-500 shadow-[0_0_8px_#06b6d4]'}`}
                style={{ width: '0%' }}
              />
            </div>
            <span ref={micLevelTextRef} className="text-[9px] text-zinc-400 font-mono min-w-[24px] text-right">0%</span>
          </div>

          {/* Diagnostic Stats Display (Layers 2-6) */}
          <div className="grid grid-cols-2 gap-2 text-[9px] font-mono border-t border-zinc-850/60 pt-2.5">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between">
                <span className="text-zinc-500">VAD State:</span>
                <span className={`font-bold ${vadSpeaking ? 'text-emerald-400' : 'text-zinc-400'}`}>
                  {vadSpeaking ? '🎙️ Speaking' : '💤 Silent'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Wake Word:</span>
                <span className={`font-bold ${
                  bypassWakeWord ? 'text-yellow-400' :
                  debugInfo.wakeMatched === true ? 'text-emerald-400' : 
                  debugInfo.wakeMatched === false ? 'text-red-400' : 
                  'text-zinc-400'
                }`}>
                  {bypassWakeWord ? 'Bypassed' : debugInfo.wakeMatched === true ? '✓ Matched' : debugInfo.wakeMatched === false ? '✗ Missing' : 'Waiting...'}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-1 border-l border-zinc-850/60 pl-2">
              <div className="flex justify-between">
                <span className="text-zinc-550">Parsed Intent:</span>
                <span className="text-cyan-400 font-bold overflow-hidden text-ellipsis whitespace-nowrap max-w-[80px]" title={debugInfo.parsedIntent}>
                  {debugInfo.parsedIntent}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-550">Confidence:</span>
                <span className="text-emerald-400 font-bold">
                  {(debugInfo.intentConfidence * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>

          {/* Live Heard Transcript panel (Layer 7) */}
          {debugInfo.rawTranscript && (
            <div className="mt-1 p-2 bg-zinc-950/85 rounded-xl border border-zinc-850/40 text-[9px] font-mono flex flex-col gap-1">
              <div className="flex justify-between text-zinc-500 uppercase tracking-wider text-[8px] font-bold">
                <span>💬 Heard (Raw Transcript):</span>
                <span>Tiny.en model</span>
              </div>
              <span className="text-zinc-200 leading-normal italic">
                "{debugInfo.rawTranscript}"
              </span>
            </div>
          )}
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 bg-zinc-900/20 border-t border-zinc-850/60">
        <form onSubmit={handleSubmit} className="flex gap-2">
          {/* Always-Listening Switch Toggle */}
          <button
            type="button"
            onClick={toggleAlwaysListening}
            className={`p-3.5 rounded-2xl transition-all duration-300 flex items-center justify-center border cursor-pointer select-none active:scale-95 ${
              isAlwaysListening 
                ? dictationMode
                  ? 'bg-purple-500/10 text-purple-400 border-purple-500/40 shadow-[0_0_20px_rgba(168,85,247,0.25)] animate-pulse'
                  : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.25)] animate-pulse' 
                : 'bg-zinc-900 hover:bg-zinc-850 hover:text-zinc-100 hover:border-zinc-750 text-zinc-400 border-zinc-800/80'
            }`}
            title={isAlwaysListening ? "Turn OFF Voice OS" : "Turn ON Voice OS Always-Listening"}
          >
            {isAlwaysListening ? (
              dictationMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse">
                  <path d="M12 2v20M17 5v14M22 9v6M7 8v8M2 10v4"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-spin-slow text-cyan-400">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              )
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="22"></line>
              </svg>
            )}
          </button>
          
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={isAlwaysListening ? dictationMode ? "Dictating notes..." : "Always-listening active... Say 'os ...'" : "Toggle Voice OS or type command here..."}
            className="flex-1 bg-zinc-900 border border-zinc-800 focus:border-cyan-500/50 rounded-2xl px-4 py-3 text-xs focus:outline-none focus:ring-4 focus:ring-cyan-500/5 transition placeholder:text-zinc-650 text-zinc-100 font-medium"
            disabled={status === 'waiting_approval' || status === 'processing'}
          />
        </form>
      </div>
    </div>
  );
};

