/**
 * App.tsx
 * Primary entry point for MSOMI AI Academic Mentor dashboard workspace.
 */

import React, { useState, useEffect } from 'react';
import { StudentProfile, ChatMessage, StudySession, InnovationProject, CourseTrack, StudyGroup, AcademicReminder, DailyStudyPlan, ExamCountdown } from './types';
import Onboarding from './components/Onboarding';
import LoginAuth from './components/LoginAuth';
import { TRANSLATIONS, Language } from './utils/languages';
import ChatWorkspace from './components/ChatWorkspace';
import StudyTimer from './components/StudyTimer';
import MockTests from './components/MockTests';
import InnovationLab from './components/InnovationLab';
import ProfileView from './components/ProfileView';
import SyllabusTracker from './components/SyllabusTracker';
import StudyGroups from './components/StudyGroups';
import CVBuilder from './components/CVBuilder';
import SmartPlanner from './components/SmartPlanner';

// Icon imports
import { 
  Sparkles, 
  MessageSquare, 
  Clock, 
  BookOpen, 
  Lightbulb, 
  User, 
  GraduationCap, 
  Award, 
  Star,
  Users,
  CheckCircle,
  Zap,
  TrendingUp,
  ChevronRight,
  BookMarked,
  Calendar,
  Bell,
  FileText
} from 'lucide-react';
import { motion } from 'motion/react';

// Default seed data for initial cold-start experience
const DEFAULT_COURSES: CourseTrack[] = [
  {
    id: 'c1',
    code: 'CSC 204',
    name: 'Relational Database Management',
    targetGrade: 'A',
    topics: [
      { id: 't1_1', name: 'Database Redundancy & Anomaly definition', status: 'Complete' },
      { id: 't1_2', name: 'First Normal Form (1NF) atomic splits', status: 'In Progress' },
      { id: 't1_3', name: 'Second & Third Normal Forms (2NF, 3NF)', status: 'Not Started' },
      { id: 't1_4', name: 'SQL Query Joins & Tables Indexes', status: 'Not Started' }
    ],
    notes: 'Kumbuka: 3NF inakataza transitive dependency. Instructor office details zinatakiwa kuwa kwenye table nyingine ya Lecturers badala ya kukaa na student ID.'
  },
  {
    id: 'c2',
    code: 'CSC 210',
    name: 'Design & Analysis of Algorithms',
    targetGrade: 'A',
    topics: [
      { id: 't2_1', name: 'Big O Notation complexity bounds', status: 'Complete' },
      { id: 't2_2', name: 'Kruskal\'s Minimum Spanning Tree (Analogy of Safaricom routing)', status: 'In Progress' },
      { id: 't2_3', name: 'Dijkstra\'s shortest path graph matrices', status: 'Not Started' }
    ],
    notes: 'Fomu ya Kruskal: Panga Edges zote kwa mpangilio wa bei, kisha chagua cheapest edge ikiwa haisababishi loop ya cycle.'
  },
  {
    id: 'c3',
    code: 'MTH 102',
    name: 'Calculus II & Differential Equations',
    targetGrade: 'B+',
    topics: [
      { id: 't3_1', name: 'Fundamental Limits & Continuity theorems', status: 'Complete' },
      { id: 't3_2', name: 'Integration by parts formulas', status: 'In Progress' },
      { id: 't3_3', name: 'Taylor Power series approximations', status: 'Not Started' }
    ]
  }
];

const DEFAULT_GROUPS: StudyGroup[] = [
  {
    id: 'g1',
    name: 'Computer Science Cohort Y1',
    description: 'Kikundi cha kupasua masomo ya Programu za algorithms, data structures na databases ya mwaka wa kwanza.',
    subject: 'Computer Science',
    membersCount: 18,
    isJoined: true,
    createdBy: 'Lecturer Juma',
    posts: [
      {
        id: 'p1_1',
        authorName: 'Amina',
        content: 'Mambo vipi wanachama na wasomi wenzangu! Kuna mtu anajua jinsi Kruskal\'s inavyolinda kutengeneza loop tukichagua edge ya tatu? Sielewi hapo hasa.',
        timestamp: 'Masaa 2 yaliyopita',
        likesCount: 3
      },
      {
        id: 'p1_2',
        authorName: 'Gabriel',
        content: 'Hey Amina! Unaweza kutumia algorithm ya Union-Find au Disjoint-Set ili kujua kama nodes mbili tayari ziko kwenye kundi moja la mtandao kabla haujaziunganisha.',
        timestamp: 'Saa 1 lililopita',
        likesCount: 5
      }
    ]
  },
  {
    id: 'g2',
    name: 'Agribusiness Pioneers',
    description: 'Vikundi vya wanafunzi wanaojenga mifumo ya umwagaji maji ya kijanja na mashine za IoT kulinda mazao.',
    subject: 'Agriculture',
    membersCount: 12,
    isJoined: false,
    createdBy: 'Peter Mwita',
    posts: [
      {
        id: 'p2_1',
        authorName: 'John',
        content: 'Soil nitrogen levels hapa shambani Moshi ziko chini sana, nafikiria kufanya rotation ya mahindi na maharagwe ili kuongeza nitrates bure bila mbolea ghali.',
        timestamp: 'Siku 1 iliyopita',
        likesCount: 2
      }
    ]
  },
  {
    id: 'g3',
    name: 'Calculus & Algebra Drills',
    description: 'Solving limits, power calculations, and differentials with campus mates.',
    subject: 'Mathematics',
    membersCount: 22,
    isJoined: false,
    createdBy: 'Mwajuma Hassan',
    posts: []
  }
];

