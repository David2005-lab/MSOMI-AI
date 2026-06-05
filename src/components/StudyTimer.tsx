import React, { useState, useEffect, useRef } from 'react';
import { StudySession, CopilotMode } from '../types';
import { Play, Pause, RotateCcw, Volume2, Save, Award, CheckCircle, Clock } from 'lucide-react';
import { motion } from 'motion/react';

interface StudyTimerProps {
  onSessionLog: (session: StudySession) => void;
  recentSessions: StudySession[];
}

const AMBIENT_TRACKS = [
  { id: 'nai_rain', name: '🌧️ Nairobi Rain Shower', desc: 'Soothing rain on iron-sheet roof felt atmosphere.' },
  { id: 'sav_wind', name: '🌾 Serengeti Sunset breeze', desc: 'Warm gentle wind and faint African savannah crickets.' },
  { id: 'mpesa_cafe', name: '☕ M-Pesa Cafe Hustle', desc: 'Subtle coffee machine tap and soft campus conversation.' },
  { id: 'coast_calm', name: '🌊 Mombasa Coast Ocean', desc: 'Peaceful rolling tides on sandy beaches.' },
  { id: 'library_busy', name: '📚 Makerere Library Quiet', desc: 'Whispers, flipping of book pages, and perfect focal zone.' }
];

