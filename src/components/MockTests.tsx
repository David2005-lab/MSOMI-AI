import React, { useState } from 'react';
import { Quiz, QuizQuestion } from '../types';
import { GraduationCap, Award, HelpCircle, RefreshCw, CheckCircle, XCircle, ChevronRight, Play, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MockTestsProps {
  difficultyLevel: number;
  course: string;
}

const PRESET_QUIZZES: Quiz[] = [
  {
    id: 'mpesa_api',
    title: "African Mobile Money Integration (M-Pesa API)",
    category: "Software Engineering",
    difficulty: 3,
    questions: [
      {
        id: 1,
        question: "When integrating the M-Pesa Daraja API, why would an application use the 'LIPA NA M-PESA ONLINE' (STK Push) transaction type?",
        options: [
          "To request the customer to enter their PIN directly on an interactive web form on the merchant's site.",
          "To trigger a secure pop-up dialog (PIN prompt) directly on the user's mobile device via USSD/SIM Tool Kit.",
          "To manually query the safaricom ledger for bank transfers.",
          "To transfer bulk funds from a corporate payroll to multiple contractors."
        ],
        correctAnswer: "To trigger a secure pop-up dialog (PIN prompt) directly on the user's mobile device via USSD/SIM Tool Kit.",
        explanation: "STK Push utilizes Sim Tool Kit technology to automatically prompt the user's phone for an M-Pesa PIN, facilitating immediate, customer-approved web transactions."
      },
      {
        id: 2,
        question: "What is the primary role of the 'Shortcode' and 'Passkey' ingenerating an API password for Daraja transactions?",
        options: [
          "They are used to encrypt credit card information.",
          "They are concatenated with a timestamp and base64-encoded to form the transaction authentication key.",
          "They serve as SMS routing coordinates.",
          "They verify the physical coordinates of the API servers."
        ],
        correctAnswer: "They are concatenated with a timestamp and base64-encoded to form the transaction authentication key.",
        explanation: "To carry out M-Pesa Online STK Push requests, you combine Shortcode, Passkey, and Timestamp, and base64 decode/encode them as the authentication header credential."
      },
      {
        id: 3,
        question: "How do you handle transactional feedback security when building a payment callback handler in Django or Express?",
        options: [
          "Ignore SSL certificates.",
          "Allow public access without confirming signatures.",
          "Configure specific HTTPS callback endpoints, check IP ranges if possible, and validate the transaction metadata payload securely.",
          "Always process raw HTTP payloads without checking request authenticity."
        ],
        correctAnswer: "Configure specific HTTPS callback endpoints, check IP ranges if possible, and validate the transaction metadata payload securely.",
        explanation: "Callback endpoints must run over HTTPS and fully validate the response schema. Validating parameters like TransactionID prevents replay attacks."
      }
    ]
  },
  {
    id: 'agri_tech',
    title: "Agribusiness systems & IoT Irrigation",
    category: "Agricultural Technology",
    difficulty: 4,
    questions: [
      {
        id: 1,
        question: "In automated drip irrigation systems used in arid East African counties, which soil metric is most critical to prevent water wastage?",
        options: [
          "Humus decomposition index",
          "Volumetric Water Content (VWC) parsed from capacitive soil moisture sensors",
          "Soil ambient carbon count",
          "Surface air temperature"
        ],
        correctAnswer: "Volumetric Water Content (VWC) parsed from capacitive soil moisture sensors",
        explanation: "Capacitive sensors evaluate the soil dielectric constant to determine soil moisture content, enabling smart systems to trigger relays only when actual VWC drops below safe crop thresholds."
      },
      {
        id: 2,
        question: "Why are capacitive soil moisture sensors generally preferred over resistive soil sensors in smallholder farm designs?",
        options: [
          "Resistive sensors are too expensive.",
          "Capacitive sensors do not undergo galvanic corrosion inside wet soil over time.",
          "Resistive sensors only work with automated greenhouses.",
          "Capacitive sensors measure the air humidity instead."
        ],
        correctAnswer: "Capacitive sensors do not undergo galvanic corrosion inside wet soil over time.",
        explanation: "Resistive soil moisture sensors rely on passing current between two exposed probes, leading to rapid corrosion. Capacitive sensors shield the metal parts, making them durable for outdoor farming."
      }
    ]
  }
];

export default function MockTests({ difficultyLevel, course }: MockTestsProps) {
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Dynamic Generator configuration
  const [customTopic, setCustomTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const startQuiz = (quiz: Quiz) => {
    setActiveQuiz(quiz);
    setCurrentIdx(0);
    setSelectedOption(null);
    setIsConfirmed(false);
    setScore(0);
    setIsFinished(false);
  };

  const handleOptionSelect = (opt: string) => {
    if (isConfirmed) return;
    setSelectedOption(opt);
  };

  const handleConfirmAnswer = () => {
    if (!selectedOption || !activeQuiz) return;
    
    const currQuestion = activeQuiz.questions[currentIdx];
    const isCorrect = selectedOption === currQuestion.correctAnswer;
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    setIsConfirmed(true);
  };

  const handleNext = () => {
    if (!activeQuiz) return;
    
    if (currentIdx + 1 < activeQuiz.questions.length) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOption(null);
      setIsConfirmed(false);
    } else {
      setIsFinished(true);
    }
  };

  const generateAIOtherQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTopic.trim()) return;

    setIsGenerating(true);
    setGenerationError(null);

    try {
      const response = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: customTopic,
          course: course || "General studies",
          difficulty: difficultyLevel || 3
        })
      });

      if (!response.ok) {
        throw new Error("Unable to contact backend tutor engine.");
      }

      const generatedData: Quiz = await response.json();
      if (generatedData && generatedData.questions && generatedData.questions.length > 0) {
        startQuiz(generatedData);
      } else {
        throw new Error("Tutor engine returned empty dataset.");
      }
    } catch (err: any) {
      console.error(err);
      setGenerationError("Kuna shida kidogo (We had an issue generating details). Please check your internet connection and try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div id="quiz-tab" className="space-y-6">
      {!activeQuiz ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Static Practice Sets */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex justify-between items-center bg-white rounded-sm border border-black/5 p-4 shadow-sm">
              <div>
                <h2 className="text-base font-serif italic font-bold text-[#1A1A1A]">Mazoezi ya Mentorship (Practice Center)</h2>
                <p className="text-xs text-black/50">Challenge yourself with interactive questions matching your curriculum direction.</p>
              </div>
              <HelpCircle className="text-[#C15B32] h-6 w-6 shrink-0" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {PRESET_QUIZZES.map(quiz => (
                <div 
                  key={quiz.id} 
                  className="bg-white border border-black/5 rounded-sm p-5 flex flex-col justify-between hover:border-[#C15B32]/40 transition-all shadow-sm"
                >
                  <div>
                    <span className="text-[9px] uppercase font-mono tracking-widest text-[#C15B32] bg-[#C15B32]/10 px-2 py-0.5 rounded-sm font-bold">
                      {quiz.category}
                    </span>
                    <h3 className="font-serif italic text-[#1A1A1A] text-sm mt-3.5 line-clamp-2 leading-snug">{quiz.title}</h3>
                    <p className="text-[11px] text-black/40 font-mono mt-1.5">{quiz.questions.length} Concepts targeted</p>
                  </div>

                  <button
                    onClick={() => startQuiz(quiz)}
                    className="w-full mt-4 flex items-center justify-center gap-1.5 bg-[#F5F2ED] hover:bg-[#EAE4DD] text-black/70 hover:text-black border border-black/5 py-2 rounded-sm text-xs font-semibold cursor-pointer transition-colors"
                  >
                    <Play className="h-3.5 w-3.5 text-[#C15B32] fill-current" /> Start Practice Set
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* AI Custom Quiz Generator */}
          <div className="bg-white rounded-sm border border-black/5 p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 mb-3 border-b border-black/5 pb-2">
                <Settings className="text-[#C15B32] h-4 w-4" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-black/40 font-mono">Generate Adaptive AI Quiz</h3>
              </div>
              <p className="text-xs text-black/60 mb-4 leading-relaxed font-sans">
                Need customized questions? Type your active curriculum challenge, and MSOMI AI will spawn synthetic prep quizzes tailored for you!
              </p>

              <form onSubmit={generateAIOtherQuiz} className="space-y-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-black/50 font-mono mb-1">Target Topic</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Photosynthesis, DC Motors, Soil Erosion"
                    value={customTopic}
                    onChange={e => setCustomTopic(e.target.value)}
                    className="w-full text-xs py-2 px-3 bg-[#FCFAF7] border border-black/10 rounded-sm text-black focus:outline-none focus:border-[#C15B32] transition-colors"
                  />
                </div>

                <div className="text-[10px] text-black/60 bg-[#F5F2ED] p-2.5 rounded-sm border border-black/5 leading-relaxed font-sans mt-2">
                  💡 Customized at <span className="text-[#C15B32] font-bold">Difficulty {difficultyLevel}/5</span> based on your current Cognitive DNA.
                </div>

                {generationError && (
                  <p className="text-[10px] text-red-700 font-semibold bg-red-50 p-2 rounded-sm border border-red-200">
                    {generationError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isGenerating || !customTopic.trim()}
                  className="w-full mt-2 flex items-center justify-center gap-1.5 bg-[#C15B32] text-white font-bold hover:bg-[#1A1A1A] py-2.5 rounded-sm text-xs uppercase tracking-widest transition-all shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                  {isGenerating ? 'Synthesizing quiz...' : 'Generate Mock Test'}
                </button>
              </form>
            </div>

            <div className="text-[9px] text-black/30 font-mono mt-5 text-center leading-relaxed">
              🔒 Quiz engine abides strictly by Academic Integrity rules — no leaks, only deep preparation modules.
            </div>
          </div>
        </div>
      ) : (
        /* Active Quiz Screen */
        <div className="bg-white rounded-sm border border-black/5 max-w-2xl mx-auto overflow-hidden shadow-md">
          {/* Header */}
          <div className="bg-[#F5F2ED] border-b border-black/5 p-4 flex justify-between items-center text-xs">
            <div>
              <span className="text-black/40 font-mono uppercase text-[9px]">QUIZ ACTIVE:</span>
              <h3 className="font-serif italic font-bold text-[#1A1A1A] text-sm line-clamp-1 leading-snug">{activeQuiz.title}</h3>
            </div>
            <button
              onClick={() => setActiveQuiz(null)}
              className="text-black/50 hover:text-[#C15B32] hover:underline uppercase tracking-wider text-[9px] font-mono font-bold cursor-pointer"
            >
              Exit Practice
            </button>
          </div>

          {!isFinished ? (
            <div className="p-6 space-y-5">
              {/* Question progress */}
              <div className="flex justify-between items-center text-[9px] uppercase font-mono tracking-widest font-bold text-black/45">
                <span>Progress: Question {currentIdx + 1} of {activeQuiz.questions.length}</span>
                <span className="text-[#C15B32]">Core Prep</span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1 bg-[#F5F2ED] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#C15B32] transition-all duration-300"
                  style={{ width: `${((currentIdx + 1) / activeQuiz.questions.length) * 100}%` }}
                />
              </div>

              {/* Question */}
              <h2 className="text-sm font-bold text-[#1A1A1A] font-sans leading-relaxed">
                {activeQuiz.questions[currentIdx].question}
              </h2>

              {/* Options */}
              <div className="space-y-2.5 pt-2">
                {activeQuiz.questions[currentIdx].options.map((opt, i) => {
                  const isSelected = selectedOption === opt;
                  const isCorrectAnswer = opt === activeQuiz.questions[currentIdx].correctAnswer;
                  
                  let optionStyle = "bg-[#FCFAF7] border-black/10 text-black/75 hover:border-black/30 hover:bg-[#F5F2ED]";
                  if (isSelected && !isConfirmed) {
                    optionStyle = "bg-[#C15B32]/10 border-[#C15B32] text-[#C15B32] font-semibold";
                  } else if (isConfirmed) {
                    if (isCorrectAnswer) {
                      optionStyle = "bg-green-50 border-green-300 text-green-800 font-bold shadow-sm";
                    } else if (isSelected) {
                      optionStyle = "bg-red-50 border-red-200 text-red-700";
                    } else {
                      optionStyle = "bg-[#FCFAF7]/40 border-black/5 text-black/30 pointer-events-none";
                    }
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => handleOptionSelect(opt)}
                      disabled={isConfirmed}
                      className={`w-full text-left p-3.5 rounded-sm border text-xs flex items-center justify-between transition-all cursor-pointer ${optionStyle}`}
                    >
                      <span className="flex-1 pr-2 leading-relaxed">{opt}</span>
                      {isConfirmed && isCorrectAnswer && <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />}
                      {isConfirmed && isSelected && !isCorrectAnswer && <XCircle className="h-4 w-4 text-red-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Dynamic feedback explanation block */}
              {isConfirmed && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#F5F2ED] border border-black/5 rounded-sm p-4 space-y-1"
                >
                  <span className="text-[9px] uppercase font-bold text-[#C15B32] font-mono tracking-widest flex items-center gap-1">
                    📖 Tutor Explanation
                  </span>
                  <p className="text-xs text-black/80 leading-relaxed font-sans mt-1">
                    {activeQuiz.questions[currentIdx].explanation}
                  </p>
                </motion.div>
              )}

              {/* Footer controllers */}
              <div className="flex justify-end pt-3 border-t border-black/5">
                {!isConfirmed ? (
                  <button
                    onClick={handleConfirmAnswer}
                    disabled={!selectedOption}
                    className="flex items-center gap-1.5 bg-[#C15B32] hover:bg-[#1A1A1A] text-white uppercase tracking-widest font-bold px-6 py-2 rounded-sm text-xs transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Confirm Choice
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="flex items-center gap-1.5 bg-[#1A1A1A] text-white hover:bg-[#C15B32] px-6 py-2 rounded-sm text-xs transition-transform tracking-wider uppercase font-bold active:scale-[0.98] cursor-pointer"
                  >
                    {currentIdx + 1 === activeQuiz.questions.length ? 'Show Score' : 'Next Question'} <ChevronRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Quiz Completed Screen */
            <div className="p-8 text-center space-y-5">
              <div className="inline-block p-4 bg-[#C15B32]/10 text-[#C15B32] rounded-none border border-[#C15B32]/10 mb-2">
                <Award className="h-10 w-10 animate-pulse" />
              </div>
              
              <h2 className="text-xl font-serif italic text-black font-semibold">Practice Set Finished!</h2>
              <p className="text-xs text-black/50 max-w-xs mx-auto leading-relaxed">
                You evaluated multiple challenges and completed this structured conceptual assessment.
              </p>

              <div className="p-4 bg-[#F5F2ED] rounded-sm border border-black/5 max-w-sm mx-auto">
                <span className="text-black/40 uppercase text-[9px] font-mono mt-0.5 tracking-wider block">Your Score Card:</span>
                <div className="text-3xl font-extrabold text-[#1A1A1A] mt-1.5">
                  {score} / {activeQuiz.questions.length}
                </div>
                <div className="text-xs font-semibold text-[#C15B32] mt-1 font-mono">
                  ({Math.round((score / activeQuiz.questions.length) * 100)}% Accuracy rate)
                </div>
              </div>

              <div className="text-xs text-black/60 italic leading-relaxed">
                {score === activeQuiz.questions.length 
                  ? "🔥 Brilliant! Outstanding clarity of core concepts." 
                  : "📚 Standard attempt! Review the tutor explanations above and try again."}
              </div>

              <div className="flex justify-center gap-3 pt-4">
                <button
                  onClick={() => startQuiz(activeQuiz)}
                  className="bg-[#F5F2ED] border border-black/10 hover:bg-[#EAE4DD] hover:border-black/30 text-black/70 px-5 py-2.5 rounded-sm text-xs uppercase tracking-wider font-bold cursor-pointer"
                >
                  Retry same set
                </button>
                <button
                  onClick={() => setActiveQuiz(null)}
                  className="bg-[#C15B32] text-white hover:bg-[#1A1A1A] font-bold uppercase tracking-wider px-5 py-2.5 rounded-sm text-xs cursor-pointer"
                >
                  Choose another topic
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