const DEFAULT_REMINIDERS: AcademicReminder[] = [
  {
    id: 'rem-1',
    type: 'reminder',
    channel: 'whatsapp',
    phone: '+255 712 345 678',
    message: 'Kumbuka kufanya mapitio ya calculus II (Fundamental continuity theorems) saa kumi jioni ya leo!',
    datetime: '2026-06-08 16:00',
    title: 'Study Alert',
    category: 'study',
    status: 'Pending'
  },
  {
    id: 'rem-2',
    type: 'reminder',
    channel: 'sms',
    phone: '+255 712 345 678',
    message: 'Msomi AI Homework Timer Trigger: Wasilisha kazi ya Database Normalizers kwenye portal.',
    datetime: '2026-06-12 23:59',
    title: 'Assignment Deadline Alert',
    category: 'assignment',
    status: 'Pending'
  }
];

const DEFAULT_DAILY_PLANS: DailyStudyPlan[] = [
  { id: 'dp-1', dayName: 'Jumatatu', timeSlot: '08:00 - 10:00', subject: 'CSC 204', activity: 'Kujifunza kugawa tables kuelekea 3NF normal form', completed: true },
  { id: 'dp-2', dayName: 'Jumanne', timeSlot: '14:00 - 16:00', subject: 'CSC 210', activity: 'Kukamilisha Kruskal\'s MST graph queries', completed: false },
  { id: 'dp-3', dayName: 'Alhamisi', timeSlot: '10:00 - 12:00', subject: 'MTH 102', activity: 'Kufanya mazoezi ya Taylor Power series', completed: false }
];

const DEFAULT_EXAMS: ExamCountdown[] = [
  { id: 'ex-1', subjectCode: 'CSC 204', subjectName: 'RDBMS Database Concepts', examDate: '2026-06-25', daysRemaining: 20 },
  { id: 'ex-2', subjectCode: 'MTH 102', subjectName: 'Calculus II Functions', examDate: '2026-07-02', daysRemaining: 27 }
];

type TabType = 'dashboard' | 'chat' | 'tracker' | 'groups' | 'timer' | 'tests' | 'incubator' | 'profile' | 'planner' | 'cv';

