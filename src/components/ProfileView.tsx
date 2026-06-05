import React, { useState } from 'react';
import { StudentProfile, StudySession, InnovationProject } from '../types';
import { User, Award, BookOpen, Clock, Settings, Users, Star, BrainCircuit, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

interface ProfileViewProps {
  profile: StudentProfile;
  onUpdateProfile: (profile: StudentProfile) => void;
  recentSessions: StudySession[];
  projects: InnovationProject[];
  onClearData: () => void;
}

export default function ProfileView({ 
  profile, 
  onUpdateProfile, 
  recentSessions, 
  projects,
  onClearData
}: ProfileViewProps) {
  
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(profile.name);
  const [university, setUniversity] = useState(profile.university);
  const [course, setCourse] = useState(profile.course);
  const [year, setYear] = useState(profile.year);
  const [preferredLanguage, setPreferredLanguage] = useState(profile.preferredLanguage);
  const [difficultyLevel, setDifficultyLevel] = useState(profile.difficultyLevel);

  const calculateFocusHours = () => {
    const totalMinutes = recentSessions.reduce((sum, s) => sum + s.durationMinutes, 0);
    return (totalMinutes / 60).toFixed(1);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      ...profile,
      name,
      university,
      course,
      year,
      preferredLanguage,
      difficultyLevel
    });
    setIsEditing(false);
  };

  return (
    <div id="profile-container" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Profile Info and Stats */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white rounded-sm border border-black/5 p-6 relative overflow-hidden shadow-sm">
          {/* Background visuals */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#C15B32]/5 rounded-full blur-xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row items-center gap-4 border-b border-black/5 pb-5">
            <div className="w-16 h-16 rounded-sm bg-black p-1 flex items-center justify-center text-white shrink-0 shadow-sm">
              <User className="h-10 w-10 text-[#C15B32]" />
            </div>

            <div className="text-center sm:text-left">
              <span className="text-[9px] uppercase font-mono font-bold text-[#C15B32] bg-[#C15B32]/10 px-2.5 py-1 rounded-sm border border-transparent">
                Cognitive DNA Master
              </span>
              <h2 className="text-2xl font-serif italic font-bold text-[#1A1A1A] mt-2.5">{profile.name}</h2>
              <p className="text-xs text-black/50">
                {profile.course} (Year {profile.year}) — {profile.university}
              </p>
            </div>
          </div>

          {/* Edit State */}
          {!isEditing ? (
            <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-2">
                <div>
                  <span className="text-black/40 text-[10px] uppercase font-mono tracking-wider font-bold block">Tutor Tone Priority:</span>
                  <p className="text-black font-semibold mt-0.5">
                    {profile.preferredLanguage === 'English' && '🎓 Safi (Academic English)'}
                    {profile.preferredLanguage === 'Kiswahili' && '🇹🇿 Sanifu (Kiswahili)'}
                    {profile.preferredLanguage === 'Sheng' && '🇰🇪 Sheng (Street/Campus Mixed Lingo)'}
                    {profile.preferredLanguage === 'Mixed' && '🌍 Mixed (Eng + Swa Warmth)'}
                  </p>
                </div>
                <div>
                  <span className="text-black/40 text-[10px] uppercase font-mono tracking-wider font-bold block">Coaching Difficulty Level:</span>
                  <p className="text-[#C15B32] font-semibold mt-0.5 flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-current" /> {profile.difficultyLevel} of 5
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <span className="text-black/40 text-[10px] uppercase font-mono tracking-wider font-bold block">Learning Methodology Style:</span>
                  <p className="text-black font-semibold mt-0.5 capitalize">{profile.learningStyle} Method</p>
                </div>
                <div>
                  <span className="text-black/40 text-[10px] uppercase font-mono tracking-wider font-bold block">Key Hurdles Specified:</span>
                  <p className="text-black/75 font-serif italic mt-0.5">{profile.strengths || 'None specified'}</p>
                </div>
              </div>

              <button
                onClick={() => setIsEditing(true)}
                className="w-full mt-4 sm:col-span-2 border border-black/10 hover:border-black/30 hover:bg-[#F5F2ED] text-black/70 py-2.5 rounded-sm text-xs uppercase tracking-wider font-bold cursor-pointer transition-colors"
              >
                Configure Cognitive Calibration
              </button>
            </div>
          ) : (
            <form onSubmit={handleUpdate} className="pt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-black/50 font-mono mb-1">Nickname / Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full text-xs py-2 px-3 bg-[#FCFAF7] border border-black/10 rounded-sm text-black focus:outline-none focus:border-[#C15B32]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-black/50 font-mono mb-1">Course / Major</label>
                  <input
                    type="text"
                    value={course}
                    onChange={e => setCourse(e.target.value)}
                    className="w-full text-xs py-2 px-3 bg-[#FCFAF7] border border-black/10 rounded-sm text-black focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-black/50 font-mono mb-1">Year of Study</label>
                  <select
                    value={year}
                    onChange={e => setYear(parseInt(e.target.value))}
                    className="w-full text-xs py-2 px-3 bg-[#FCFAF7] border border-black/10 rounded-sm text-black focus:outline-none"
                  >
                    {[1,2,3,4,5].map(yr => <option key={yr} value={yr}>Year {yr}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-black/50 font-mono mb-1">Preferred Language</label>
                  <select
                    value={preferredLanguage}
                    onChange={e => setPreferredLanguage(e.target.value as any)}
                    className="w-full text-xs py-2 px-3 bg-[#FCFAF7] border border-black/10 rounded-sm text-black focus:outline-none"
                  >
                    <option value="English">Academic English</option>
                    <option value="Kiswahili">Swahili Sanifu</option>
                    <option value="Sheng">Sheng Lingo</option>
                    <option value="Mixed">Mixed (Eng + Swa)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-black/50 font-mono mb-1">Difficulty</label>
                  <select
                    value={difficultyLevel}
                    onChange={e => setDifficultyLevel(parseInt(e.target.value))}
                    className="w-full text-xs py-2 px-3 bg-[#FCFAF7] border border-black/10 rounded-sm text-black focus:outline-none"
                  >
                    {[1,2,3,4,5].map(lvl => <option key={lvl} value={lvl}>Level {lvl}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-[#C15B32] hover:bg-[#1A1A1A] text-white font-bold px-4 py-2.5 rounded-sm text-xs uppercase tracking-wider cursor-pointer"
                >
                  Save DNA Calibration
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="bg-[#F5F2ED] border border-black/10 text-black/60 px-4 py-2.5 rounded-sm text-xs uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Accountability study network and collaborative reminders */}
        <div className="bg-white rounded-sm border border-black/5 p-5 shadow-sm">
          <h3 className="text-xs font-bold text-black/40 mb-2 font-mono uppercase tracking-wider flex items-center gap-1.5 border-b border-black/5 pb-2">
            <Users className="h-4 w-4 text-[#C15B32]" /> Student Network &amp; Peer Collaboration
          </h3>
          <p className="text-xs text-black/60 leading-relaxed mb-4">
            Constructive collaboration yields higher academic resilience. Establish peer reviews and code pair sessions! MSOMI AI encourages ethical networking.
          </p>

          <div className="bg-[#F5F2ED] p-4 rounded-sm border border-black/5 text-xs space-y-3">
            <span className="font-semibold text-[#1A1A1A] block">📁 Sample Peer Session Outline:</span>
            <ul className="space-y-2 text-black/70 text-[11px] list-disc list-inside">
              <li><strong>No Copy-Pasting</strong>: Screen-share concepts and review architectural outlines rather than transferring raw solution files.</li>
              <li><strong>Active Quiz Battle</strong>: Take the customized MSOMI AI dynamic quiz together or create study group battles.</li>
              <li><strong>Community Critique</strong>: Pitch your Innovation Lab drafts to local stakeholders or hostel mates for raw feedback.</li>
            </ul>

            <button
              onClick={() => {
                const sampleInvite = `Mambo! Join my MSOMI AI study block focus today! Let's prep on "${profile.course}" topics together. No copying, just concept mastery.`;
                navigator.clipboard.writeText(sampleInvite);
                alert("📋 High-impact study accountability invite copied to clipboard! Share inside your course WhatsApp / Telegram study channel.");
              }}
              className="w-full mt-2 flex items-center justify-center gap-1 bg-[#C15B32] text-white py-2 rounded-sm text-[11px] font-bold uppercase tracking-wider cursor-pointer"
            >
              Copy Study Invite Template
            </button>
          </div>
        </div>
      </div>

      {/* Progress metrics dashboard */}
      <div className="space-y-4">
        <div className="bg-white rounded-sm border border-black/5 p-5 shadow-sm">
          <h3 className="text-xs font-bold text-black/40 mb-3 font-mono border-b border-black/5 pb-2 flex items-center gap-1.5 uppercase tracking-wider">
            <BrainCircuit className="h-4 w-4 text-[#C15B32]" /> Cognitive Milestones Logbed
          </h3>

          <div className="space-y-4 text-xs">
            <div className="flex justify-between items-center py-1">
              <span className="text-black/60">Total focus time logged:</span>
              <span className="font-extrabold text-[#1A1A1A] text-sm flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-[#C15B32]" /> {calculateFocusHours()} hrs
              </span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-black/60">Quiz prep items finished:</span>
              <span className="font-extrabold text-[#1A1A1A] text-sm">
                {recentSessions.filter(s => s.activityType === 'EXAM_PREP').length} drills
              </span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-black/60 font-sans">Active Incubated Startups:</span>
              <span className="font-extrabold text-[#C15B32] text-sm">
                {projects.length} drafts
              </span>
            </div>

            <div className="pt-3 border-t border-black/5 text-[10px] text-black/45 text-center leading-normal">
              MSOMI AI auto-calibrates system instructions dynamically based on these milestones to speed up Q&amp;A sessions.
            </div>
          </div>
        </div>

        {/* Clear Data reset parameters */}
        <div className="bg-red-50 rounded-sm border border-red-100 p-4 text-center space-y-2">
          <span className="text-[10px] font-bold text-red-700 uppercase font-mono block">⚠️ RESET PARAMETERS</span>
          <p className="text-[10px] text-red-600 leading-relaxed font-sans">
            Need a fresh academic start? This wipes out your Cognitive profile DNA, study logs, and innovation drafts permanently.
          </p>

          <button
            onClick={() => {
              if (confirm("🚨 Are you absolutely sure? This clears your stored study blocks, profile data, and incubated innovations permanently. This is irreversible.")) {
                onClearData();
              }
            }}
            className="w-full bg-red-100/50 hover:bg-red-100 border border-red-200 text-red-700 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
          >
            Purge Storage &amp; Fresh Core Reboot
          </button>
        </div>
      </div>

    </div>
  );
}
