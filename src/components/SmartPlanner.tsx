import React, { useState, useEffect } from 'react';
import { AcademicReminder, DailyStudyPlan, ExamCountdown, StudentProfile } from '../types';
import { Clock, Send, Plus, CheckCircle2, AlertTriangle, MessageSquare, Shield, Smile, Trash2, Zap, Sparkles, Bell, Calendar, Smartphone, FileCode } from 'lucide-react';
import { TRANSLATIONS, Language } from '../utils/languages';

interface SmartPlannerProps {
  profile: StudentProfile;
  reminders: AcademicReminder[];
  onUpdateReminders: (updated: AcademicReminder[]) => void;
  dailyPlans: DailyStudyPlan[];
  onUpdateDailyPlans: (updated: DailyStudyPlan[]) => void;
  countdowns: ExamCountdown[];
  onUpdateCountdowns: (updated: ExamCountdown[]) => void;
  lang?: Language;
  theme?: 'light' | 'dark';
}

export default function SmartPlanner({
  profile,
  reminders,
  onUpdateReminders,
  dailyPlans,
  onUpdateDailyPlans,
  countdowns,
  onUpdateCountdowns,
  lang = 'sw',
  theme = 'light'
}: SmartPlannerProps) {
  const t = TRANSLATIONS[lang];
  const isDark = theme === 'dark';

  // Reminder inputs
  const [phone, setPhone] = useState(profile.phone || '+255 712 345 678');
  const [email, setEmail] = useState(profile.email || '');
  const [triggerEmail, setTriggerEmail] = useState(true);
  const [liveMode, setLiveMode] = useState(true);
  const [isSendingMsg, setIsSendingMsg] = useState(false);
  const [apiLog, setApiLog] = useState<string>('');
  const [channel, setChannel] = useState<'sms' | 'whatsapp'>('whatsapp');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<'study' | 'assignment' | 'exam' | 'learning_plan'>('study');
  const [date, setDate] = useState('2026-06-10');
  const [time, setTime] = useState('14:00');

  // Daily plan inputs
  const [newDay, setNewDay] = useState('Jumatatu');
  const [newSlot, setNewSlot] = useState('08:00 - 10:00');
  const [newSub, setNewSub] = useState(profile.course || 'Maths');
  const [newAct, setNewAct] = useState('Kupitia madondoo na kufanya practice quiz');

  // Exam inputs
  const [examCode, setExamCode] = useState('CSC 204');
  const [examName, setExamName] = useState('RDBMS Database Theory Exam');
  const [examDateStr, setExamDateStr] = useState('2026-06-25');

  // Validation feedback alerts
  const [validationError, setValidationError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Computed JSON of last added reminder
  const [recentOutputJson, setRecentOutputJson] = useState<string>('');

  // Auto clean notifications
  useEffect(() => {
    if (successMsg) {
      const t = setTimeout(() => setSuccessMsg(null), 4000);
      return () => clearTimeout(t);
    }
  }, [successMsg]);

  // Handle scheduling structured reminders
  const handleScheduleReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setApiLog('');

    // Strict requirements verification
    if (!phone.replace(/[\s+-]/g, '').trim()) {
      setValidationError("Namba ya simu inahitajika kabla ya kurusha SMS/WhatsApp! (Phone number is missing)");
      return;
    }

    if (!message.trim()) {
      setValidationError("Tafadhali andika ujumbe wako wa dondoo/reminders.");
      return;
    }

    if (!date || !time) {
      setValidationError("Muda au tarehe ya tukio haijakamilika vizuri. Tafadhali thibitisha.");
      return;
    }

    const fullDateTime = `${date} ${time}`;
    setIsSendingMsg(true);

    try {
      const response = await fetch('/api/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phone: phone.trim(),
          email: email.trim(),
          triggerEmail: triggerEmail,
          channel: channel,
          message: message.trim(),
          datetime: fullDateTime,
          isLiveMode: liveMode
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Server transmission failed');
      }

      const activeLogs = result.logs || `Success: Message queued/sent in ${liveMode ? 'PRODUCTION' : 'SIMULATION'} mode.`;
      setApiLog(activeLogs);

      const newRem: AcademicReminder = {
        id: 'rem-' + Math.random().toString(36).substr(2, 9),
        type: 'reminder',
        channel: channel,
        phone: phone.trim(),
        message: message.trim(),
        datetime: fullDateTime,
        title: `${category.toUpperCase().replace('_', ' ')} Alert`,
        category: category,
        status: liveMode ? 'Sent' : 'Pending'
      };

      // Format output JSON specifically for system integration
      const integrationJSON = JSON.stringify({
        type: "reminder",
        channel: channel,
        phone: phone.trim(),
        email: email.trim(),
        triggerEmail: triggerEmail,
        message: message.trim(),
        datetime: fullDateTime,
        liveExecution: liveMode,
        serverLogs: activeLogs
      }, null, 2);

      setRecentOutputJson(integrationJSON);
      onUpdateReminders([newRem, ...reminders]);
      
      const successLanguagePrompt = lang === 'sw' 
        ? `Ujumbe wa kikumbusho umerushwa vyema! Mfumo wa DEV TEK umeratibu utumaji kwa mafanikio.`
        : `Reminder message dispatched with high success! Checked, logged, and synchronized on backend.`;
      setSuccessMsg(successLanguagePrompt);
      setMessage('');
    } catch (err: any) {
      setValidationError(err.message || 'Failure connecting to system API routes.');
    } finally {
      setIsSendingMsg(false);
    }
  };

  // Add Day Plan
  const handleAddDailyPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSub.trim() || !newAct.trim()) return;

    const newPlan: DailyStudyPlan = {
      id: 'plan-' + Math.random().toString(36).substr(2, 9),
      dayName: newDay,
      timeSlot: newSlot,
      subject: newSub.trim(),
      activity: newAct.trim(),
      completed: false
    };

    onUpdateDailyPlans([...dailyPlans, newPlan]);
    setNewAct('');
    setSuccessMsg("Mpango wa siku umeongezeka!");
  };

  const toggleDailyPlanComplete = (id: string) => {
    const updated = dailyPlans.map(p => {
      if (p.id !== id) return p;
      return { ...p, completed: !p.completed };
    });
    onUpdateDailyPlans(updated);
  };

  const handleDeletePlan = (id: string) => {
    onUpdateDailyPlans(dailyPlans.filter(p => p.id !== id));
  };

  // Add Exam countdown
  const handleAddExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examCode.trim() || !examName.trim() || !examDateStr) return;

    // Calculate days remaining simple logic
    const today = new Date();
    const exDate = new Date(examDateStr);
    const diffTime = exDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const newEx: ExamCountdown = {
      id: 'ex-' + Math.random().toString(36).substr(2, 9),
      subjectCode: examCode.toUpperCase().trim(),
      subjectName: examName.trim(),
      examDate: examDateStr,
      daysRemaining: diffDays > 0 ? diffDays : 0
    };

    onUpdateCountdowns([newEx, ...countdowns]);
    setExamCode('');
    setExamName('');
    setSuccessMsg("Mtihani na kengele ya countdown imesajiliwa!");
  };

  const handleDeleteCountdown = (id: string) => {
    onUpdateCountdowns(countdowns.filter(c => c.id !== id));
  };

  return (
    <div id="smart-study-planner-workspace" className="space-y-6">
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-lg border shadow-sm transition-colors ${
        isDark ? 'bg-[#1e1e1e] border-white/10' : 'bg-white border-black/5'
      }`}>
        <div>
          <h2 className={`text-lg font-serif italic font-bold ${isDark ? 'text-white' : 'text-[#1A1A1A]'}`}>
            {lang === 'sw' ? 'Mratibu Mahiri & Kikumbusho cha Ujumbe' : 'Smart Study Planner & Comm Reminders'}
          </h2>
          <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-black/55'}`}>
            {lang === 'sw' 
              ? 'Sanidi arifa za miamala ya SMS/WhatsApp, kengele ya countdown ya mitihani, na ratiba za masomo.' 
              : 'Configure system-level SMS/WhatsApp API notifications, countdown alert tags, and interactive study timetables.'}
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-[#C15B32]/10 px-3.5 py-1.5 rounded-sm border border-[#C15B32]/20 text-[10px] font-mono leading-none font-bold text-[#C15B32]">
          <Smartphone className="h-4 w-4" /> SMS/EMAIL API READY
        </div>
      </div>

      {/* Validation banners */}
      {validationError && (
        <div className="p-4 bg-amber-500/10 border-l-4 border-amber-500 rounded-sm text-xs text-amber-500 flex items-start gap-2.5">
          <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
          <div>
            <span className="font-bold">{lang === 'sw' ? 'Hitilafu ya Uthibitishaji:' : 'Validation Error:'} </span> {validationError}
          </div>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border-l-4 border-emerald-500 rounded-sm text-xs text-emerald-400 flex items-start gap-2.5">
          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
          <div>
            <span className="font-bold">{lang === 'sw' ? 'Kazi Imekamilika:' : 'Success Done:'} </span> {successMsg}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Module 1: Communication and Reminder SMS/WhatsApp Trigger */}
        <div className="lg:col-span-4 space-y-4">
          <div className={`border p-4 rounded-sm space-y-4 shadow-sm transition-colors ${
            isDark ? 'bg-[#1e1e1e] border-white/10' : 'bg-[#F2EFE9] border-black/5'
          }`}>
            <h3 className={`text-[10px] font-mono uppercase font-bold tracking-widest flex items-center gap-1 ${
              isDark ? 'text-zinc-400' : 'text-black/50'
            }`}>
              <Bell className="h-3.5 w-3.5 text-[#C15B32]" /> {lang === 'sw' ? 'UTUMAJI WA MAWASILIANO' : 'Comm System Trigger'}
            </h3>

            <form onSubmit={handleScheduleReminder} className="space-y-3.5 text-xs">
              
              {/* Simulator vs Production Switcher */}
              <div className="space-y-1">
                <label className={`font-semibold ${isDark ? 'text-zinc-300' : 'text-black/75'}`}>
                  {lang === 'sw' ? 'Hali ya Mfumo (Mode)' : 'Execution Context'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setLiveMode(false)}
                    className={`p-2 font-bold font-mono text-[10px] rounded-sm transition-all text-center uppercase tracking-wide cursor-pointer ${
                      !liveMode ? 'bg-amber-600 text-white' : `${isDark ? 'bg-zinc-800 text-zinc-400 border border-white/5' : 'bg-white border border-black/10 text-black/60'}`
                    }`}
                  >
                    🔍 Simulator
                  </button>
                  <button
                    type="button"
                    onClick={() => setLiveMode(true)}
                    className={`p-2 font-bold font-mono text-[10px] rounded-sm transition-all text-center uppercase tracking-wide cursor-pointer ${
                      liveMode ? 'bg-[#C15B32] text-white' : `${isDark ? 'bg-zinc-800 text-zinc-400 border border-white/5' : 'bg-white border border-black/10 text-black/60'}`
                    }`}
                  >
                    ⚡ LIVE (Real API)
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className={`font-semibold ${isDark ? 'text-zinc-300' : 'text-black/75'}`}>{lang === 'sw' ? 'Njia ya Utumaji' : 'Platform Channel'}</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setChannel('whatsapp')}
                    className={`p-2 font-bold font-mono text-[10px] rounded-sm transition-all text-center uppercase tracking-wide cursor-pointer ${
                      channel === 'whatsapp' ? 'bg-[#C15B32] text-white' : `${isDark ? 'bg-zinc-800 text-zinc-400 border border-white/5' : 'bg-white border border-black/10 text-black/60'}`
                    }`}
                  >
                    WhatsApp
                  </button>
                  <button
                    type="button"
                    onClick={() => setChannel('sms')}
                    className={`p-2 font-bold font-mono text-[10px] rounded-sm transition-all text-center uppercase tracking-wide cursor-pointer ${
                      channel === 'sms' ? 'bg-[#C15B32] text-white' : `${isDark ? 'bg-zinc-800 text-zinc-400 border border-white/5' : 'bg-white border border-black/10 text-black/60'}`
                    }`}
                  >
                    SMS Msg Core
                  </button>
                </div>
              </div>

              {/* Email dispatch toggle and field */}
              <div className="p-2 border border-[#C15B32]/20 rounded bg-[#C15B32]/5 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-[#C15B32] flex items-center gap-1 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={triggerEmail} 
                      onChange={(e) => setTriggerEmail(e.target.checked)} 
                      className="accent-[#C15B32]"
                    />
                    {lang === 'sw' ? 'Tuma kwa Email pia' : 'Send via Email too'}
                  </label>
                  <span className="text-[8px] uppercase tracking-wider font-mono text-[#C15B32] font-semibold">Real-world SMTP</span>
                </div>
                {triggerEmail && (
                  <input
                    type="email"
                    required={triggerEmail}
                    placeholder="student@university.domain"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full p-2 text-xs rounded-sm focus:outline-none focus:border-[#C15B32] ${
                      isDark ? 'bg-zinc-800 text-white border border-white/10' : 'bg-white border border-black/10 text-black'
                    }`}
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className={`font-semibold ${isDark ? 'text-zinc-300' : 'text-black/75'}`}>Phone (+255) *</label>
                  <input
                    type="text"
                    required
                    placeholder="+255 7..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={`w-full p-2 rounded-sm focus:outline-none focus:border-[#C15B32] ${
                      isDark ? 'bg-zinc-800 text-white border border-white/10' : 'bg-white border border-black/10 text-black'
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <label className={`font-semibold ${isDark ? 'text-zinc-300' : 'text-black/75'}`}>Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className={`w-full p-2 rounded-sm focus:outline-none focus:border-[#C15B32] ${
                      isDark ? 'bg-zinc-800 text-white border border-white/10 text-zinc-300' : 'bg-white border border-black/10 text-black'
                    }`}
                  >
                    <option value="study">{lang === 'sw' ? 'Ratiba ya Masomo' : 'Study reminder'}</option>
                    <option value="assignment">{lang === 'sw' ? 'Kazi ya Kikundi (Assignment)' : 'Assignment deadline'}</option>
                    <option value="exam">{lang === 'sw' ? 'Saa ya Mtihani' : 'Exam alert'}</option>
                    <option value="learning_plan">{lang === 'sw' ? 'Mpango dondoo wa siku' : 'Daily learning plan'}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className={`font-semibold ${isDark ? 'text-zinc-300' : 'text-black/75'}`}>{lang === 'sw' ? 'Tarehe ya Kuanza' : 'Target Date'}</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className={`w-full p-2 rounded-sm focus:outline-none focus:border-[#C15B32] ${
                      isDark ? 'bg-zinc-800 text-white border border-white/10' : 'bg-white border border-black/10 text-black'
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <label className={`font-semibold ${isDark ? 'text-zinc-300' : 'text-black/75'}`}>{lang === 'sw' ? 'Saa ya Arifa' : 'Target Time'}</label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className={`w-full p-2 rounded-sm focus:outline-none focus:border-[#C15B32] ${
                      isDark ? 'bg-zinc-800 text-white border border-white/10' : 'bg-white border border-black/10 text-black'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className={`font-semibold ${isDark ? 'text-zinc-300' : 'text-black/75'}`}>{lang === 'sw' ? 'Ujumbe utakaorushwa *' : 'Notification Message *'}</label>
                <textarea
                  rows={3}
                  required
                  placeholder={lang === 'sw' ? 'Andika ujumbe hapa utumwe kwenda simuni...' : 'Kumbuka: Una mtihani thabiti wa Database CS204...'}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className={`w-full p-2 rounded-sm focus:outline-none focus:border-[#C15B32] text-xs leading-relaxed ${
                    isDark ? 'bg-zinc-800 text-white border border-white/10' : 'bg-white border border-black/10 text-black'
                  }`}
                />
              </div>

              <button
                type="submit"
                disabled={isSendingMsg}
                className="w-full py-2.5 bg-[#C15B32] hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-sm shadow-sm transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
              >
                {isSendingMsg ? (
                  <>
                    <Zap className="h-3.5 w-3.5 animate-spin" /> 
                    {lang === 'sw' ? 'INARUSHA MAWASILIANO...' : 'TRANSMITTING ALERTS...'}
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" /> 
                    {lang === 'sw' ? 'RUSHA KIKUMBUSHO MAWASILIANO' : 'Schedule Reminder Alert'}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Integration output terminal block represent for API readiness */}
          {recentOutputJson && (
            <div className={`border rounded-sm p-4 text-left space-y-2 transition-colors ${
              isDark ? 'bg-black/40 border-white/10' : 'bg-[#1A1A1A] border-black/5'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono text-[#C15B32] font-semibold tracking-wider uppercase flex items-center gap-1">
                  <FileCode className="h-3.5 w-3.5" /> {lang === 'sw' ? 'LOGU ZA MFUMO (API OUTPUT):' : 'JSON SYSTEM INTEGRATION OUTPUT:'}
                </span>
                <span className="text-[8px] bg-[#C15B32]/10 text-[#C15B32] font-mono px-1 rounded">API READY</span>
              </div>
              <pre className="text-[10px] text-green-400 font-mono p-2 bg-black overflow-x-auto rounded leading-normal max-h-[160px]">
                {recentOutputJson}
              </pre>
              {apiLog && (
                <div className="pt-2 border-t border-white/5">
                  <span className="text-[8px] uppercase tracking-wider font-mono text-zinc-500 block">Debug API Log trace:</span>
                  <p className="text-[9px] text-zinc-400 font-mono italic mt-0.5 whitespace-pre-wrap">{apiLog}</p>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Module 2: Smart Study Planner Daily Schedule & Countdown */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Bento Block Exam Countdown */}
          <div className={`p-5 rounded-sm border shadow-sm space-y-4 transition-colors ${
            isDark ? 'bg-[#1e1e1e] border-white/10' : 'bg-white border-black/5'
          }`}>
            <h3 className={`text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1 border-b pb-2 ${
              isDark ? 'text-white border-white/10' : 'text-black border-black/5'
            }`}>
              <Calendar className="h-4 w-4 text-[#C15B32]" /> {lang === 'sw' ? 'Kikokotoo cha Mtihani (Exam Countdown Alerts)' : 'Exam Countdown Alerts'}
            </h3>

            {/* Form to submit exam countdown */}
            <form onSubmit={handleAddExam} className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs items-end">
              <div className="space-y-1">
                <label className={`font-semibold ${isDark ? 'text-zinc-300' : 'text-black/75'}`}>{lang === 'sw' ? 'Somo / Code' : 'Course Code'}</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CSC 210"
                  value={examCode}
                  onChange={e => setExamCode(e.target.value)}
                  className={`w-full p-2 rounded-sm focus:outline-none focus:border-[#C15B32] ${
                    isDark ? 'bg-zinc-800 text-white border border-white/10' : 'bg-[#FCFAF7] border-black/10 text-black'
                  }`}
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className={`font-semibold ${isDark ? 'text-zinc-300' : 'text-black/75'}`}>{lang === 'sw' ? 'Jina la Mtihani na Malengo' : 'Exam Title & Syllabus Target'}</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Design & Analysis of Algorithms Paper"
                  value={examName}
                  onChange={e => setExamName(e.target.value)}
                  className={`w-full p-2 rounded-sm focus:outline-none focus:border-[#C15B32] ${
                    isDark ? 'bg-zinc-800 text-white border border-white/10' : 'bg-[#FCFAF7] border-black/10 text-black'
                  }`}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:col-span-1">
                <div className="space-y-1">
                  <label className={`font-semibold ${isDark ? 'text-zinc-300' : 'text-black/75'}`}>{lang === 'sw' ? 'Tarehe' : 'Date'}</label>
                  <input
                    type="date"
                    required
                    value={examDateStr}
                    onChange={e => setExamDateStr(e.target.value)}
                    className={`w-full p-2 rounded-sm focus:outline-none focus:border-[#C15B32] text-xs ${
                      isDark ? 'bg-zinc-800 text-white border border-white/10 text-zinc-300' : 'bg-[#FCFAF7] border-black/10 text-black'
                    }`}
                  />
                </div>
                <button
                  type="submit"
                  className="bg-[#C15B32] hover:bg-black text-white py-2 font-bold rounded-sm transition-all cursor-pointer text-[10px] uppercase block w-full self-end h-[34px]"
                >
                  {lang === 'sw' ? 'Hifadhi' : 'Save'}
                </button>
              </div>
            </form>

            {/* List of active exams */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {countdowns.length === 0 ? (
                <div className={`col-span-2 py-4 text-center text-xs italic ${isDark ? 'text-zinc-500' : 'text-black/40'}`}>
                  {lang === 'sw' ? 'Hakuna mitihani iliyopangwa bado. Usiache kujiandaa!' : 'No exams listed yet. Keep studying!'}
                </div>
              ) : (
                countdowns.map(cd => (
                  <div key={cd.id} className={`p-3.5 border rounded-sm flex justify-between items-center gap-2 transition-colors ${
                    isDark ? 'bg-zinc-850/60 border-white/10' : 'bg-[#FCFAF7] border-black/5'
                  }`}>
                    <div className="min-w-0">
                      <span className="text-[10px] font-mono text-[#C15B32] font-semibold">{cd.subjectCode}</span>
                      <h4 className={`text-xs font-bold truncate ${isDark ? 'text-white' : 'text-[#1A1A1A]'}`}>{cd.subjectName}</h4>
                      <p className={`text-[10px] font-mono mt-0.5 ${isDark ? 'text-zinc-400' : 'text-black/50'}`}>
                        {lang === 'sw' ? 'Siku:' : 'Date:'} {cd.examDate}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="bg-[#C15B32] text-white py-1 px-3 rounded-sm font-mono font-bold text-xs shadow-sm">
                        {cd.daysRemaining} {lang === 'sw' ? 'Siku' : 'Days'}
                      </div>
                      <button
                        onClick={() => handleDeleteCountdown(cd.id)}
                        className="text-[9px] text-red-500 hover:underline font-mono uppercase mt-1 inline-block cursor-pointer"
                      >
                        {lang === 'sw' ? 'Futa' : 'Delete'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Daily study timetables */}
          <div className={`p-5 rounded-sm border shadow-sm space-y-4 transition-colors ${
            isDark ? 'bg-[#1e1e1e] border-white/10' : 'bg-white border-black/5'
          }`}>
            <h3 className={`text-xs font-bold font-mono uppercase tracking-wider flex items-center justify-between border-b pb-2 ${
              isDark ? 'text-white border-white/10' : 'text-black border-black/5'
            }`}>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-[#C15B32]" /> {lang === 'sw' ? 'Ratiba ya Siku (Daily Study planners)' : 'Daily Study planners'}
              </span>
              <span className="text-[9px] text-[#C15B32] font-semibold tracking-wider font-mono">Calibrated Study Tracks</span>
            </h3>

            {/* Day addition form */}
            <form onSubmit={handleAddDailyPlan} className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs items-end">
              <div className="md:col-span-2 space-y-1">
                <label className={`font-semibold lg:text-left block ${isDark ? 'text-zinc-300' : 'text-black/75'}`}>{lang === 'sw' ? 'Siku' : 'Day'}</label>
                <select
                  value={newDay}
                  onChange={e => setNewDay(e.target.value)}
                  className={`w-full p-2 rounded-sm focus:outline-none focus:border-[#C15B32] ${
                    isDark ? 'bg-zinc-800 text-zinc-300 border border-white/10' : 'bg-[#FCFAF7] border border-black/10 text-black'
                  }`}
                >
                  <option value="Jumatatu">Jumatatu</option>
                  <option value="Jumanne">Jumanne</option>
                  <option value="Jumatano">Jumatano</option>
                  <option value="Alhamisi">Alhamisi</option>
                  <option value="Ijumaa">Ijumaa</option>
                  <option value="Jumamosi">Jumamosi</option>
                  <option value="Jumapili">Jumapili</option>
                </select>
              </div>
              <div className="md:col-span-3 space-y-1">
                <label className={`font-semibold lg:text-left block ${isDark ? 'text-zinc-300' : 'text-black/75'}`}>Interval</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 08:00 - 10:00"
                  value={newSlot}
                  onChange={e => setNewSlot(e.target.value)}
                  className={`w-full p-2 rounded-sm focus:outline-none focus:border-[#C15B32] ${
                    isDark ? 'bg-zinc-800 text-white border border-white/10' : 'bg-[#FCFAF7] border border-black/10 text-black'
                  }`}
                />
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className={`font-semibold lg:text-left block ${isDark ? 'text-zinc-300' : 'text-black/75'}`}>{lang === 'sw' ? 'Somo' : 'Somo (Course)'}</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CS 204"
                  value={newSub}
                  onChange={e => setNewSub(e.target.value)}
                  className={`w-full p-2 rounded-sm focus:outline-none focus:border-[#C15B32] ${
                    isDark ? 'bg-zinc-800 text-white border border-white/10' : 'bg-[#FCFAF7] border border-black/10 text-black'
                  }`}
                />
              </div>
              <div className="md:col-span-4 space-y-1">
                <label className={`font-semibold lg:text-left block ${isDark ? 'text-zinc-300' : 'text-black/75'}`}>Study Task</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Read Normalization notes"
                  value={newAct}
                  onChange={e => setNewAct(e.target.value)}
                  className={`w-full p-2 rounded-sm focus:outline-none focus:border-[#C15B32] ${
                    isDark ? 'bg-zinc-800 text-white border border-white/10' : 'bg-[#FCFAF7] border border-black/10 text-black'
                  }`}
                />
              </div>
              <div className="md:col-span-1">
                <button
                  type="submit"
                  className="w-full bg-[#C15B32] text-white hover:bg-black py-2 font-bold rounded-sm transition-all text-xs uppercase cursor-pointer h-[34px]"
                >
                  + Add
                </button>
              </div>
            </form>

            {/* Timetable view item loops */}
            <div className="space-y-2">
              {dailyPlans.length === 0 ? (
                <div className={`py-8 text-center text-xs italic ${isDark ? 'text-zinc-500' : 'text-black/40'}`}>
                  {lang === 'sw' ? 'Hakuna ratiba iliyopangwa bado. Ongeza masomo yako hapo juu.' : 'Empty timetable list. Input custom study intervals.'}
                </div>
              ) : (
                dailyPlans.map(plan => (
                  <div
                    key={plan.id}
                    className={`p-3.5 border rounded-sm flex items-center justify-between gap-3.5 transition-all ${
                      plan.completed
                        ? (isDark ? 'bg-green-950/20 border-green-850/30' : 'bg-green-50/40 border-green-100')
                        : (isDark ? 'bg-zinc-850/60 border-white/5 hover:border-white/10' : 'bg-[#FCFAF7] border-black/5 hover:border-black/10 shadow-xs')
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={plan.completed}
                        onChange={() => toggleDailyPlanComplete(plan.id)}
                        className="h-4 w-4 text-[#C15B32] border-black/20 rounded focus:ring-[#C15B32]"
                      />
                      <div className="text-left font-sans">
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded mr-1.5 font-bold ${
                          isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-[#F2efe9] text-black/55'
                        }`}>
                          {plan.dayName} | {plan.timeSlot}
                        </span>
                        <span className="text-[10px] font-mono text-[#C15B32] font-semibold border-r border-[#C15B32]/30 pr-1.5 mr-1.5 uppercase">
                          {plan.subject}
                        </span>
                        <span className={`text-xs ${
                          plan.completed 
                            ? 'line-through text-black/40 font-normal' 
                            : (isDark ? 'text-zinc-100 font-semibold' : 'text-black font-semibold')
                        }`}>
                          {plan.activity}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeletePlan(plan.id)}
                      className={`p-1.5 rounded-sm transition-all cursor-pointer shrink-0 ${
                        isDark ? 'text-zinc-500 hover:text-red-500 hover:bg-white/5' : 'text-[#1A1A1A]/40 hover:text-red-600 hover:bg-black/5'
                      }`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

          </div>

          {/* List of active scheduled reminders */}
          <div className={`p-5 rounded-sm border shadow-sm space-y-3 transition-colors ${
            isDark ? 'bg-[#1e1e1e] border-white/10' : 'bg-white border-black/5'
          }`}>
            <h3 className={`text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1.5 ${
              isDark ? 'text-white' : 'text-black'
            }`}>
              <Shield className="h-4 w-4 text-[#C15B32]" /> {lang === 'sw' ? 'Msururu wa Kengele Zilizosajiliwa (Active Alerts Flow)' : 'Active Alerts Flow'}
            </h3>
            <div className="space-y-2 max-h-[180px] overflow-y-auto">
              {reminders.length === 0 ? (
                <p className={`text-xs italic text-center py-4 ${isDark ? 'text-zinc-500' : 'text-black/40'}`}>
                  {lang === 'sw' ? 'Hakuna kengele zilizosajiliwa kwasasa. Tuma dondoo juu.' : 'No active alerts scheduled yet.'}
                </p>
              ) : (
                reminders.map(rem => (
                  <div key={rem.id} className={`p-3 border rounded-sm flex justify-between items-start gap-3 transition-colors ${
                    isDark ? 'bg-zinc-850/60 border-white/5' : 'bg-[#FCFAF7] border-black/5'
                  }`}>
                    <div className="text-left py-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-sm bg-[#C15B32]/10 text-[#C15B32] font-bold uppercase tracking-wider">
                          {rem.channel} alert
                        </span>
                        <span className={`text-[10px] font-mono italic ${isDark ? 'text-zinc-400' : 'text-black/50'}`}>
                          {rem.datetime}
                        </span>
                        {rem.status === 'Sent' && (
                          <span className="text-[8px] px-1 bg-green-500/10 text-green-500 font-mono font-bold rounded">
                            {lang === 'sw' ? 'IMETUMWA' : 'DISPATCHED'}
                          </span>
                        )}
                      </div>
                      <p className={`text-xs mt-1 leading-relaxed ${isDark ? 'text-zinc-300' : 'text-black/75'}`}>{rem.message}</p>
                      <p className={`text-[9px] font-mono mt-1 ${isDark ? 'text-zinc-500' : 'text-black/40'}`}>
                        {lang === 'sw' ? 'Namba:' : 'Number:'} {rem.phone}
                      </p>
                    </div>

                    <button
                      onClick={() => onUpdateReminders(reminders.filter(r => r.id !== rem.id))}
                      className="text-[#C15B32] hover:text-red-500 font-mono text-xs scale-100 hover:scale-110 cursor-pointer"
                    >
                      {lang === 'sw' ? 'Futa' : 'Cancel'}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