export default function App() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [projects, setProjects] = useState<InnovationProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<InnovationProject | null>(null);
  
  // Theme and Language states
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [lang, setLang] = useState<Language>('sw');

  const t = TRANSLATIONS[lang];
  const isDark = theme === "dark";
  
  // Custom new states
  const [courses, setCourses] = useState<CourseTrack[]>([]);
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [reminders, setReminders] = useState<AcademicReminder[]>([]);
  const [dailyPlans, setDailyPlans] = useState<DailyStudyPlan[]>([]);
  const [countdowns, setCountdowns] = useState<ExamCountdown[]>([]);

  // Tab navigation selection
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  
  // Loading state
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from LocalStorage on mount with default fallbacks
  useEffect(() => {
    try {
      const storedProfile = localStorage.getItem('msomi_profile');
      const storedMessages = localStorage.getItem('msomi_messages');
      const storedSessions = localStorage.getItem('msomi_sessions');
      const storedProjects = localStorage.getItem('msomi_innovations');
      const storedCourses = localStorage.getItem('msomi_courses');
      const storedGroups = localStorage.getItem('msomi_groups');

      const storedTheme = localStorage.getItem('msomi_theme') as 'light' | 'dark' | null;
      if (storedTheme) setTheme(storedTheme);

      const storedLang = localStorage.getItem('msomi_language') as Language | null;
      if (storedLang) setLang(storedLang);

      if (storedProfile) setProfile(JSON.parse(storedProfile));
      if (storedMessages) setMessages(JSON.parse(storedMessages));
      if (storedSessions) setSessions(JSON.parse(storedSessions));
      
      if (storedProjects) {
        const parsedProjList = JSON.parse(storedProjects);
        setProjects(parsedProjList);
        if (parsedProjList.length > 0) {
          setSelectedProject(parsedProjList[0]);
        }
      }

      // Initialize tracker list
      if (storedCourses) {
        setCourses(JSON.parse(storedCourses));
      } else {
        setCourses(DEFAULT_COURSES);
        localStorage.setItem('msomi_courses', JSON.stringify(DEFAULT_COURSES));
      }

      // Initialize groups
      if (storedGroups) {
        setGroups(JSON.parse(storedGroups));
      } else {
        setGroups(DEFAULT_GROUPS);
        localStorage.setItem('msomi_groups', JSON.stringify(DEFAULT_GROUPS));
      }

      // Initialize Reminders
      const storedReminders = localStorage.getItem('msomi_reminders');
      if (storedReminders) {
        setReminders(JSON.parse(storedReminders));
      } else {
        setReminders(DEFAULT_REMINIDERS);
        localStorage.setItem('msomi_reminders', JSON.stringify(DEFAULT_REMINIDERS));
      }

      // Initialize DailyPlans
      const storedDailyPlans = localStorage.getItem('msomi_daily_plans');
      if (storedDailyPlans) {
        setDailyPlans(JSON.parse(storedDailyPlans));
      } else {
        setDailyPlans(DEFAULT_DAILY_PLANS);
        localStorage.setItem('msomi_daily_plans', JSON.stringify(DEFAULT_DAILY_PLANS));
      }

      // Initialize Countdowns
      const storedCountdowns = localStorage.getItem('msomi_countdowns');
      if (storedCountdowns) {
        setCountdowns(JSON.parse(storedCountdowns));
      } else {
        setCountdowns(DEFAULT_EXAMS);
        localStorage.setItem('msomi_countdowns', JSON.stringify(DEFAULT_EXAMS));
      }

    } catch (e) {
      console.error("Local storage restoration failed:", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Sync state modifications to storage
  const handleSaveProfile = (newProfile: StudentProfile) => {
    setProfile(newProfile);
    localStorage.setItem('msomi_profile', JSON.stringify(newProfile));
  };

  const handleLoggedSession = (newSess: StudySession) => {
    const updatedSess = [newSess, ...sessions];
    setSessions(updatedSess);
    localStorage.setItem('msomi_sessions', JSON.stringify(updatedSess));
  };

  const handleAddProject = (newProj: InnovationProject) => {
    const updatedProjList = [newProj, ...projects];
    setProjects(updatedProjList);
    setSelectedProject(newProj);
    localStorage.setItem('msomi_innovations', JSON.stringify(updatedProjList));
  };

  const handleDeleteProject = (projId: string) => {
    const filtered = projects.filter(p => p.id !== projId);
    setProjects(filtered);
    localStorage.setItem('msomi_innovations', JSON.stringify(filtered));
    if (selectedProject?.id === projId) {
      setSelectedProject(filtered.length > 0 ? filtered[0] : null);
    }
  };

  const handleAddMessage = (newMsg: ChatMessage) => {
    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    localStorage.setItem('msomi_messages', JSON.stringify(updatedMessages));
  };

  const handleClearHistory = () => {
    setMessages([]);
    localStorage.removeItem('msomi_messages');
  };

  const handleUpdateCourses = (updated: CourseTrack[]) => {
    setCourses(updated);
    localStorage.setItem('msomi_courses', JSON.stringify(updated));
  };

  const handleUpdateGroups = (updated: StudyGroup[]) => {
    setGroups(updated);
    localStorage.setItem('msomi_groups', JSON.stringify(updated));
  };

  const handleUpdateReminders = (updated: AcademicReminder[]) => {
    setReminders(updated);
    localStorage.setItem('msomi_reminders', JSON.stringify(updated));
  };

  const handleUpdateDailyPlans = (updated: DailyStudyPlan[]) => {
    setDailyPlans(updated);
    localStorage.setItem('msomi_daily_plans', JSON.stringify(updated));
  };

  const handleUpdateCountdowns = (updated: ExamCountdown[]) => {
    setCountdowns(updated);
    localStorage.setItem('msomi_countdowns', JSON.stringify(updated));
  };

  const handleClearLocalStorage = () => {
    localStorage.clear();
    setProfile(null);
    setMessages([]);
    setSessions([]);
    setProjects([]);
    setSelectedProject(null);
    setCourses(DEFAULT_COURSES);
    setGroups(DEFAULT_GROUPS);
    setReminders(DEFAULT_REMINIDERS);
    setDailyPlans(DEFAULT_DAILY_PLANS);
    setCountdowns(DEFAULT_EXAMS);
    setActiveTab('dashboard');
  };

  // Aggregated study parameters
  const getTotalStudyMinutes = () => {
    return sessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  };

  const getSyllabusAggregatedPercent = () => {
    let totalTopics = 0;
    let completedTopics = 0;
    courses.forEach(c => {
      totalTopics += c.topics.length;
      completedTopics += c.topics.filter(t => t.status === 'Complete').length;
    });
    return totalTopics === 0 ? 0 : Math.round((completedTopics / totalTopics) * 100);
  };

  const getJoinedGroupsCount = () => {
    return groups.filter(g => g.isJoined).length;
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#FCFAF7] flex flex-col items-center justify-center text-[#1A1A1A] font-mono text-xs">
        <Zap className="h-6 w-6 text-[#C15B32] animate-spin mb-3" />
        MSOMI AI core initializing...
      </div>
    );
  }

  const handleAuthSuccess = (userProfile: StudentProfile) => {
    setProfile(userProfile);
    localStorage.setItem('msomi_profile', JSON.stringify(userProfile));
    if (userProfile.preferredLanguage === 'Kiswahili') {
      setLang('sw');
      localStorage.setItem('msomi_language', 'sw');
    } else {
      setLang('en');
      localStorage.setItem('msomi_language', 'en');
    }
  };

  const handleLanguageToggle = (selectedLang: Language) => {
    setLang(selectedLang);
    localStorage.setItem('msomi_language', selectedLang);
  };

  // Redirect to adaptive verification lock if not logged in
  if (!profile || !localStorage.getItem('msomi_current_user_session')) {
    return (
      <LoginAuth 
        onAuthSuccess={handleAuthSuccess} 
        lang={lang} 
        onLanguageToggle={handleLanguageToggle}
        theme={theme}
      />
    );
  }

  return (
    <div id="app-root" className={`min-h-screen flex flex-col font-sans transition-colors duration-200 selection:bg-[#C15B32] selection:text-white ${
      isDark ? 'bg-[#121212] text-zinc-100' : 'bg-[#FCFAF7] text-[#1A1A1A]'
    }`}>
      
      {/* Top Professional Accent Bar */}
      <header className={`border-b sticky top-0 z-40 px-6 py-4 flex items-center justify-between shadow-sm transition-colors ${
        isDark ? 'bg-[#1A1A1A] border-white/10' : 'bg-white border-black/5'
      }`}>
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#C15B32] text-white rounded-none shadow-sm">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <h1 className="font-serif text-2xl italic font-light tracking-tight text-[#C15B32] flex items-center gap-1.5">
              Msomi <span className="text-[10px] uppercase tracking-[0.2em] font-sans font-bold text-white bg-[#C15B32] px-2 py-0.5 rounded-sm">AI</span>
            </h1>
            <span className={`text-[10px] tracking-wider uppercase font-mono mt-0.5 ${isDark ? 'text-zinc-500' : 'text-black/40'}`}>
              {t.tagline}
            </span>
          </div>
        </div>

        {/* Quick horizontal student specs */}
        <div className={`hidden md:flex items-center gap-5 text-xs ${isDark ? 'text-zinc-300' : 'text-black/60'}`}>
          <div className="flex items-center gap-1">
            <User className="h-3.5 w-3.5 text-[#C15B32]" />
            <span className={`font-semibold max-w-[124px] truncate ${isDark ? 'text-[#FCFAF7]' : 'text-[#1A1A1A]'}`} title={profile.name}>{profile.name}</span>
          </div>
          <div className={`h-4 w-px ${isDark ? 'bg-white/10' : 'bg-black/5'}`} />
          <div className="flex items-center gap-1 leading-none">
            <BookOpen className="h-3.5 w-3.5 text-zinc-400" />
            <span className={`max-w-[150px] truncate ${isDark ? 'text-zinc-300' : 'text-black/85'}`} title={profile.course}>{profile.course}</span> 
            <span className={`text-[10px] font-serif italic ${isDark ? 'text-zinc-500' : 'text-black/40'}`}>(Yr {profile.year})</span>
          </div>
          <div className={`h-4 w-px ${isDark ? 'bg-white/10' : 'bg-black/5'}`} />
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-sm border text-[10px] font-mono ${
            isDark ? 'bg-neutral-800 border-white/10 text-zinc-200' : 'bg-[#F2EFE9] border-black/5 text-black'
          }`}>
            <Star className="h-3 w-3 text-[#C15B32] fill-current" />
            Calibrated Rank: <span className="font-bold">{profile.difficultyLevel}/5</span>
          </div>
        </div>

        {/* Custom icon shortcuts & Quick Actions inside Header */}
        <div className="flex items-center gap-2">
          {/* Theme Switcher Button */}
          <button
            onClick={() => {
              const nextTheme = theme === 'light' ? 'dark' : 'light';
              setTheme(nextTheme);
              localStorage.setItem('msomi_theme', nextTheme);
            }}
            className={`p-1.5 rounded-sm border transition-all cursor-pointer ${
              isDark 
                ? 'bg-[#1A1A1A] border-white/10 text-white hover:bg-[#2b2b2b]' 
                : 'bg-[#F2EFE9] border-black/5 text-black hover:bg-neutral-200'
            }`}
            title="Sura ya Giza / Mwanga"
          >
            {isDark ? '☀️' : '🌙'}
          </button>

          {/* Quick Language Toggle */}
          <button
            onClick={() => handleLanguageToggle(lang === 'en' ? 'sw' : 'en')}
            className={`px-2 py-1 text-[10px] font-mono font-bold rounded-sm border transition-all cursor-pointer ${
              isDark 
                ? 'bg-[#1A1A1A] border-white/10 text-white hover:bg-[#2b2b2b]' 
                : 'bg-[#F2EFE9] border-black/5 text-black hover:bg-neutral-200'
            }`}
            title="CHAGUA LUGHA"
          >
            🌐 {lang === 'en' ? 'SW' : 'EN'}
          </button>

          {/* Calibrate Profile shortcut */}
          <button
            onClick={() => setActiveTab('profile')}
            className={`p-1.5 rounded-sm border transition-all cursor-pointer ${
              activeTab === 'profile' 
                ? 'bg-[#C15B32]/10 border-[#C15B32] text-[#C15B32]' 
                : `${isDark ? 'bg-[#1A1A1A] border-white/10 text-zinc-400 hover:bg-[#2b2b2b]' : 'bg-[#F2EFE9] border-black/5 text-black/50 hover:bg-neutral-200'}`
            }`}
            title="Configure DNA Profile"
          >
            <User className="h-4 w-4" />
          </button>

          {/* Log Out Session Button */}
          <button
            onClick={() => {
              localStorage.removeItem('msomi_current_user_session');
              setProfile(null);
            }}
            className="px-2 py-1 text-[10px] font-mono font-bold text-red-500 border border-red-500/20 rounded-sm hover:bg-red-500/5 cursor-pointer"
            title="Sign Out / Ondoka"
          >
            {lang === 'sw' ? 'ONDOKA' : 'LOGOUT'}
          </button>
        </div>
      </header>

      {/* Main Interactive Workspace Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* Navigation Sidebar Drawer */}
        <nav className={`md:col-span-3 lg:col-span-2 border rounded-sm p-3.5 shadow-sm flex md:flex-col gap-1.5 overflow-x-auto md:overflow-x-visible transition-colors ${
          isDark ? 'bg-[#1e1e1e] border-white/10' : 'bg-[#F2EFE9] border-black/5'
        }`}>
          
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full text-left flex items-center gap-2.5 px-3.5 py-2.5 rounded-sm text-xs font-semibold shrink-0 transition-colors uppercase tracking-wider cursor-pointer ${
              activeTab === 'dashboard' 
                ? 'bg-[#C15B32] text-white font-bold shadow-sm' 
                : `${isDark ? 'text-zinc-300 hover:bg-neutral-800' : 'text-black/65 hover:bg-[#EAE4DD] hover:text-black'}`
            }`}
          >
            <BookMarked className="h-4 w-4 shrink-0" />
            <span>{t.overview_home}</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`w-full text-left flex items-center gap-2.5 px-3.5 py-2.5 rounded-sm text-xs font-semibold shrink-0 transition-colors uppercase tracking-wider cursor-pointer ${
              activeTab === 'chat' 
                ? 'bg-[#C15B32] text-white font-bold shadow-sm' 
                : `${isDark ? 'text-zinc-300 hover:bg-neutral-800' : 'text-black/65 hover:bg-[#EAE4DD] hover:text-black'}`
            }`}
          >
            <MessageSquare className="h-4 w-4 shrink-0" />
            <span>{t.mentor_hub}</span>
          </button>

          <button
            onClick={() => setActiveTab('tracker')}
            className={`w-full text-left flex items-center gap-2.5 px-3.5 py-2.5 rounded-sm text-xs font-semibold shrink-0 transition-colors uppercase tracking-wider cursor-pointer ${
              activeTab === 'tracker' 
                ? 'bg-[#C15B32] text-white font-bold shadow-sm' 
                : `${isDark ? 'text-zinc-300 hover:bg-neutral-800' : 'text-black/65 hover:bg-[#EAE4DD] hover:text-black'}`
            }`}
          >
            <TrendingUp className="h-4 w-4 shrink-0" />
            <span>{t.syllabus_tracker}</span>
          </button>

          <button
            onClick={() => setActiveTab('groups')}
            className={`w-full text-left flex items-center gap-2.5 px-3.5 py-2.5 rounded-sm text-xs font-semibold shrink-0 transition-colors uppercase tracking-wider cursor-pointer ${
              activeTab === 'groups' 
                ? 'bg-[#C15B32] text-white font-bold shadow-sm' 
                : `${isDark ? 'text-zinc-300 hover:bg-neutral-800' : 'text-black/65 hover:bg-[#EAE4DD] hover:text-black'}`
            }`}
          >
            <Users className="h-4 w-4 shrink-0" />
            <span>{t.study_groups}</span>
          </button>

          <button
            onClick={() => setActiveTab('timer')}
            className={`w-full text-left flex items-center gap-2.5 px-3.5 py-2.5 rounded-sm text-xs font-semibold shrink-0 transition-colors uppercase tracking-wider cursor-pointer ${
              activeTab === 'timer' 
                ? 'bg-[#C15B32] text-white font-bold shadow-sm' 
                : `${isDark ? 'text-zinc-300 hover:bg-neutral-800' : 'text-black/65 hover:bg-[#EAE4DD] hover:text-black'}`
            }`}
          >
            <Clock className="h-4 w-4 shrink-0" />
            <span>{t.saa_msomi}</span>
          </button>

          <button
            onClick={() => setActiveTab('tests')}
            className={`w-full text-left flex items-center gap-2.5 px-3.5 py-2.5 rounded-sm text-xs font-semibold shrink-0 transition-colors uppercase tracking-wider cursor-pointer ${
              activeTab === 'tests' 
                ? 'bg-[#C15B32] text-white font-bold shadow-sm' 
                : `${isDark ? 'text-zinc-300 hover:bg-neutral-800' : 'text-black/65 hover:bg-[#EAE4DD] hover:text-black'}`
            }`}
          >
            <BookOpen className="h-4 w-4 shrink-0" />
            <span>{t.mazoezi_drills}</span>
          </button>

          <button
            onClick={() => setActiveTab('incubator')}
            className={`w-full text-left flex items-center gap-2.5 px-3.5 py-2.5 rounded-sm text-xs font-semibold shrink-0 transition-colors uppercase tracking-wider cursor-pointer ${
              activeTab === 'incubator' 
                ? 'bg-[#C15B32] text-white font-bold shadow-sm' 
                : `${isDark ? 'text-zinc-300 hover:bg-neutral-800' : 'text-black/65 hover:bg-[#EAE4DD] hover:text-black'}`
            }`}
          >
            <Lightbulb className="h-4 w-4 shrink-0" />
            <span>{t.innovation_lab}</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full text-left flex items-center gap-2.5 px-3.5 py-2.5 rounded-sm text-xs font-semibold shrink-0 transition-colors uppercase tracking-wider cursor-pointer ${
              activeTab === 'profile' 
                ? 'bg-[#C15B32] text-white font-bold shadow-sm' 
                : `${isDark ? 'text-zinc-300 hover:bg-neutral-800' : 'text-black/65 hover:bg-[#EAE4DD] hover:text-black'}`
            }`}
          >
            <User className="h-4 w-4 shrink-0" />
            <span>{t.calibrate_dna}</span>
          </button>

          <button
            onClick={() => setActiveTab('planner')}
            className={`w-full text-left flex items-center justify-between px-3.5 py-2.5 rounded-sm text-xs font-semibold shrink-0 transition-colors uppercase tracking-wider cursor-pointer ${
              activeTab === 'planner' 
                ? 'bg-[#C15B32] text-white font-bold shadow-sm' 
                : `${isDark ? 'text-zinc-300 hover:bg-neutral-800/50' : 'text-[#C15B32] bg-[#C15B32]/5 hover:bg-[#EAE4DD]'}`
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Calendar className="h-4 w-4 shrink-0" />
              <span>{t.smart_planner}</span>
            </div>
            <span className="text-[8px] bg-[#C15B32] text-white font-mono px-1 rounded">SMS</span>
          </button>

          <button
            onClick={() => setActiveTab('cv')}
            className={`w-full text-left flex items-center justify-between px-3.5 py-2.5 rounded-sm text-xs font-semibold shrink-0 transition-colors uppercase tracking-wider cursor-pointer ${
              activeTab === 'cv' 
                ? 'bg-[#C15B32] text-white font-bold shadow-sm' 
                : `${isDark ? 'text-zinc-300 hover:bg-neutral-850' : 'text-black/65 hover:bg-[#EAE4DD] hover:text-black'}`
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FileText className="h-4 w-4 shrink-0" />
              <span>{t.andika_cv}</span>
            </div>
            <span className="text-[8px] border border-[#C15B32] text-[#C15B32] font-mono px-1 rounded">NEW</span>
          </button>

        </nav>

        {/* Content Panel Area */}
        <main className="col-span-1 md:col-span-9 lg:col-span-10">
          
          {/* Quick campus reminder line */}
          <div className={`mb-4 border rounded-sm py-2.5 px-3.5 text-[11px] flex items-center justify-between shadow-sm transition-colors ${
            isDark ? 'bg-[#1e1e1e] border-white/10 text-zinc-300' : 'bg-white border-black/5 text-[#1A1A1A]/70'
          }`}>
            <span className="flex items-center gap-1.5 justify-center leading-none">
              <Sparkles className="h-3.5 w-3.5 text-[#C15B32] animate-pulse shrink-0" />
              <span>{t.active_session_sync} <strong>{profile.university}</strong>.</span>
            </span>
            <span className={`hidden sm:inline font-mono text-[9px] uppercase tracking-wider ${isDark ? 'text-zinc-500' : 'text-[#1A1A1A]/40'}`}>
              {profile.learningStyle} {t.calibrated_learning_style}
            </span>
          </div>

          <div id="content-container">
            {activeTab === 'dashboard' && (
              <div id="overview-dashboard" className="space-y-6 animate-fade-in">
                
                {/* Visual Executive Portal Header */}
                <div className="p-6 bg-white border border-black/5 rounded-sm shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h2 className="text-xl font-serif italic font-bold">Dawati Kuu la Msomi (Overview Dashboard)</h2>
                    <p className="text-xs text-black/55 mt-1">
                      Welcome back, {profile.name}! Track syllabus progress, coordinate classmate discussions, and practice.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-[#F5F2ED] px-3.5 py-1.5 rounded-sm border border-black/5 text-[10px] font-mono leading-none">
                    <Star className="h-3.5 w-3.5 text-[#C15B32] fill-current" />
                    GPA Target Level: <span className="font-bold">{profile.difficultyLevel}.0 / 5.0</span>
                  </div>
                </div>

                {/* Core Analytics Bento */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Card 1: Study Mins on clock */}
                  <div className="bg-[#1A1A1A] text-white p-5 rounded-sm shadow-sm flex flex-col justify-between min-h-[140px]">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-mono text-[#C15B32] font-semibold tracking-wider uppercase">Saa ya Msomi Completed</span>
                      <Clock className="h-4 w-4 text-[#C15B32]" />
                    </div>
                    <div className="my-2">
                      <h4 className="text-2xl font-serif font-bold font-mono">{getTotalStudyMinutes()} Mins</h4>
                      <p className="text-[10px] text-white/55 mt-0.5">Total registered continuous focus logged</p>
                    </div>
                    <button 
                      onClick={() => setActiveTab('timer')}
                      className="text-[10px] text-[#C15B32] hover:underline font-mono uppercase tracking-wider text-left font-bold flex items-center gap-0.5"
                    >
                      Start Focus Period <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Card 2: Syllabus Aggregate progress */}
                  <div className="bg-white border border-black/5 p-5 rounded-sm shadow-sm flex flex-col justify-between min-h-[140px]">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-mono text-[#C15B32] font-semibold tracking-wider uppercase">Aggregated Syllabus Progress</span>
                      <TrendingUp className="h-4 w-4 text-black/40" />
                    </div>
                    <div className="my-2">
                      <h4 className="text-2xl font-serif font-bold text-black font-mono">{getSyllabusAggregatedPercent()}%</h4>
                      <div className="w-full bg-black/5 h-1.5 rounded-full overflow-hidden mt-1.5">
                        <div 
                          className="bg-[#C15B32] h-full rounded-full transition-all duration-500"
                          style={{ width: `${getSyllabusAggregatedPercent()}%` }}
                        />
                      </div>
                    </div>
                    <button 
                      onClick={() => setActiveTab('tracker')}
                      className="text-[10px] text-[#C15B32] hover:underline font-mono uppercase tracking-wider text-left font-bold flex items-center gap-0.5"
                    >
                      Inspect Courses Track <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Card 3: Groups joined state */}
                  <div className="bg-[#F5F2ED] border border-black/5 p-5 rounded-sm shadow-sm flex flex-col justify-between min-h-[140px]">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-mono text-black/50 font-semibold tracking-wider uppercase">Active Seminar cohorts</span>
                      <Users className="h-4 w-4 text-[#C15B32]" />
                    </div>
                    <div className="my-2">
                      <h4 className="text-2xl font-serif font-bold text-black font-mono">{getJoinedGroupsCount()} Groups</h4>
                      <p className="text-[10px] text-black/55 mt-0.5">Joined study cohorts sharing nodes information</p>
                    </div>
                    <button 
                      onClick={() => setActiveTab('groups')}
                      className="text-[10px] text-[#C15B32] hover:underline font-mono uppercase tracking-wider text-left font-bold flex items-center gap-0.5"
                    >
                      Join New Seminars <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>

                </div>

                {/* Dashboard layout secondary column splits */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Left block - Course overview and active alarms */}
                  <div className="lg:col-span-7 space-y-6">
                    
                    {/* Course syllabus progress card */}
                    <div className="bg-white p-5 border border-black/5 rounded-sm shadow-sm space-y-4">
                      <div className="flex justify-between items-center border-b border-black/5 pb-2">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-black font-mono">Maendeleo ya Kozi (My Syllabi Status)</h3>
                        <button 
                          onClick={() => setActiveTab('tracker')}
                          className="text-[10px] font-bold text-[#C15B32] uppercase hover:underline font-mono"
                        >
                          View Tracker
                        </button>
                      </div>

                      <div className="space-y-3">
                        {courses.slice(0, 3).map(course => {
                          const total = course.topics.length;
                          const complete = course.topics.filter(t => t.status === 'Complete').length;
                          const percent = total === 0 ? 0 : Math.round((complete / total) * 100);
                          return (
                            <div key={course.id} className="p-3 bg-[#FCFAF7] border border-black/5 rounded-sm flex items-center justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono text-[9px] font-bold text-[#C15B32]">{course.code}</span>
                                  <h4 className="text-xs font-bold text-black font-sans truncate">{course.name}</h4>
                                </div>
                                <p className="text-[10px] text-black/50 mt-0.5">
                                  {complete} of {total} modules reached mastery level
                                </p>
                              </div>

                              <span className="text-[10px] font-semibold text-black/75 bg-black/5 px-2 py-0.5 rounded-sm shrink-0 font-mono">
                                {percent}% Cover
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Integrated countdown alarms card */}
                    <div className="bg-white p-5 border border-black/5 rounded-sm shadow-sm space-y-4">
                      <div className="flex justify-between items-center border-b border-black/5 pb-2">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-black font-mono">Kikokotoo cha Mitihani (Alarms & Countdowns)</h3>
                        <button 
                          onClick={() => setActiveTab('planner')}
                          className="text-[10px] font-bold text-[#C15B32] uppercase hover:underline font-mono"
                        >
                          Fungua Planner
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {countdowns.length === 0 ? (
                          <div className="col-span-2 text-xs text-black/40 italic py-2">Hakuna mitihani iliyosajiliwa bado.</div>
                        ) : (
                          countdowns.slice(0, 4).map(cd => (
                            <div key={cd.id} className="p-3 bg-[#FCFAF7] border border-black/5 rounded-sm flex justify-between items-center gap-2">
                              <div className="min-w-0">
                                <span className="text-[9px] text-[#C15B32] font-mono font-bold tracking-wider">{cd.subjectCode}</span>
                                <h4 className="text-xs font-bold text-[#1A1A1A] truncate">{cd.subjectName}</h4>
                                <span className="text-[9px] text-black/40 font-mono block mt-0.5">{cd.examDate}</span>
                              </div>
                              <div className="bg-black text-white px-2 py-1 text-[10px] rounded font-mono font-bold shrink-0">
                                {cd.daysRemaining}d Left
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                  </div>

                  {/* Right block - Study Advice and Quick navigation actions */}
                  <div className="lg:col-span-5 space-y-4">
                    
                    {/* Advice block */}
                    <div className="bg-[#F5F2ED] p-5 border border-black/5 rounded-sm shadow-sm space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-black font-mono flex items-center gap-1.5">
                        <Sparkles className="h-4 w-4 text-[#C15B32]" /> Dondoo ya Muhula (Daily Tip)
                      </h3>
                      <p className="text-xs text-black/75 leading-relaxed font-sans">
                        &quot;Kujadili Masomo na wasomi wenzako kwenye <strong>Study Groups</strong> kunaongeza uelewa kwa 45% kuliko kusoma peke yako. Shiriki notes dondoo, andika maswali na ujenge nyanja ya uelewa hapa chuo!&quot;
                      </p>
                      <div className="pt-2 border-t border-black/5 flex items-center justify-between text-[10px] text-black/40 font-mono">
                        <span>Lugha: English & Kiswahili</span>
                        <span>Msomi AI Calibration</span>
                      </div>
                    </div>

                    {/* Quick navigation actions buttons list */}
                    <div className="bg-white p-5 border border-black/5 rounded-sm shadow-sm space-y-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-black font-mono pb-2 border-b border-black/5">Quick Actions</h3>
                      <button 
                        onClick={() => setActiveTab('chat')}
                        className="w-full text-left p-2.5 hover:bg-[#F5F2ED] rounded-sm text-xs flex justify-between items-center text-black/75 transition-all cursor-pointer font-medium"
                      >
                        🧠 Ask Msomi AI Tutor Engine <ChevronRight className="h-4 w-4 text-[#C15B32]" />
                      </button>
                      <button 
                        onClick={() => setActiveTab('tests')}
                        className="w-full text-left p-2.5 hover:bg-[#F5F2ED] rounded-sm text-xs flex justify-between items-center text-black/75 transition-all cursor-pointer font-medium"
                      >
                        📝 Start Practice MCQ Exam Drill <ChevronRight className="h-4 w-4 text-[#C15B32]" />
                      </button>
                      <button 
                        onClick={() => setActiveTab('incubator')}
                        className="w-full text-left p-2.5 hover:bg-[#F5F2ED] rounded-sm text-xs flex justify-between items-center text-black/75 transition-all cursor-pointer font-medium"
                      >
                        🔬 Map Innovation pitching blueprint <ChevronRight className="h-4 w-4 text-[#C15B32]" />
                      </button>
                    </div>

                  </div>

                </div>

              </div>
            )}

            {activeTab === 'chat' && (
              <ChatWorkspace 
                profile={profile}
                messages={messages}
                onAddMessage={handleAddMessage}
                onClearHistory={handleClearHistory}
              />
            )}

            {activeTab === 'tracker' && (
              <SyllabusTracker 
                courses={courses}
                onUpdateCourses={handleUpdateCourses}
              />
            )}

            {activeTab === 'groups' && (
              <StudyGroups 
                profile={profile}
                groups={groups}
                onUpdateGroups={handleUpdateGroups}
              />
            )}

            {activeTab === 'timer' && (
              <StudyTimer 
                onSessionLog={handleLoggedSession}
                recentSessions={sessions}
              />
            )}

            {activeTab === 'tests' && (
              <MockTests 
                course={profile.course}
                difficultyLevel={profile.difficultyLevel}
              />
            )}

            {activeTab === 'incubator' && (
              <InnovationLab 
                projects={projects}
                onAddProject={handleAddProject}
                onDeleteProject={handleDeleteProject}
                onSelectProject={setSelectedProject}
                selectedProject={selectedProject}
              />
            )}

            {activeTab === 'profile' && (
              <ProfileView 
                profile={profile}
                onUpdateProfile={handleSaveProfile}
                recentSessions={sessions}
                projects={projects}
                onClearData={handleClearLocalStorage}
              />
            )}

            {activeTab === 'planner' && (
              <SmartPlanner
                profile={profile}
                reminders={reminders}
                onUpdateReminders={handleUpdateReminders}
                dailyPlans={dailyPlans}
                onUpdateDailyPlans={handleUpdateDailyPlans}
                countdowns={countdowns}
                onUpdateCountdowns={handleUpdateCountdowns}
                lang={lang}
                theme={theme}
              />
            )}

            {activeTab === 'cv' && (
              <CVBuilder
                profile={profile}
                innovationProjects={projects}
              />
            )}
          </div>
        </main>

      </div>

      {/* Exquisite Footer */}
      <footer className={`mt-auto py-10 transition-colors border-t text-center text-[11px] font-sans px-4 ${
        isDark ? 'bg-[#1A1A1A] border-white/10 text-zinc-400' : 'bg-[#F2EFE9] border-black/5 text-black/60'
      }`}>
        <p className="max-w-xl mx-auto leading-relaxed">
          <strong>Swahili & English Academic Advisor (Msomi AI)</strong> — Developed meticulously with deep customization for active university integration, facilitating real-world smart planning & scheduling.
        </p>
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3 text-[10px] uppercase tracking-widest font-mono">
          <span className="px-2.5 py-1 rounded bg-[#C15B32]/10 text-[#C15B32] font-semibold border border-[#C15B32]/20">
            POWERED BY DEV TEK INNOVATION
          </span>
          <span className={`${isDark ? 'text-zinc-500' : 'text-black/30'} hidden sm:inline`}>|</span>
          <span className={`${isDark ? 'text-zinc-300' : 'text-black/70'} font-bold`}>
            FOUNDER & CREATED BY: DAVID FREDRICK MDIKULA
          </span>
        </div>
        <p className={`text-[9px] mt-4 uppercase tracking-wider font-mono ${isDark ? 'text-zinc-600' : 'text-black/30'}`}>
          © 2026 MSOMI AI ACADEMIC SYSTEM. ALL RIGHTS RESERVED.
        </p>
      </footer>

    </div>
  );
}
