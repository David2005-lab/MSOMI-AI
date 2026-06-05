import React, { useState } from 'react';
import { StudentProfile } from '../types';
import { BookOpen, Sparkles, GraduationCap, ChevronRight, User } from 'lucide-react';
import { motion } from 'motion/react';

interface OnboardingProps {
  onComplete: (profile: StudentProfile) => void;
}

const AFRICAN_UNIVERSITIES = [
  "University of Nairobi (UoN)",
  "Makerere University",
  "University of Dar es Salaam (UDSM)",
  "Kenyatta University",
  "Ashesi University",
  "University of Ibadan (UI)",
  "University of Cape Town (UCT)",
  "Kwame Nkrumah University of Science and Technology (KNUST)",
  "Addis Ababa University",
  "Jomo Kenyatta University of Agriculture and Technology (JKUAT)",
  "Strathmore University",
  "United States International University (USIU-A)",
  "Other / Custom"
];

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [profile, setProfile] = useState<StudentProfile>({
    name: '',
    university: 'University of Nairobi (UoN)',
    course: '',
    year: 1,
    preferredLanguage: 'English',
    difficultyLevel: 3,
    learningStyle: 'mixed',
    strengths: '',
    interests: '',
  });

  const [step, setStep] = useState(1);
  const [customUniversity, setCustomUniversity] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (profile.name.trim() && profile.course.trim()) {
      const finalProfile = {
        ...profile,
        university: profile.university === 'Other / Custom' ? customUniversity || 'African University' : profile.university
      };
      onComplete(finalProfile);
    }
  };

  return (
    <div id="onboarding-root" className="min-h-screen bg-[#FCFAF7] flex flex-col items-center justify-center p-4">
      <motion.div 
        id="onboarding-card"
        initial={{ opacity: 0, y: 15 }} 
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-white border border-black/5 rounded-sm p-6 md:p-8 shadow-md relative overflow-hidden"
      >
        {/* Background Accent Flairs */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#C15B32]/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#C15B32]/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col items-center mb-6">
          <div className="p-3 bg-[#C15B32]/10 text-[#C15B32] rounded-none border border-[#C15B32]/20 mb-3 animate-pulse">
            <GraduationCap className="h-8 w-8" />
          </div>
          <h1 className="font-serif text-3xl italic font-light tracking-tight text-[#1A1A1A] flex items-center gap-2">
            Msomi <span className="text-[12px] uppercase tracking-[0.2em] font-sans font-bold text-[#C15B32] bg-[#C15B32]/10 px-2 rounded-sm">AI</span>
          </h1>
          <p className="text-black/50 text-xs text-center mt-1.5 max-w-md">
            Setting up your adaptive Academic Co-Pilot &amp; Mentor. Let&apos;s personalize your Cognitive DNA.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-black/40 mb-2 pb-1.5 border-b border-black/5 font-mono">
                1: Mambo! Tell us about yourself
              </h2>
              <div>
                <label className="block text-xs font-semibold text-black/70 mb-1 flex items-center gap-1">
                  <User className="h-3.5 w-3.5 text-[#C15B32]" /> Full Name or Nickname
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Fredrick, Aisha, Chinedu"
                  value={profile.name}
                  onChange={e => setProfile({ ...profile, name: e.target.value })}
                  className="w-full text-sm py-2 px-3 bg-[#F5F2ED] border border-black/10 rounded-sm text-[#1A1A1A] focus:outline-none focus:border-[#C15B32] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-black/70 mb-1">
                  University / Campus
                </label>
                <select
                  value={profile.university}
                  onChange={e => setProfile({ ...profile, university: e.target.value })}
                  className="w-full text-sm py-2 px-3 bg-[#F5F2ED] border border-black/10 rounded-sm text-[#1A1A1A] focus:outline-none focus:border-[#C15B32] transition-colors"
                >
                  {AFRICAN_UNIVERSITIES.map(uni => (
                    <option key={uni} value={uni}>{uni}</option>
                  ))}
                </select>

                {profile.university === 'Other / Custom' && (
                  <input
                    type="text"
                    required
                    placeholder="Enter your university name"
                    value={customUniversity}
                    onChange={e => setCustomUniversity(e.target.value)}
                    className="w-full text-sm mt-2 py-2 px-3 bg-[#F5F2ED] border border-black/10 rounded-sm text-[#1A1A1A] focus:outline-none focus:border-[#C15B32] transition-colors"
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-black/70 mb-1">
                    Course / Major
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Computer Science, Agriculture"
                    value={profile.course}
                    onChange={e => setProfile({ ...profile, course: e.target.value })}
                    className="w-full text-sm py-2 px-3 bg-[#F5F2ED] border border-black/10 rounded-sm text-[#1A1A1A] focus:outline-none focus:border-[#C15B32] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-black/70 mb-1">
                    Year of Study
                  </label>
                  <select
                    value={profile.year}
                    onChange={e => setProfile({ ...profile, year: parseInt(e.target.value) })}
                    className="w-full text-sm py-2 px-3 bg-[#F5F2ED] border border-black/10 rounded-sm text-[#1A1A1A] focus:outline-none focus:border-[#C15B32] transition-colors"
                  >
                    {[1, 2, 3, 4, 5].map(yr => (
                      <option key={yr} value={yr}>Year {yr}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={() => profile.name.trim() && profile.course.trim() && setStep(2)}
                disabled={!profile.name.trim() || !profile.course.trim()}
                className="w-full mt-4 flex items-center justify-center gap-2 bg-[#1A1A1A] text-white hover:bg-[#C15B32] py-2.5 rounded-sm text-xs uppercase tracking-widest font-bold transition-all shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Proceed to Learning Plan <ChevronRight className="h-4 w-4" />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-black/40 mb-2 pb-1.5 border-b border-black/5 font-mono flex justify-between items-center">
                <span>2: Cognitive DNA Setup</span>
                <button type="button" onClick={() => setStep(1)} className="text-xs text-[#C15B32] hover:underline uppercase tracking-wide">Back</button>
              </h2>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-black/70 mb-1">
                    Preferred Language
                  </label>
                  <select
                    value={profile.preferredLanguage}
                    onChange={e => setProfile({ ...profile, preferredLanguage: e.target.value as any })}
                    className="w-full text-sm py-2 px-3 bg-[#F5F2ED] border border-black/10 rounded-sm text-[#1A1A1A] focus:outline-none"
                  >
                    <option value="English">Safi (Academic English)</option>
                    <option value="Kiswahili">Sanifu (Kiswahili)</option>
                    <option value="Sheng">Sheng / Street lingo</option>
                    <option value="Mixed">Mixed (Eng + Swa)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-black/70 mb-1">
                    Difficulty Target
                  </label>
                  <select
                    value={profile.difficultyLevel}
                    onChange={e => setProfile({ ...profile, difficultyLevel: parseInt(e.target.value) })}
                    className="w-full text-sm py-2 px-3 bg-[#F5F2ED] border border-black/10 rounded-sm text-[#1A1A1A] focus:outline-none"
                  >
                    <option value="1">1 - Foundation Mode</option>
                    <option value="2">2 - Easy-Medium</option>
                    <option value="3">3 - Balanced Core</option>
                    <option value="4">4 - Advanced Rigor</option>
                    <option value="5">5 - Lecturer Mentality</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-black/70 mb-1">
                  How do you learn best?
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { style: 'visual', label: '🎨 Visual & Schemas' },
                    { style: 'practical', label: '🛠️ Code / Exercises' },
                    { style: 'theoretical', label: '📖 Comprehensive Rec.' },
                    { style: 'mixed', label: '🗺️ Balanced Core' }
                  ].map(opt => (
                    <button
                      key={opt.style}
                      type="button"
                      onClick={() => setProfile({ ...profile, learningStyle: opt.style as any })}
                      className={`text-left py-2 px-3 rounded-sm border transition-all ${
                        profile.learningStyle === opt.style
                          ? 'bg-[#C15B32]/10 border-[#C15B32] text-[#C15B32] font-semibold'
                          : 'bg-[#F5F2ED] border-black/5 text-[#1A1A1A]/70 hover:border-black/20'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-black/70 mb-1">
                  What are your strengths / key hurdles?
                </label>
                <input
                  type="text"
                  placeholder="e.g., Good at maths but struggle with essays"
                  value={profile.strengths}
                  onChange={e => setProfile({ ...profile, strengths: e.target.value })}
                  className="w-full text-sm py-2 px-3 bg-[#F5F2ED] border border-black/10 rounded-sm text-[#1A1A1A] focus:outline-none focus:border-[#C15B32] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-black/70 mb-1">
                  Career Interests / Innovations you care about
                </label>
                <input
                  type="text"
                  placeholder="e.g., Agri-Tech, Fintech, Renewable energy"
                  value={profile.interests}
                  onChange={e => setProfile({ ...profile, interests: e.target.value })}
                  className="w-full text-sm py-2 px-3 bg-[#F5F2ED] border border-black/10 rounded-sm text-[#1A1A1A] focus:outline-none focus:border-[#C15B32] transition-colors"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-4 flex items-center justify-center gap-2 bg-[#C15B32] text-white hover:bg-[#1A1A1A] py-3 rounded-sm text-xs uppercase tracking-widest font-bold transition-all shadow-sm active:scale-[0.98] cursor-pointer"
              >
                <Sparkles className="h-4.5 w-4.5" /> Initialize Msomi AI <ChevronRight className="h-4 w-4" />
              </button>
            </motion.div>
          )}
        </form>

        <div className="mt-6 pt-4 border-t border-black/5 flex justify-between text-[10px] text-black/30 font-mono">
          <span>🔒 Stored securely in local workspace</span>
          <span>© 2026 Msomi AI Co-Pilot</span>
        </div>
      </motion.div>
    </div>
  );
}
