import React, { useState } from 'react';
import { StudentProfile } from '../types';
import { GraduationCap, Lock, Mail, User, ChevronRight, Eye, EyeOff, ShieldCheck, HelpCircle, Key } from 'lucide-react';
import { motion } from 'motion/react';
import { TRANSLATIONS, Language } from '../utils/languages';
import SmtpConfig from './SmtpConfig';

interface LoginAuthProps {
  onAuthSuccess: (userProfile: StudentProfile) => void;
  lang: Language;
  onLanguageToggle: (lang: Language) => void;
  theme: 'light' | 'dark';
}

const AFRICAN_UNIVERSITIES = [
  "University of Dar es Salaam (UDSM)",
  "Makerere University",
  "University of Nairobi (UoN)",
  "Kenyatta University",
  "Ashesi University",
  "University of Ibadan (UI)",
  "University of Cape Town (UCT)",
  "United States International University (USIU-A)",
  "Other / Custom"
];

export default function LoginAuth({ onAuthSuccess, lang, onLanguageToggle, theme }: LoginAuthProps) {
  const t = TRANSLATIONS[lang];
  const [activeTab, setActiveTab] = useState<'signin' | 'signup' | 'forgot_password'>('signin');
  
  // Sign In inputs
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Sign Up inputs
  const [fullName, setFullname] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [university, setUniversity] = useState('University of Dar es Salaam (UDSM)');
  const [customUniversity, setCustomUniversity] = useState('');
  const [course, setCourse] = useState('');
  const [year, setYear] = useState<number>(1);
  const [languagePref, setLanguagePref] = useState<'English' | 'Kiswahili' | 'Sheng' | 'Mixed'>('Kiswahili');
  const [learningStyle, setLearningStyle] = useState<'visual' | 'practical' | 'theoretical' | 'mixed'>('mixed');
  const [signupStep, setSignupStep] = useState(1);
  const [signupError, setSignupError] = useState('');

  // Account Recovery States
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryCodeInput, setRecoveryCodeInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState<1 | 2 | 3>(1); // 1: Email, 2: Code & Pass, 3: Success
  const [generatedCode, setGeneratedCode] = useState('');
  const [recoveryError, setRecoveryError] = useState('');
  const [recoverySuccess, setRecoverySuccess] = useState('');
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [recoveryLiveMode, setRecoveryLiveMode] = useState(false);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError('');
    setRecoverySuccess('');
    setIsSendingCode(true);

    if (!recoveryEmail.trim()) {
      setRecoveryError(lang === 'sw' ? 'Tafadhali jaza barua pepe.' : 'Please enter your email.');
      setIsSendingCode(false);
      return;
    }

    try {
      const storedUsersRaw = localStorage.getItem('msomi_registered_users');
      const registeredUsers = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];
      const userExists = registeredUsers.find((u: any) => u.email.toLowerCase() === recoveryEmail.toLowerCase().trim());

      if (!userExists) {
        setRecoveryError(lang === 'sw' 
          ? 'Anwani hii ya barua pepe haijasajiliwa kwenye chuo hiki!' 
          : 'This email address is not registered in our database!');
        setIsSendingCode(false);
        return;
      }

      // Generate 6-digit random code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedCode(code);

      // Load custom SMTP config from local storage if live mode is checked
      let customCredentials: any = null;
      if (recoveryLiveMode) {
        const savedSmtp = localStorage.getItem('msomi_smtp_config');
        if (savedSmtp) {
          try {
            customCredentials = JSON.parse(savedSmtp);
          } catch(e) {
            console.error('Failed to parse stored SMTP config:', e);
          }
        }
      }

      // Call SMTP / Send Message microservice
      const response = await fetch('/api/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'email',
          recipient: recoveryEmail.toLowerCase().trim(),
          subject: lang === 'sw' ? 'MSOMI AI - Msimbo wa Kurejesha Akaunti' : 'MSOMI AI - Account Recovery Verification Code',
          message: lang === 'sw' 
            ? `Habari! Msimbo wako wa siri wa kurejesha akaunti ni: ${code}. Ingiza msimbo huu kwenye kiolesura cha msomi ili kuweka nenosiri jipya.`
            : `Hello! Your secure Msomi AI account recovery verification code is: ${code}. Enter this code in the Msomi application portal to configure your new password.`,
          isLiveMode: recoveryLiveMode,
          credentials: customCredentials
        })
      });

      const resJson = await response.json();
      if (!response.ok) {
        throw new Error(resJson.error || 'Server transmission failed');
      }

      setRecoverySuccess(lang === 'sw'
        ? `Msimbo wa siri umeshughulikiwa vyema! Angalia barua pepe yako [${recoveryEmail}]. Kwasababu ya hali ya Kijaribio, tumeweka msimbo kwenye mfumo wa mwanafunzi hapa hapa chini pia.`
        : `Verification code successfully dispatched! Check your mail inbox [${recoveryEmail}]. (And for simple testing purposes, we have also outputted your simulation code below).`);
      
      setRecoveryStep(2);
    } catch (err: any) {
      setRecoveryError(err.message || 'Failure connecting to system API routes.');
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError('');

    if (recoveryCodeInput.trim() !== generatedCode) {
      setRecoveryError(lang === 'sw' 
        ? 'Msimbo wa siri ulioweka sio sahihi! Tafadhali angalia msimbo uliotumwa.' 
        : 'The verification code you entered is invalid! Please check and retry.');
      return;
    }

    if (newPasswordInput.length < 5) {
      setRecoveryError(lang === 'sw' 
        ? 'Nenosiri jipya lazima liwe na herufi 5 au zaidi.' 
        : 'New password must contain at least 5 characters.');
      return;
    }

    try {
      const storedUsersRaw = localStorage.getItem('msomi_registered_users');
      const registeredUsers = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];
      
      const userIndex = registeredUsers.findIndex((u: any) => u.email.toLowerCase() === recoveryEmail.toLowerCase().trim());
      if (userIndex === -1) {
        setRecoveryError(lang === 'sw' ? 'Akaunti haikupatikana.' : 'Account not found.');
        return;
      }

      // Update password
      registeredUsers[userIndex].password = newPasswordInput;
      localStorage.setItem('msomi_registered_users', JSON.stringify(registeredUsers));

      setRecoveryStep(3);
    } catch (err: any) {
      setRecoveryError(lang === 'sw' ? 'Hitilafu wakati wa kuhifadhi.' : 'Error during save update process.');
    }
  };

  // Password strength check
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, text: '', color: 'bg-zinc-200' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    switch (score) {
      case 1: return { score: 25, text: lang === 'sw' ? 'Dhaifu mno' : 'Very Weak', color: 'bg-red-500' };
      case 2: return { score: 50, text: lang === 'sw' ? 'Dhaifu' : 'Weak', color: 'bg-amber-500' };
      case 3: return { score: 75, text: lang === 'sw' ? 'Nzuri' : 'Strong', color: 'bg-indigo-500' };
      case 4: return { score: 100, text: lang === 'sw' ? 'Imara kabisa' : 'Excellent Strength', color: 'bg-emerald-500' };
      default: return { score: 10, text: lang === 'sw' ? 'Dhaifu mno' : 'Very Weak', color: 'bg-red-500' };
    }
  };

  const passStrengthRegister = getPasswordStrength(registerPassword);

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginEmail.trim() || !loginPassword) {
      setLoginError(lang === 'sw' ? 'Tafadhali jaza nyanja zote.' : 'Please enter all details.');
      return;
    }

    try {
      const storedUsersRaw = localStorage.getItem('msomi_registered_users');
      const registeredUsers = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];
      
      const user = registeredUsers.find((u: any) => u.email.toLowerCase() === loginEmail.toLowerCase());
      
      if (!user) {
        setLoginError(t.no_user);
        return;
      }
      
      if (user.password !== loginPassword) {
        setLoginError(t.wrong_pass);
        return;
      }

      // Successful login
      // Save current user session
      localStorage.setItem('msomi_current_user_session', JSON.stringify(user));
      onAuthSuccess(user.profile);
    } catch (err) {
      console.error(err);
      setLoginError(lang === 'sw' ? 'Hitilafu ya kusoma data' : 'Data access failure');
    }
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError('');

    if (!fullName.trim() || !registerEmail.trim() || !registerPassword || !course.trim()) {
      setSignupError(lang === 'sw' ? 'Tafadhali weka taarifa zote zinazohitajika.' : 'Please fill details fully.');
      return;
    }

    if (!registerEmail.includes('@') || !registerEmail.includes('.')) {
      setSignupError(lang === 'sw' ? 'Barua pepe si sahihi (Iandike vizuri).' : 'Invalid email structure format.');
      return;
    }

    if (registerPassword.length < 5) {
      setSignupError(lang === 'sw' ? 'Nenosiri lazima liwe na herufi 5 au zaidi.' : 'Password must exceed 5 letters.');
      return;
    }

    try {
      const storedUsersRaw = localStorage.getItem('msomi_registered_users');
      const registeredUsers = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];

      const exists = registeredUsers.some((u: any) => u.email.toLowerCase() === registerEmail.toLowerCase());
      if (exists) {
        setSignupError(lang === 'sw' ? 'Barua pepe hii tayari inatumika chuo.' : 'Email already exists at campus.');
        return;
      }

      const finalUniversity = university === 'Other / Custom' ? customUniversity || 'African University' : university;

      const newStudentProfile: StudentProfile = {
        name: fullName.trim(),
        university: finalUniversity,
        course: course.trim(),
        year: year,
        preferredLanguage: languagePref,
        difficultyLevel: 3,
        learningStyle: learningStyle,
        strengths: '',
        interests: ''
      };

      const newUserAccount = {
        email: registerEmail.toLowerCase().trim(),
        password: registerPassword,
        profile: newStudentProfile
      };

      // Dave to list and current user
      const updatedList = [...registeredUsers, newUserAccount];
      localStorage.setItem('msomi_registered_users', JSON.stringify(updatedList));
      localStorage.setItem('msomi_current_user_session', JSON.stringify(newUserAccount));

      onAuthSuccess(newStudentProfile);
    } catch (err) {
      console.error(err);
      setSignupError('Signup storage error');
    }
  };

  const cardBg = theme === 'dark' ? 'bg-[#1e1e1e] border-white/10' : 'bg-white border-black/5';
  const textTitle = theme === 'dark' ? 'text-[#FCFAF7]' : 'text-[#1A1A1A]';
  const textSub = theme === 'dark' ? 'text-zinc-400' : 'text-black/55';
  const inputBg = theme === 'dark' ? 'bg-[#2b2b2b]' : 'bg-[#F2EFE9]';
  const inputBorder = theme === 'dark' ? 'border-white/10' : 'border-black/10';

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-200 ${theme === 'dark' ? 'bg-[#121212]' : 'bg-[#FCFAF7]'}`}>
      
      {/* Absolute Language Options */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <button
          onClick={() => onLanguageToggle(lang === 'en' ? 'sw' : 'en')}
          className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded uppercase tracking-wider border cursor-pointer ${
            theme === 'dark' 
              ? 'bg-[#1E1E1E] border-white/10 text-white hover:bg-neutral-800' 
              : 'bg-white border-black/10 text-black hover:bg-[#F2EFE9]'
          }`}
        >
          🌐 {lang === 'en' ? 'Kiswahili' : 'English'}
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className={`w-full max-w-md ${cardBg} border rounded-md p-6 md:p-8 shadow-xl relative overflow-hidden`}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#C15B32]/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#C15B32]/10 rounded-full blur-2xl pointer-events-none" />

        {/* Brand Banner */}
        <div className="flex flex-col items-center mb-6">
          <div className="p-3 bg-[#C15B32]/15 text-[#C15B32] rounded-xs border border-[#C15B32]/30 mb-2.5">
            <GraduationCap className="h-7 w-7" />
          </div>
          <h1 className="font-serif text-3xl italic font-bold tracking-tight text-[#C15B32] flex items-center gap-1.5">
            Msomi <span className="text-[10px] uppercase tracking-[0.2em] font-sans font-bold text-white bg-[#C15B32] px-2 py-0.5 rounded-sm">AI</span>
          </h1>
          <p className={`text-[11px] ${textSub} text-center mt-1`}>
            {t.login_system_title} | DEV TEK INNOVATION
          </p>
        </div>

        {/* Form Auth Tabs */}
        {signupStep === 1 && activeTab !== 'forgot_password' && (
          <div className="flex border-b border-black/15 dark:border-white/10 mb-5 text-xs text-center">
            <button
              onClick={() => { setActiveTab('signin'); setLoginError(''); }}
              className={`flex-1 pb-2.5 uppercase font-mono tracking-wider font-bold transition-all border-b-2 cursor-pointer ${
                activeTab === 'signin'
                  ? 'border-[#C15B32] text-[#C15B32]'
                  : 'border-transparent text-neutral-400 hover:text-neutral-500'
              }`}
            >
              {t.sign_in}
            </button>
            <button
              onClick={() => { setActiveTab('signup'); setSignupError(''); }}
              className={`flex-1 pb-2.5 uppercase font-mono tracking-wider font-bold transition-all border-b-2 cursor-pointer ${
                activeTab === 'signup'
                  ? 'border-[#C15B32] text-[#C15B32]'
                  : 'border-transparent text-neutral-400 hover:text-neutral-500'
              }`}
            >
              {t.sign_up}
            </button>
          </div>
        )}

        {/* TAB 1: SIGN IN */}
        {activeTab === 'signin' && (
          <form onSubmit={handleSignInSubmit} className="space-y-4">
            {loginError && (
              <div className="p-3 bg-red-100 dark:bg-red-950/40 border-l-4 border-red-500 text-xs text-red-800 dark:text-red-200 rounded-sm">
                ⚠️ {loginError}
              </div>
            )}

            <div className="space-y-1 text-xs">
              <label className="font-bold flex items-center gap-1 text-neutral-400">
                <Mail className="h-3 w-3 text-[#C15B32]" /> {t.email}
              </label>
              <input
                type="email"
                required
                placeholder="fredrickdavid149@gmail.com"
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                className={`w-full py-2.5 px-3 ${inputBg} border ${inputBorder} rounded-sm text-sm focus:outline-none focus:border-[#C15B32] text-neutral-100 dark:text-[#FCFAF7] light:text-[#1A1A1A]`}
              />
            </div>

            <div className="space-y-1 text-xs">
              <label className="font-bold flex items-center gap-1 text-neutral-400">
                <Lock className="h-3 w-3 text-[#C15B32]" /> {t.password}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  className={`w-full py-2.5 px-3 ${inputBg} border ${inputBorder} rounded-sm text-sm focus:outline-none focus:border-[#C15B32] text-neutral-100 dark:text-[#FCFAF7] light:text-[#1A1A1A] pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-500"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Forgot Password Clickable Trigger */}
            <div className="flex justify-end pt-0.5">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('forgot_password');
                  setRecoveryStep(1);
                  setRecoveryError('');
                  setRecoverySuccess('');
                  setRecoveryEmail(loginEmail || registerEmail);
                }}
                className="text-[11px] font-medium text-[#C15B32] hover:underline cursor-pointer transition-all"
              >
                {lang === 'sw' ? 'Umesahau Nenosiri? / Forgot Password?' : 'Forgot Password?'}
              </button>
            </div>

            <button
              type="submit"
              className="w-full mt-4 flex items-center justify-center gap-2 bg-[#C15B32] hover:bg-[#a14b28] text-white py-2.5 rounded-sm text-xs uppercase tracking-widest font-bold transition-all shadow-md active:scale-[0.98] cursor-pointer"
            >
              <ShieldCheck className="h-4 w-4" /> {t.sign_in} <ChevronRight className="h-4 w-4" />
            </button>
          </form>
        )}

        {/* VIEW 3: ACCOUNT RECOVERY / FORGOT PASSWORD */}
        {activeTab === 'forgot_password' && (
          <form className="space-y-4" onSubmit={e => e.preventDefault()}>
            <h3 className="text-xs font-mono font-bold uppercase text-[#C15B32] border-b border-black/10 dark:border-white/10 pb-1.5 flex justify-between items-center">
              <span>{lang === 'sw' ? 'REJESHA AKAUNTI' : 'ACCOUNT RECOVERY'}</span>
              <button 
                type="button" 
                onClick={() => {
                  setActiveTab('signin');
                  setRecoveryError('');
                  setRecoverySuccess('');
                }} 
                className="text-[10px] text-zinc-400 hover:text-[#C15B32] uppercase cursor-pointer transition-all"
              >
                {lang === 'sw' ? 'Rudi Kuingia' : 'Back to Login'}
              </button>
            </h3>

            {recoveryError && (
              <div className="p-3 bg-red-100 dark:bg-red-950/40 border-l-4 border-red-500 text-xs text-red-800 dark:text-red-200 rounded-sm leading-relaxed">
                ⚠️ {recoveryError}
              </div>
            )}

            {recoverySuccess && (
              <div className="p-3 bg-emerald-100 dark:bg-emerald-950/40 border-l-4 border-emerald-500 text-xs text-emerald-800 dark:text-emerald-200 rounded-sm leading-relaxed">
                ✅ {recoverySuccess}
              </div>
            )}

            {/* STEP 1: Enter email and choose simulation mode */}
            {recoveryStep === 1 && (
              <div className="space-y-4">
                <p className={`text-xs ${textSub} leading-relaxed`}>
                  {lang === 'sw' 
                    ? 'Weka barua pepe uliyosajili hapa chini ili tukutumie msimbo maalum wa siri wa kuthibitisha utambulisho wako.'
                    : 'Enter your registered academic email address to receive a secure recovery code to reset your password.'}
                </p>

                {/* Simulator vs Production Switcher for recovery */}
                <div className="space-y-1 text-xs">
                  <label className="font-bold text-neutral-400">
                    {lang === 'sw' ? 'Hali ya Mawasiliano' : 'Communication Mode'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRecoveryLiveMode(false)}
                      className={`py-1.5 font-bold font-mono text-[9px] rounded-sm transition-all text-center uppercase cursor-pointer ${
                        !recoveryLiveMode 
                          ? 'bg-[#C15B32] text-white font-semibold' 
                          : `${theme === 'dark' ? 'bg-zinc-800 text-zinc-400 border border-white/5' : 'bg-[#F2EFE9] border border-black/10 text-neutral-600'}`
                      }`}
                    >
                      🔍 {lang === 'sw' ? 'Jaribio (Simulation)' : 'Simulation'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setRecoveryLiveMode(true)}
                      className={`py-1.5 font-bold font-mono text-[9px] rounded-sm transition-all text-center uppercase cursor-pointer ${
                        recoveryLiveMode 
                          ? 'bg-[#C15B32] text-white font-semibold' 
                          : `${theme === 'dark' ? 'bg-zinc-800 text-zinc-400 border border-white/5' : 'bg-[#F2EFE9] border border-black/10 text-neutral-600'}`
                      }`}
                    >
                      ⚡ {lang === 'sw' ? 'HALISI (Real SMTP)' : 'LIVE SMTP'}
                    </button>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold flex items-center gap-1 text-neutral-400">
                    <Mail className="h-3 w-3 text-[#C15B32]" /> {lang === 'sw' ? 'Anwani ya Barua Pepe' : 'Email Address'}
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="fredrickdavid149@gmail.com"
                    value={recoveryEmail}
                    onChange={e => setRecoveryEmail(e.target.value)}
                    className={`w-full py-2.5 px-3 ${inputBg} border ${inputBorder} rounded-sm text-sm focus:outline-none focus:border-[#C15B32] text-neutral-100 dark:text-[#FCFAF7] light:text-[#1A1A1A]`}
                  />
                </div>

                {/* SMTP Config Service Section */}
                <div className="border border-black/10 dark:border-white/10 rounded-sm bg-black/5 dark:bg-white/5 overflow-hidden">
                  <details className="group">
                    <summary className="list-none flex justify-between items-center px-3 py-2.5 text-xs font-bold select-none cursor-pointer hover:bg-black/10 dark:hover:bg-white/10">
                      <span className="flex items-center gap-1.5 text-[#C15B32]">
                        ⚙️ {lang === 'sw' ? 'Sanidi Vivutio vya SMTP (Hifadhi Salama)' : 'Configure Custom SMTP (Secure Setup)'}
                      </span>
                      <span className="transition-transform group-open:rotate-180 text-[10px] text-neutral-500 font-mono">
                        ▼
                      </span>
                    </summary>
                    <div className="p-2 border-t border-black/10 dark:border-white/10 bg-transparent">
                      <SmtpConfig lang={lang} theme={theme} />
                    </div>
                  </details>
                </div>

                <button
                  type="button"
                  disabled={isSendingCode}
                  onClick={handleRequestCode}
                  className="w-full flex items-center justify-center gap-2 bg-[#C15B32] hover:bg-[#a14b28] text-white py-2.5 rounded-sm text-xs uppercase tracking-widest font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSendingCode ? (
                    <>
                      <span className="animate-spin mr-1">⌛</span>
                      {lang === 'sw' ? 'INATUMA MSIMBO...' : 'DISPATCHING CODE...'}
                    </>
                  ) : (
                    <>
                      {lang === 'sw' ? 'TUMA MSIMBO WA VERIFICATION' : 'DISPATCH RECOVERY CODE'} <ChevronRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            )}

            {/* STEP 2: Input code and new password */}
            {recoveryStep === 2 && (
              <div className="space-y-4">
                <p className={`text-xs ${textSub} leading-relaxed`}>
                  {lang === 'sw'
                    ? `Weka msimbo tuliotuma kwenye [${recoveryEmail}] pamoja na nenosiri lako jipya unalotaka kutumia sasa.`
                    : `Enter the verification code sent to [${recoveryEmail}] and choose your new access password structure.`}
                </p>

                {/* Display code alert so developer/tester can test easily in simulation mode! */}
                {!recoveryLiveMode && generatedCode && (
                  <div className="p-2.5 bg-yellow-500/15 border border-yellow-500/30 rounded-sm text-[11px] font-mono leading-relaxed text-yellow-600 dark:text-yellow-400">
                    ℹ️ <strong>{lang === 'sw' ? 'Msimbo wa Jaribio' : 'Simulation Code'}:</strong> {generatedCode}
                  </div>
                )}

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-neutral-400">
                    {lang === 'sw' ? 'Msimbo wa Siri (6-Digit Code)' : '6-Digit Verification Code'}
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="e.g. 123456"
                    value={recoveryCodeInput}
                    onChange={e => setRecoveryCodeInput(e.target.value)}
                    className={`w-full py-2 px-3 ${inputBg} border ${inputBorder} rounded-sm text-sm font-mono tracking-widest text-[#C15B32] text-center focus:outline-none focus:border-[#C15B32]`}
                  />
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold flex items-center gap-1 text-neutral-400">
                    <Lock className="h-3 w-3 text-[#C15B32]" /> {lang === 'sw' ? 'Nenosiri Jipya' : 'New Password'}
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={newPasswordInput}
                      onChange={e => setNewPasswordInput(e.target.value)}
                      className={`w-full py-2 px-3 ${inputBg} border ${inputBorder} rounded-sm text-sm focus:outline-none focus:border-[#C15B32] pr-10 text-neutral-100 dark:text-[#FCFAF7] light:text-[#1A1A1A]`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-2 text-neutral-400 hover:text-neutral-500 cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setRecoveryStep(1);
                      setRecoveryError('');
                      setRecoverySuccess('');
                    }}
                    className={`flex-1 py-2 text-xs font-bold uppercase border rounded-sm tracking-wider hover:bg-neutral-800 transition-all cursor-pointer ${
                      theme === 'dark' ? 'border-zinc-700 text-zinc-300' : 'border-zinc-300 text-zinc-600'
                    }`}
                  >
                    {lang === 'sw' ? 'Rudi' : 'Back'}
                  </button>
                  <button
                    type="button"
                    onClick={handleResetPassword}
                    className="flex-1 bg-[#C15B32] hover:bg-[#a14b28] text-white py-2 text-xs font-bold uppercase rounded-sm tracking-wider transition-all cursor-pointer"
                  >
                    {lang === 'sw' ? 'Rejesha Sasa' : 'Verify & Reset'}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Verification success! */}
            {recoveryStep === 3 && (
              <div className="space-y-4 text-center py-4">
                <div className="mx-auto w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded-full flex items-center justify-center mb-2 font-bold font-mono">
                  ✓
                </div>
                <h4 className="text-sm font-bold text-emerald-500">
                  {lang === 'sw' ? 'Nenosiri Limebadilishwa!' : 'Password Reset Successfully!'}
                </h4>
                <p className={`text-xs ${textSub} leading-relaxed`}>
                  {lang === 'sw'
                    ? 'Nenosiri lako limerekebishwa kwa ufanisi. Sasa unaweza kuingia kwenye akaunti yako mpya kutumia nenosiri uliloweka.'
                    : 'Your student authentication profile has been updated. You can now log into your session using your new credentials.'}
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('signin');
                    setLoginEmail(recoveryEmail); // prefill email!
                    setLoginPassword('');
                    setRecoveryStep(1);
                    setRecoveryError('');
                    setRecoverySuccess('');
                  }}
                  className="w-full bg-[#C15B32] hover:bg-[#a14b28] text-white py-2.5 rounded-sm text-xs uppercase tracking-widest font-bold transition-all cursor-pointer"
                >
                  {lang === 'sw' ? 'Ingia Sasa hivi' : 'Sign In Now'}
                </button>
              </div>
            )}
          </form>
        )}

        {/* TAB 2: SIGN UP */}
        {activeTab === 'signup' && (
          <form onSubmit={handleSignUpSubmit} className="space-y-4">
            {signupError && (
              <div className="p-3 bg-red-100 dark:bg-red-950/40 border-l-4 border-red-500 text-xs text-red-800 dark:text-red-200 rounded-sm">
                ⚠️ {signupError}
              </div>
            )}

            {signupStep === 1 && (
              <div className="space-y-3">
                <div className="space-y-1 text-xs">
                  <label className="font-bold flex items-center gap-1 text-neutral-400">
                    <User className="h-3 w-3 text-[#C15B32]" /> {lang === 'sw' ? 'Jina Kamili' : 'Full Name'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. David Fredrick Mdikula"
                    value={fullName}
                    onChange={e => setFullname(e.target.value)}
                    className={`w-full py-2 px-3 ${inputBg} border ${inputBorder} rounded-sm text-sm focus:outline-none focus:border-[#C15B32]`}
                  />
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold flex items-center gap-1 text-neutral-400">
                    <Mail className="h-3 w-3 text-[#C15B32]" /> {t.email}
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="fredrickdavid149@gmail.com"
                    value={registerEmail}
                    onChange={e => setRegisterEmail(e.target.value)}
                    className={`w-full py-2 px-3 ${inputBg} border ${inputBorder} rounded-sm text-sm focus:outline-none focus:border-[#C15B32]`}
                  />
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold flex items-center gap-1 text-neutral-400">
                    <Lock className="h-3 w-3 text-[#C15B32]" /> {t.password}
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={registerPassword}
                    onChange={e => setRegisterPassword(e.target.value)}
                    className={`w-full py-2 px-3 ${inputBg} border ${inputBorder} rounded-sm text-sm focus:outline-none focus:border-[#C15B32] mb-1`}
                  />
                  {registerPassword && (
                    <div className="space-y-1 pt-0.5">
                      <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1 rounded overflow-hidden">
                        <div className={`h-full ${passStrengthRegister.color}`} style={{ width: `${passStrengthRegister.score}%` }}></div>
                      </div>
                      <span className="text-[9px] text-[#C15B32] font-mono uppercase font-bold">{passStrengthRegister.text}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-neutral-400">{t.course}</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Computer Science"
                      value={course}
                      onChange={e => setCourse(e.target.value)}
                      className={`w-full py-2 px-3 ${inputBg} border ${inputBorder} rounded-sm text-sm focus:outline-none`}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-neutral-400">{t.year}</label>
                    <select
                      value={year}
                      onChange={e => setYear(Number(e.target.value))}
                      className={`w-full py-2 px-3 ${inputBg} border ${inputBorder} rounded-sm text-sm focus:outline-none`}
                    >
                      {[1, 2, 3, 4, 5].map(y => (
                        <option key={y} value={y}>{lang === 'sw' ? `Mwaka wa ${y}` : `Year ${y}`}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={!fullName.trim() || !registerEmail.trim() || !registerPassword || !course.trim()}
                  onClick={() => setSignupStep(2)}
                  className="w-full flex items-center justify-center gap-2 bg-[#1A1A1A] hover:bg-[#C15B32] text-white py-2.5 rounded-sm text-xs uppercase tracking-widest font-bold transition-all shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {lang === 'sw' ? 'Sanidi Mipango' : 'Setup Study Plan'} <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {signupStep === 2 && (
              <div className="space-y-3.5">
                <h3 className="text-xs font-mono font-bold uppercase text-[#C15B32] border-b border-black/10 dark:border-white/10 pb-1.5 flex justify-between items-center">
                  <span>{t.step2_title}</span>
                  <button type="button" onClick={() => setSignupStep(1)} className="text-[10px] text-zinc-400 hover:text-white uppercase">{t.back}</button>
                </h3>

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-neutral-400">{t.univ}</label>
                  <select
                    value={university}
                    onChange={e => setUniversity(e.target.value)}
                    className={`w-full py-2 px-3 ${inputBg} border ${inputBorder} rounded-sm text-sm`}
                  >
                    {AFRICAN_UNIVERSITIES.map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                  {university === 'Other / Custom' && (
                    <input
                      type="text"
                      required
                      placeholder={t.custom_univ}
                      value={customUniversity}
                      onChange={e => setCustomUniversity(e.target.value)}
                      className={`w-full py-2 px-3 ${inputBg} border ${inputBorder} rounded-sm text-sm mt-1.5`}
                    />
                  )}
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-neutral-400">{t.preferred_language}</label>
                  <select
                    value={languagePref}
                    onChange={e => setLanguagePref(e.target.value as any)}
                    className={`w-full py-2 px-3 ${inputBg} border ${inputBorder} rounded-sm text-sm`}
                  >
                    <option value="Kiswahili">Sanifu (Kiswahili)</option>
                    <option value="English">Safi (Academic English)</option>
                    <option value="Sheng">Sheng / Street lingo</option>
                    <option value="Mixed">Mixed (Eng + Swa)</option>
                  </select>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-neutral-400">{t.how_learn}</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { style: 'visual', label: lang === 'sw' ? '🎨 Michoro & Visual' : '🎨 Visual & Charts' },
                      { style: 'practical', label: lang === 'sw' ? '🛠️ Mazoezi/Code' : '🛠️ Code / Exercises' },
                      { style: 'theoretical', label: lang === 'sw' ? '📖 Maandiko' : '📖 Textbook Read' },
                      { style: 'mixed', label: lang === 'sw' ? '🗺️ Mseto Mkuu' : '🗺️ Balanced Core' }
                    ].map(opt => (
                      <button
                        key={opt.style}
                        type="button"
                        onClick={() => setLearningStyle(opt.style as any)}
                        className={`text-left py-1.5 px-2.5 rounded-sm border transition-all text-[11px] ${
                          learningStyle === opt.style
                            ? 'bg-[#C15B32]/15 border-[#C15B32] text-[#C15B32] font-semibold'
                            : `${inputBg} ${inputBorder} text-neutral-400`
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-[#C15B32] hover:bg-black text-white py-3 rounded-sm text-xs uppercase tracking-widest font-bold transition-all shadow-md cursor-pointer"
                >
                  <ShieldCheck className="h-4.5 w-4.5" /> {t.register_new_user} <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </form>
        )}

        {/* Footer Credit Line Inside the Auth Card */}
        <div className="mt-6 pt-5 border-t border-black/10 dark:border-white/10 text-center space-y-2">
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#C15B32] font-semibold">
            {t.powered_by}
          </div>
          <div className="text-[9px] text-zinc-400 leading-normal">
            {t.creator_credits}
          </div>
        </div>

      </motion.div>
    </div>
  );
}