export default function StudyTimer({ onSessionLog, recentSessions }: StudyTimerProps) {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'FOCUS' | 'BREAK'>('FOCUS');
  const [topic, setTopic] = useState('');
  const [activityType, setActivityType] = useState<CopilotMode | 'GENERAL'>('GENERAL');
  const [ambientId, setAmbientId] = useState<string>('nai_rain');
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const soundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Alarm alert feeling
      setIsActive(false);
      handleTimerCompletion();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const handleTimerCompletion = () => {
    if (mode === 'FOCUS') {
      const loggedSession: StudySession = {
        id: Math.random().toString(36).substr(2, 9),
        topic: topic || 'General Study',
        durationMinutes: 25,
        date: new Date().toLocaleDateString('en-GB'),
        activityType: activityType
      };
      onSessionLog(loggedSession);
      alert(`🎉 Safi Sana! You have completed a 25-minute Pomodoro focus block on "${topic || 'General study'}". Take a break!`);
      setMode('BREAK');
      setTimeLeft(5 * 60);
    } else {
      alert(`💪 Break is over! Let's conquer the next study mountain.`);
      setMode('FOCUS');
      setTimeLeft(25 * 60);
    }
  };

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setMode('FOCUS');
    setTimeLeft(25 * 60);
  };

  const handleSaveEarly = () => {
    // Let student log partial minutes completed
    const elapsedSeconds = (25 * 60) - timeLeft;
    const elapsedMinutes = Math.floor(elapsedSeconds / 60);
    if (elapsedMinutes < 1) {
      alert("⚠️ Study more than 1 minute to log a session!");
      return;
    }
    const loggedSession: StudySession = {
      id: Math.random().toString(36).substr(2, 9),
      topic: topic || 'Custom Quick Session',
      durationMinutes: elapsedMinutes,
      date: new Date().toLocaleDateString('en-GB'),
      activityType: activityType
    };
    onSessionLog(loggedSession);
    alert(`📝 Logged ${elapsedMinutes} minute(s) of focused study under "${topic || 'Custom Quick Session'}".`);
    resetTimer();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Ambient Synthetic Sound Engine - Plays custom relaxing web frequencies!
  const toggleAmbientSound = () => {
    if (isAudioPlaying) {
      if (soundRef.current) {
        soundRef.current.pause();
      }
      setIsAudioPlaying(false);
    } else {
      // Synthesize a continuous relaxing audio frequency using Web Audio API
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        // Generate brown/pink noise representation or standard deep workspace hum
        const bufferSize = 2 * audioCtx.sampleRate;
        const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }

        const whiteNoise = audioCtx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        // Custom band-pass filter based on track ID
        const filter = audioCtx.createBiquadFilter();
        if (ambientId === 'nai_rain') {
          filter.type = 'peaking';
          filter.frequency.value = 500;
          filter.Q.value = 3.0;
        } else if (ambientId === 'sav_wind') {
          filter.type = 'lowpass';
          filter.frequency.value = 250;
        } else {
          filter.type = 'bandpass';
          filter.frequency.value = 800;
        }

        const gainNode = audioCtx.createGain();
        gainNode.gain.value = 0.08; // moderate comfortable volume

        whiteNoise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        whiteNoise.start();

        // Save reference to stop later
        const mockAudio: any = {
          pause: () => {
            try { 
              whiteNoise.stop(); 
              audioCtx.close();
            } catch(e) {}
          }
        };

        soundRef.current = mockAudio;
        setIsAudioPlaying(true);
      } catch (err) {
        // Fallback if browser audio context blocked before interaction
        console.warn("Audio Context init fallback.", err);
        setIsAudioPlaying(false);
      }
    }
  };

  useEffect(() => {
    // If playing, restart with new filter type on ID change
    if (isAudioPlaying) {
      if (soundRef.current) soundRef.current.pause();
      setIsAudioPlaying(false);
    }
  }, [ambientId]);

  return (
    <div id="study-timer-tab" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Clock and Settings */}
      <div className="lg:col-span-2 bg-white rounded-sm border border-black/5 p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <div>
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-sm uppercase tracking-wider ${
              mode === 'FOCUS' ? 'bg-[#C15B32]/10 text-[#C15B32] border border-[#C15B32]/20' : 'bg-stone-200 text-stone-800 border border-stone-300'
            }`}>
              {mode === 'FOCUS' ? '🎯 CONCENTRATION SPAN (FOCUS)' : '🌸 RESTORE MODE (BREAK)'}
            </span>
            <h2 className="text-xl font-bold font-serif italic text-[#1A1A1A] mt-2">Saa ya Msomi (Time Block Tracker)</h2>
          </div>
          <Clock className="text-black/30 h-5 w-5" />
        </div>

        {/* Timer visual block */}
        <div className="flex flex-col items-center justify-center my-6 py-4">
          <motion.div 
            animate={{ scale: isActive ? [1, 1.01, 1] : 1 }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="text-6xl md:text-7xl font-mono text-[#1A1A1A] tracking-widest font-extrabold select-none bg-[#FCFAF7] border border-black/10 rounded-sm py-6 px-10 shadow-sm"
          >
            {formatTime(timeLeft)}
          </motion.div>

          <div className="flex flex-wrap gap-3 mt-6 justify-center">
            <button
              onClick={toggleTimer}
              className={`flex items-center gap-1.5 px-6 py-2.5 rounded-sm text-xs uppercase tracking-widest font-bold transition-all active:scale-[0.98] cursor-pointer ${
                isActive 
                  ? 'bg-red-50 border border-red-250 text-red-700 hover:bg-red-100' 
                  : 'bg-[#C15B32] text-white hover:bg-[#1A1A1A] shadow-sm'
              }`}
            >
              {isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
              {isActive ? 'Pause Session' : 'Start Focus'}
            </button>

            <button
              onClick={resetTimer}
              className="flex items-center gap-1 bg-[#F5F2ED] border border-black/10 hover:border-black/30 hover:bg-[#EAE4DD] text-black/70 px-4 py-2.5 rounded-sm text-xs font-mono uppercase transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </button>

            {isActive && (
              <button
                onClick={handleSaveEarly}
                className="flex items-center gap-1 bg-[#C15B32]/10 hover:bg-[#C15B32]/20 border border-[#C15B32]/30 text-[#C15B32] px-4 py-2.5 rounded-sm text-xs font-mono uppercase transition-colors cursor-pointer"
              >
                <Save className="h-3.5 w-3.5" /> Log Early
              </button>
            )}
          </div>
        </div>

        {/* Setting options */}
        <div className="border-t border-black/5 pt-4 mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-black/40 mb-1 font-mono">Subject Topic to Study</label>
            <input
              type="text"
              placeholder="e.g., Kruskal's Algorithm Analysis"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              className="w-full text-xs py-2 px-3 bg-[#FCFAF7] border border-black/10 rounded-sm text-black focus:outline-none focus:border-[#C15B32] transition-colors font-sans"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-black/40 mb-1 font-mono">Category / Mode alignment</label>
            <select
              value={activityType}
              onChange={e => setActivityType(e.target.value as any)}
              className="w-full text-xs py-2 px-3 bg-[#FCFAF7] border border-black/10 rounded-sm text-black focus:outline-none font-sans"
            >
              <option value="GENERAL">📚 General Reading &amp; Practice</option>
              <option value="EXPLAIN">💡 Explain Concept Session</option>
              <option value="EXAM_PREP">📝 Exam Preparation Mode</option>
              <option value="ASSIGNMENT_HELP">📄 Assignment Brainstorm</option>
              <option value="CAREER">🤵 Skills &amp; Internship Goal</option>
              <option value="INNOVATION_LAB">🔬 Community Innovation Canvas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Ambient sound generator & logs */}
      <div id="ambient-block" className="space-y-4">
        {/* Sound Box */}
        <div className="bg-white rounded-sm border border-black/5 p-5 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-black/40 mb-2 flex items-center gap-1.5 font-mono border-b border-black/5 pb-1.5">
            <Volume2 className="h-4 w-4 text-[#C15B32]" /> Dynamic Ambient Space
          </h3>
          <p className="text-[11px] text-black/60 mb-3">
            Simulate relaxing focus environments with audio synthesis. Block out noisy hostels or libraries instantly.
          </p>

          <div className="space-y-2">
            {AMBIENT_TRACKS.map(trk => (
              <button
                key={trk.id}
                onClick={() => setAmbientId(trk.id)}
                className={`w-full text-left p-2.5 rounded-sm border text-xs flex flex-col transition-all cursor-pointer ${
                  ambientId === trk.id 
                    ? 'bg-[#C15B32]/10 border-[#C15B32] text-[#C15B32] font-semibold shadow-sm' 
                    : 'bg-[#F5F2ED]/50 border-black/5 text-black/75 hover:border-black/20 hover:bg-[#F5F2ED]'
                }`}
              >
                <span className="font-semibold">{trk.name}</span>
                <span className="text-[10px] text-black/50 line-clamp-1 mt-0.5">{trk.desc}</span>
              </button>
            ))}
          </div>

          <button
            onClick={toggleAmbientSound}
            className={`w-full mt-4 flex items-center justify-center gap-1.5 font-bold uppercase tracking-wider py-2 rounded-sm text-xs transition-colors cursor-pointer border ${
              isAudioPlaying 
                ? 'bg-[#C15B32]/10 text-[#C15B32] border-[#C15B32]/40 hover:bg-[#C15B32]/20' 
                : 'bg-black text-white hover:bg-[#C15B32] border-transparent'
            }`}
          >
            <Volume2 className={`h-4 w-4 ${isAudioPlaying ? 'animate-bounce' : ''}`} />
            {isAudioPlaying ? 'Stop Ambient Generator' : 'Play Ambient Frequencies'}
          </button>
        </div>

        {/* Study Stats Indicator */}
        <div className="bg-white rounded-sm border border-black/5 p-4 shadow-sm text-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-black/40 mb-2 border-b border-black/5 pb-1.5 flex items-center gap-1 font-mono">
            <Award className="h-4 w-4 text-[#C15B32]" /> Custom Study Milestone
          </h3>

          <div className="grid grid-cols-2 gap-2 text-center text-[11px]">
            <div className="p-2 bg-[#F5F2ED]/70 rounded-sm border border-black/5">
              <span className="block text-black/50 uppercase tracking-wide text-[9px] font-mono">Total Minutes</span>
              <span className="text-sm font-extrabold text-[#1A1A1A]">
                {recentSessions.reduce((sum, s) => sum + s.durationMinutes, 0)}m
              </span>
            </div>
            <div className="p-2 bg-[#F5F2ED]/70 rounded-sm border border-black/5">
              <span className="block text-black/50 uppercase tracking-wide text-[9px] font-mono">Sessions Logged</span>
              <span className="text-sm font-extrabold text-[#1A1A1A]">{recentSessions.length}</span>
            </div>
          </div>

          {recentSessions.length > 0 ? (
            <div className="mt-3 space-y-1.5 max-h-24 overflow-y-auto">
              <span className="text-[10px] font-bold text-black/50 uppercase tracking-wider font-mono">Past Study Logs:</span>
              {recentSessions.map(sess => (
                <div key={sess.id} className="flex justify-between items-center text-[10px] bg-[#F5F2ED]/30 p-1.5 rounded-sm border border-black/5 text-[#1A1A1A]">
                  <span className="truncate max-w-[124px] font-medium" title={sess.topic}><CheckCircle className="inline h-3 w-3 text-[#C15B32] mr-1" />{sess.topic}</span>
                  <span className="text-black/40 font-mono">+{sess.durationMinutes}m ({sess.date})</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[10px] text-black/40 mt-2 text-center py-2 bg-[#F5F2ED]/30 rounded-sm border border-black/5 border-dashed font-mono">
              No study logs recorded yet. Focus for a duration to log.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
