import React, { useState, useRef, useEffect } from 'react';
import { StudentProfile, ChatMessage, CopilotMode } from '../types';
import { Send, Sparkles, BookOpen, AlertCircle, HelpCircle, GraduationCap, Briefcase, TestTube, ArrowUpRight, CheckCircle, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

interface ChatWorkspaceProps {
  profile: StudentProfile;
  messages: ChatMessage[];
  onAddMessage: (msg: ChatMessage) => void;
  onClearHistory: () => void;
}

const MODE_META = [
  {
    id: 'EXPLAIN' as CopilotMode,
    label: '💡 Explain Concept',
    desc: 'Break down complex topics into simple terms with relatable African analogies.',
    accent: 'border-l-[#C15B32] text-[#C15B32] bg-[#C15B32]/5',
    starters: [
      "Explain Kruskal's Algorithm using M-Pesa transaction nodes as an example.",
      "Break down the nitrogen cycle for a small-scale maize farm in Dodoma.",
      "What is MVC architecture in web development for absolute beginners?"
    ]
  },
  {
    id: 'EXAM_PREP' as CopilotMode,
    label: '🎓 Exam Prep Helper',
    desc: 'Review tricky lecturer exam angles, generate prep questions, and structure marking guides.',
    accent: 'border-l-black text-black/95 bg-black/[0.03]',
    starters: [
      "Generate 3 exam prep questions and a grading rubric on Database Normalization.",
      "What are the typical exam tricks lecturers ask on Microeconomics currency inflation?",
      "Create a quick cram sheet for Operating Systems deadlock conditions."
    ]
  },
  {
    id: 'ASSIGNMENT_HELP' as CopilotMode,
    label: '📝 Essay & Assignment outline',
    desc: 'Deep architecture outlines, logic flow critiques, and structural checklists. NO cheating.',
    accent: 'border-l-[#C15B32] text-[#C15B32] bg-[#C15B32]/5',
    starters: [
      "Outline an academic research essay about post-harvest cooling systems.",
      "Critique this paragraph outline for my public health epidemiology homework...",
      "What core textbook/source parameters must I address in a data structure thesis?"
    ]
  },
  {
    id: 'CAREER' as CopilotMode,
    label: '🤵 Career & CV Catalyst',
    desc: 'Identify local market skills gaps, prepare CV project bullets, and trigger mock interview drill.',
    accent: 'border-l-black text-black/95 bg-black/[0.03]',
    starters: [
      "Identify the technology skills gap for a junior Web Dev in Kampala & Nairobi.",
      "Turn my class project 'Solar battery meter' into high-impact metrics-oriented CV bullets.",
      "Let&apos;s start a mock interview roleplay for a junior Logistics Analyst position."
    ]
  },
  {
    id: 'INNOVATION_LAB' as CopilotMode,
    label: '🔬 Innovation Lab Blueprint',
    desc: 'Pitch ideas & generate the 7 key bento columns: Problem, Solution, steps, impact metric.',
    accent: 'border-l-[#C15B32] text-[#C15B32] bg-[#C15B32]/5',
    starters: [
      "I want to match smallholder potato farmers inside Meru directly with market transporters.",
      "An idea for solar-powered cooling crates used by fish vendors at Lake Victoria shores.",
      "Solving erratic electricity cutoffs in host student chambers via cheap relay monitoring."
    ]
  }
];

// Exquisite Markdown parsing and rendering safely in react
const formatTutorText = (text: string) => {
  if (!text) return null;
  
  const paragraphs = text.split('\n');
  return paragraphs.map((para, pIdx) => {
    let trimmed = para.trim();
    if (!trimmed) return <div key={pIdx} className="h-2" />;

    // Handle Headings (e.g. ### Title)
    if (trimmed.startsWith('###')) {
      return (
        <h4 key={pIdx} className="text-xs font-serif italic font-semibold text-[#C15B32] mt-4 mb-1 flex items-center gap-1">
          <ArrowUpRight className="h-3.5 w-3.5" /> {trimmed.replace(/^###\s*/, '')}
        </h4>
      );
    }
    if (trimmed.startsWith('##')) {
      return (
        <h3 key={pIdx} className="text-sm font-serif font-bold text-[#1A1A1A] mt-5 mb-2 pb-1.5 border-b border-black/5 uppercase tracking-wide">
          {trimmed.replace(/^##\s*/, '')}
        </h3>
      );
    }
    if (trimmed.startsWith('#')) {
      return (
        <h2 key={pIdx} className="text-base font-serif font-bold text-[#1A1A1A] mt-5 mb-2.5">
          {trimmed.replace(/^#\s*/, '')}
        </h2>
      );
    }

    // Handle bold prefixes representing fields (e.g. - **PROBLEM**:)
    // Handle list items
    if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
      const contents = trimmed.replace(/^[-*]\s*/, '');
      return (
        <li key={pIdx} className="text-xs text-[#1A1A1A]/80 ml-4 list-disc list-outside mb-1.5 leading-relaxed">
          {parseInlineFormatting(contents)}
        </li>
      );
    }

    // Handle standard numbering
    if (/^\d+\)/.test(trimmed)) {
      return (
        <div key={pIdx} className="text-xs font-semibold text-[#C15B32] mt-3.5 mb-1 font-mono">
          {parseInlineFormatting(trimmed)}
        </div>
      );
    }

    // Handle normal paragraphs
    return (
      <p key={pIdx} className="text-xs text-[#1A1A1A]/85 leading-relaxed mb-2.5 font-sans">
        {parseInlineFormatting(trimmed)}
      </p>
    );
  });
};

// Parse bold occurrences **text** safely
function parseInlineFormatting(text: string) {
  const parts = text.split(/\*\*([\s\S]*?)\*\*/g);
  return parts.map((part, i) => {
    if (i % 2 === 1) {
      // Highlight exact matches
      return <strong key={i} className="text-[#1A1A1A] font-bold">{part}</strong>;
    }
    // Handle light backtick code markers
    const subParts = part.split(/`([^`]+)`/g);
    return subParts.map((subPart, subIdx) => {
      if (subIdx % 2 === 1) {
        return (
          <code key={subIdx} className="px-1.5 py-0.5 bg-[#FCFAF7] border border-black/10 rounded-sm text-[10px] text-[#C15B32] font-mono">
            {subPart}
          </code>
        );
      }
      return subPart;
    });
  });
}

export default function ChatWorkspace({ profile, messages, onAddMessage, onClearHistory }: ChatWorkspaceProps) {
  const [activeMode, setActiveMode] = useState<CopilotMode>('EXPLAIN');
  const [userInput, setUserInput] = useState('');
  const [isWaiting, setIsWaiting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const activeMeta = MODE_META.find(m => m.id === activeMode) || MODE_META[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isWaiting]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isWaiting) return;

    setErrorMessage(null);

    // Save student's request in history log
    const userMsg: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      role: 'user',
      content: text,
      mode: activeMode,
      timestamp: new Date().toISOString()
    };
    onAddMessage(userMsg);
    setUserInput('');
    setIsWaiting(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: messages.filter(m => m.mode === activeMode), // send history for active mode context
          mode: activeMode,
          profile: profile
        })
      });

      if (!response.ok) {
        throw new Error("Unable to synthesize response with backend tutor.");
      }

      const responseData = await response.json();
      const assistantMsg: ChatMessage = {
        id: Math.random().toString(36).substr(2, 9),
        role: 'assistant',
        content: responseData.content,
        mode: activeMode,
        timestamp: responseData.timestamp || new Date().toISOString()
      };
      onAddMessage(assistantMsg);
    } catch (err: any) {
      console.error(err);
      setErrorMessage("Kuna tatizo la mtandao (Connection failed). Please check your internet connectivity or API setup.");
    } finally {
      setIsWaiting(false);
    }
  };

  return (
    <div id="chats-window" className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px]">
      
      {/* Mode selectors side drawer */}
      <div className="lg:col-span-4 space-y-3">
        <div className="bg-white rounded-sm border border-black/5 p-4 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-black/40 mb-2 font-mono">
            Select Mentor Focus Mode
          </h3>
          <p className="text-[11px] text-black/60 mb-3">
            Msomi AI recalibrates coaching strategies depending on your chosen goal. Switch seamlessly.
          </p>

          <div className="space-y-1.5">
            {MODE_META.map(meta => {
              const isActive = activeMode === meta.id;
              return (
                <button
                  key={meta.id}
                  onClick={() => {
                    setActiveMode(meta.id);
                    setErrorMessage(null);
                  }}
                  className={`w-full text-left p-2.5 rounded-sm border-l-4 border text-xs flex flex-col transition-all cursor-pointer ${
                    isActive 
                      ? `${meta.accent} border-y border-r border-black/5 font-bold` 
                      : 'border-black/5 border-l-black/25 bg-[#F5F2ED]/50 text-black/75 hover:bg-[#F5F2ED]'
                  }`}
                >
                  <span className="font-semibold">{meta.label}</span>
                  <span className="text-[10px] text-black/55 mt-0.5 leading-snug">{meta.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Help box */}
        <div className="bg-[#F5F2ED] rounded-sm border border-black/5 p-4 text-[11px] text-black/60 leading-relaxed shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-black mb-1.5 font-sans">
            <GraduationCap className="h-4 w-4 text-[#C15B32]" /> Academic Integrity Pledge
          </div>
          Msomi AI is customized to expand your competence, not aid plagiarism. We generate code blueprints, structures, and grading checklist indicators, but NEVER submit-ready final assignments.
        </div>
      </div>

      {/* Primary chat workspace */}
      <div className="lg:col-span-8 bg-white rounded-sm border border-black/5 flex flex-col justify-between overflow-hidden shadow-sm">
        
        {/* Workspace banner info */}
        <div className="bg-[#F5F2ED] p-3.5 border-b border-black/5 flex justify-between items-center text-xs">
          <div>
            <span className="text-[9px] uppercase font-mono text-[#C15B32] font-semibold">
              Focus In Progress:
            </span>
            <h3 className="text-[#1A1A1A] font-bold font-serif italic text-sm">{activeMeta.label}</h3>
          </div>

          {messages.filter(m => m.mode === activeMode).length > 0 && (
            <button
              onClick={onClearHistory}
              className="text-[10px] text-black/40 hover:text-[#C15B32] hover:underline cursor-pointer uppercase tracking-wider font-mono font-bold"
            >
              Clear History
            </button>
          )}
        </div>

        {/* Dialog stream area */}
        <div className="p-4 md:p-6 space-y-4 max-h-[380px] overflow-y-auto min-h-[300px] flex-1">
          {messages.filter(m => m.mode === activeMode).length === 0 ? (
            /* Cold Start welcome */
            <div className="h-full flex flex-col justify-center items-center text-center space-y-4 py-8">
              <div className="p-3 bg-[#C15B32]/10 text-[#C15B32] rounded-none border border-[#C15B32]/10 animate-bounce">
                <Sparkles className="h-6 w-6" />
              </div>

              <div>
                <h4 className="text-base font-serif italic font-medium text-black">
                  Mambo vipi, {profile.name}! I am ready in {activeMeta.label}
                </h4>
                <p className="text-[11px] text-black/50 max-w-sm mx-auto mt-1 leading-normal">
                  {activeMeta.desc} Enter your topic below, or trigger one of these quick starter questions:
                </p>
              </div>

              {/* Starter triggers */}
              <div className="space-y-2 max-w-md w-full">
                {activeMeta.starters.map((starter, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(starter)}
                    className="w-full text-left p-3 rounded-sm bg-[#F5F2ED] border border-black/5 text-xs text-black/75 hover:bg-[#EAE4DD] hover:border-[#1A1A1A]/20 transition-all block truncate font-sans font-medium cursor-pointer"
                  >
                    🚀 &quot;{starter}&quot;
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Active message items */
            <div className="space-y-4">
              {messages.filter(m => m.mode === activeMode).map(msg => {
                const isUser = msg.role === 'user';
                return (
                  <div 
                    key={msg.id}
                    className={`flex gap-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                  >
                    {/* Role avatar bubble */}
                    <div className={`h-7 w-7 rounded-sm shrink-0 flex items-center justify-center text-xs border ${
                      isUser 
                        ? 'bg-[#C15B32] border-transparent text-white font-bold' 
                        : 'bg-[#1A1A1A] border-transparent text-white'
                    }`}>
                      {isUser ? profile.name[0].toUpperCase() : 'M'}
                    </div>

                    {/* Speech box content */}
                    <div className={`p-3.5 rounded-sm text-xs space-y-2 ${
                      isUser 
                        ? 'bg-[#C15B32] text-white rounded-tr-none font-medium selection:bg-[#C15B32]/20 selection:text-white' 
                        : 'bg-[#F5F2ED] border border-black/5 text-[#1A1A1A] rounded-tl-none leading-relaxed'
                    }`}>
                      {isUser ? (
                        <p className="font-sans leading-snug">{msg.content}</p>
                      ) : (
                        <div className="space-y-1">{formatTutorText(msg.content)}</div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Waiting streaming state placeholder */}
              {isWaiting && (
                <div className="flex gap-3 max-w-[80%] mr-auto items-center">
                  <div className="h-7 w-7 rounded-sm bg-[#1A1A1A] text-[#C15B32] flex items-center justify-center text-xs select-none">
                    M
                  </div>
                  <div className="bg-[#F5F2ED] border border-black/5 p-3.5 rounded-sm text-black/60 text-xs italic flex items-center gap-2 font-serif">
                    <RefreshCw className="h-3.5 w-3.5 animate-spin text-[#C15B32]" />
                    Msomi AI is consulting resources... (solving difficulty calibrater)
                  </div>
                </div>
              )}

              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-[11px] rounded-sm flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                  {errorMessage}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* User prompt box inputs */}
        <div className="p-3 border-t border-black/5 bg-[#F5F2ED]/50">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(userInput); }}
            className="flex gap-2"
          >
            <input
              type="text"
              required
              disabled={isWaiting}
              value={userInput}
              onChange={e => setUserInput(e.target.value)}
              placeholder={`Ask MSOMI AI about ${activeMeta.label.split(' ')[1]} topics...`}
              className="flex-1 py-2.5 px-4 bg-white border border-black/10 rounded-sm text-black text-xs focus:outline-none focus:border-[#C15B32] disabled:opacity-50"
            />
            
            <button
              type="submit"
              disabled={isWaiting || !userInput.trim()}
              className="bg-[#C15B32] hover:bg-[#1A1A1A] disabled:opacity-50 text-white px-5 py-2.5 rounded-sm text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1 shrink-0 cursor-pointer shadow-sm active:scale-[0.98]"
            >
              <Send className="h-3.5 w-3.5 fill-current" /> Send
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
