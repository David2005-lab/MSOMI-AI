import React, { useState, useEffect } from 'react';
import { Mail, Server, Shield, Key, Send, HelpCircle, Check, AlertTriangle, Info } from 'lucide-react';
import { Language } from '../utils/languages';

interface SmtpCredentials {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  smtpFrom: string;
}

interface SmtpConfigProps {
  lang: Language;
  theme: 'light' | 'dark';
  onCredentialsChange?: (creds: SmtpCredentials | null) => void;
}

export default function SmtpConfig({ lang, theme, onCredentialsChange }: SmtpConfigProps) {
  const [smtpHost, setSmtpHost] = useState('smtp.gmail.com');
  const [smtpPort, setSmtpPort] = useState(587);
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');
  const [smtpFrom, setSmtpFrom] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [testEmail, setTestEmail] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<{ success: boolean; message: string; logs?: string[] } | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isOpenInfo, setIsOpenInfo] = useState(false);

  // Load custom SMTP credentials from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('msomi_smtp_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as SmtpCredentials;
        setSmtpHost(parsed.smtpHost || 'smtp.gmail.com');
        setSmtpPort(parsed.smtpPort || 587);
        setSmtpUser(parsed.smtpUser || '');
        setSmtpPass(parsed.smtpPass || '');
        setSmtpFrom(parsed.smtpFrom || '');
        if (onCredentialsChange) {
          onCredentialsChange(parsed);
        }
      } catch (e) {
        console.error('Failed to parse SMTP configuration:', e);
      }
    }
  }, []);

  const handleSave = () => {
    setSaveSuccess(false);
    const creds: SmtpCredentials = {
      smtpHost: smtpHost.trim(),
      smtpPort: Number(smtpPort),
      smtpUser: smtpUser.trim(),
      smtpPass: smtpPass.trim(),
      smtpFrom: smtpFrom.trim() || `"${smtpUser.split('@')[0] || 'Msomi'}" <${smtpUser}>`
    };

    localStorage.setItem('msomi_smtp_config', JSON.stringify(creds));
    setSaveSuccess(true);
    if (onCredentialsChange) {
      onCredentialsChange(creds);
    }
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleClear = () => {
    localStorage.removeItem('msomi_smtp_config');
    setSmtpHost('smtp.gmail.com');
    setSmtpPort(587);
    setSmtpUser('');
    setSmtpPass('');
    setSmtpFrom('');
    setTestStatus(null);
    if (onCredentialsChange) {
      onCredentialsChange(null);
    }
  };

  const handleTestConnection = async () => {
    if (!smtpUser || !smtpPass || !testEmail) {
      setTestStatus({
        success: false,
        message: lang === 'sw' 
          ? 'Tafadhali jaza barua pepe yako, nenosiri na barua pepe ya kufanyia majaribio.' 
          : 'Please enter SMTP username, password, and the test recipient email.'
      });
      return;
    }

    setIsTesting(true);
    setTestStatus(null);

    try {
      const response = await fetch('/api/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'email',
          recipient: testEmail.trim(),
          subject: lang === 'sw' ? 'Majaribio ya SMTP - Msomi AI' : 'SMTP Connection Test - Msomi AI',
          message: lang === 'sw' 
            ? `Hongera! Muunganisho wako wa SMTP unafanya kazi kikamilifu. Msomi AI itatumia njia hii kutuma Barua Pepe za kurejesha akaunti.`
            : `Congratulations! Your SMTP connection is verified and functioning flawlessly. Msomi AI will utilize this custom mail transport to dispatch account recovery instructions.`,
          isLiveMode: true,
          credentials: {
            smtpHost: smtpHost.trim(),
            smtpPort: Number(smtpPort),
            smtpUser: smtpUser.trim(),
            smtpPass: smtpPass.trim(),
            smtpFrom: smtpFrom.trim() || `"${smtpUser.split('@')[0] || 'Msomi AI'}" <${smtpUser}>`
          }
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setTestStatus({
          success: true,
          message: lang === 'sw'
            ? `Muunganisho Umefanikiwa! Barua pepe ya majaribio imetumwa kwa ${testEmail}.`
            : `Connection Test Successful! Test email successfully routed to ${testEmail}.`,
          logs: data.logs
        });
        // Auto-save on successful test
        handleSave();
      } else {
        setTestStatus({
          success: false,
          message: data.error || (lang === 'sw' ? 'Majaribio ya muunganisho wa SMTP yamefeli.' : 'SMTP connection test failed.'),
          logs: data.logs
        });
      }
    } catch (err: any) {
      setTestStatus({
        success: false,
        message: err.message || (lang === 'sw' ? 'Hitilafu ya mtandao ilitokea.' : 'Network connection failure.')
      });
    } finally {
      setIsTesting(false);
    }
  };

  const isDark = theme === 'dark';

  return (
    <div className={`p-4 rounded-sm border ${
      isDark 
        ? 'bg-[#18181B] border-zinc-800 text-zinc-300' 
        : 'bg-[#FCFAF7] border-black/10 text-neutral-800'
    }`}>
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#C15B32] flex items-center gap-1.5">
          <Shield className="h-3.5 w-3.5 text-[#C15B32]" />
          {lang === 'sw' ? 'Sanidi Mfumo wa SMTP' : 'Manage SMTP Gateway'}
        </h4>
        <button
          type="button"
          onClick={() => setIsOpenInfo(!isOpenInfo)}
          className={`text-[10px] uppercase font-mono font-bold flex items-center gap-1 px-1.5 py-0.5 rounded-sm transition-all cursor-pointer ${
            isOpenInfo 
              ? 'bg-[#C15B32] text-white' 
              : isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400' : 'bg-neutral-200 hover:bg-neutral-300 text-neutral-600'
          }`}
        >
          <HelpCircle className="h-3 w-3" />
          {lang === 'sw' ? 'SMTP ni nini?' : 'What is SMTP?'}
        </button>
      </div>

      {isOpenInfo && (
        <div className={`mb-4 p-3.5 rounded-sm border text-xs leading-relaxed space-y-3 ${
          isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-amber-500/5 border-amber-500/15'
        }`}>
          <div>
            <strong className="text-[#C15B32]">🖥️ SMTP (Simple Mail Transfer Protocol) ni nini?</strong>
            <p className="mt-1 text-zinc-400 dark:text-zinc-400 light:text-zinc-600">
              {lang === 'sw'
                ? 'Huu ni mfumo rasmi wa kutuma barua pepe (emails) kutoka kwenye programu ya kompyuta au tovuti kwenda kwa wateja au wanafunzi. Msomi AI inautumia kwa ajili ya kutuma Msimbo wa Siri (Verification Code) utakaokusaidia kurejesha akaunti yako pindi unaposahau nenosiri.'
                : 'SMTP is the industry-standard network protocol for transmitting emails from applications to custom mail domains. Msomi AI utilizes custom SMTP to dispatch secure verification codes so students can perform self-service credentials reset.'}
            </p>
          </div>

          <div>
            <strong className="text-[#C15B32]">🔑 Naipataje SMTP Yangu? (How to obtain coordinates)</strong>
            <ol className="list-decimal pl-4.5 mt-1 space-y-1 text-zinc-400 dark:text-zinc-400 light:text-zinc-600">
              <li>
                <strong>Gmail (Njia Rahisi / Free App Password)</strong>:
                <ul className="list-disc pl-4 mt-0.5 space-y-0.5">
                  <li>{lang === 'sw' ? '1. Nenda kwenye Ukurasa wa Google Account -> Security (Usalama).' : '1. Navigate to Google Account dashboard -> Security.'}</li>
                  <li>{lang === 'sw' ? '2. Washa "Verification ya hatua Mbili" (2-Step Verification).' : '2. Turn on "2-Step Verification" (required by Google for security).'}</li>
                  <li>{lang === 'sw' ? '3. Tafuta sehemu iliyoandikwa "App Passwords" (Nenosiri la Programu).' : '3. Search or navigate to "App Passwords".'}</li>
                  <li>{lang === 'sw' ? '4. Chagua programu ya Mail na uandike jina e.g. "Msomi AI" kisha bofya "Generate".' : '4. Select Custom Mail/App named e.g. "Msomi AI", then click Generate.'}</li>
                  <li>{lang === 'sw' ? '5. Nakili msimbo wa herufi 16 uliopewa (ambayo ni nenosiri lako la SMTP badala ya nenosiri lako la kawaida la Gmail!).' : '5. Copy the generated 16-character pass key (your secure SMTP password!).'}</li>
                </ul>
              </li>
              <li className="mt-1">
                <strong>{lang === 'sw' ? 'Huduma za Kitaalamu (API Gateways)' : 'Pro Mail Gateways'}</strong>:
                <span className="block mt-0.5">
                  {lang === 'sw'
                    ? 'Unaweza kutengeneza akaunti ya bure kwenye SendGrid, Brevo (Mailable), au Mailgun kupata host ya bure, port na nenosiri kamilifu la kiusalama.'
                    : 'Configure keys on robust API gateways such as SendGrid, Brevo, or Mailgun to secure a dedicated high-capacity transport.'}
                </span>
              </li>
            </ol>
          </div>
        </div>
      )}

      {/* INPUT FORM FIELDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div className="space-y-1">
          <label className="font-bold text-neutral-400 flex items-center gap-1">
            <Server className="h-3 w-3 text-[#C15B32]" /> {lang === 'sw' ? 'Mwenyeji (SMTP Host)' : 'SMTP Host'}
          </label>
          <input
            type="text"
            value={smtpHost}
            onChange={e => setSmtpHost(e.target.value)}
            placeholder="e.g. smtp.gmail.com"
            className={`w-full py-1.5 px-2 bg-transparent border rounded-sm focus:outline-none focus:border-[#C15B32] ${
              isDark ? 'border-zinc-800 text-zinc-200' : 'border-neutral-300 text-neutral-800'
            }`}
          />
        </div>

        <div className="space-y-1">
          <label className="font-bold text-neutral-400 flex items-center gap-1">
            <Info className="h-3 w-3 text-[#C15B32]" /> {lang === 'sw' ? 'Mlango (Port)' : 'Port'}
          </label>
          <input
            type="number"
            value={smtpPort}
            onChange={e => setSmtpPort(Number(e.target.value))}
            placeholder="e.g. 587 or 465"
            className={`w-full py-1.5 px-2 bg-transparent border rounded-sm focus:outline-none focus:border-[#C15B32] ${
              isDark ? 'border-zinc-800 text-zinc-200' : 'border-neutral-300 text-neutral-800'
            }`}
          />
        </div>

        <div className="space-y-1">
          <label className="font-bold text-neutral-400 flex items-center gap-1">
            <Mail className="h-3 w-3 text-[#C15B32]" /> {lang === 'sw' ? 'Jina la Mtumiaji (SMTP Username)' : 'SMTP Username'}
          </label>
          <input
            type="text"
            value={smtpUser}
            onChange={e => setSmtpUser(e.target.value)}
            placeholder="username@gmail.com"
            className={`w-full py-1.5 px-2 bg-transparent border rounded-sm focus:outline-none focus:border-[#C15B32] ${
              isDark ? 'border-zinc-800 text-zinc-200' : 'border-neutral-300 text-neutral-800'
            }`}
          />
        </div>

        <div className="space-y-1">
          <label className="font-bold text-neutral-400 flex items-center gap-1">
            <Key className="h-3 w-3 text-[#C15B32]" /> {lang === 'sw' ? 'Nenosiri (SMTP Password / App Password)' : 'SMTP Password / App Password'}
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={smtpPass}
              onChange={e => setSmtpPass(e.target.value)}
              placeholder="••••••••••••••••"
              className={`w-full py-1.5 pl-2 pr-8 bg-transparent border rounded-sm focus:outline-none focus:border-[#C15B32] ${
                isDark ? 'border-zinc-800 text-zinc-200' : 'border-neutral-300 text-neutral-800'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-2 text-zinc-500 hover:text-zinc-400"
            >
              <span className="text-[10px] uppercase font-mono tracking-tighter">
                {showPassword ? 'Ficha' : 'Onesha'}
              </span>
            </button>
          </div>
        </div>

        <div className="space-y-1 md:col-span-2">
          <label className="font-bold text-neutral-400 flex items-center gap-1">
            <Mail className="h-3 w-3 text-[#C15B32]" /> {lang === 'sw' ? 'Anwani ya Mtumaji (Mail From - Optional)' : 'Sender Email Identifier (SMTP From - Optional)'}
          </label>
          <input
            type="text"
            value={smtpFrom}
            onChange={e => setSmtpFrom(e.target.value)}
            placeholder='"Msomi AI Co-Pilot" <no-reply@msomi.ai>'
            className={`w-full py-1.5 px-2 bg-transparent border rounded-sm focus:outline-none focus:border-[#C15B32] ${
              isDark ? 'border-zinc-800 text-zinc-200' : 'border-neutral-300 text-neutral-800'
            }`}
          />
        </div>
      </div>

      {/* DYNAMIC ACTIONS */}
      <div className="mt-4 flex flex-wrap gap-2 justify-between items-center border-t border-black/10 dark:border-zinc-800 pt-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-1.5 bg-[#C15B32] hover:bg-[#a14b28] text-white rounded-sm font-semibold tracking-wider font-mono text-[10px] uppercase cursor-pointer"
          >
            {saveSuccess ? '💾 Safe!' : (lang === 'sw' ? 'HIFADHI CREDENTIALS' : 'SAVE SETTINGS')}
          </button>
          <button
            type="button"
            onClick={handleClear}
            className={`px-3 py-1.5 rounded-sm font-mono text-[10px] uppercase transition-all cursor-pointer ${
              isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400' : 'bg-neutral-200 hover:bg-neutral-300 text-neutral-600'
            }`}
          >
            {lang === 'sw' ? 'FUTA' : 'CLEAR'}
          </button>
        </div>

        {/* Save success message */}
        {saveSuccess && (
          <span className="text-[10px] text-emerald-500 font-mono flex items-center gap-1">
            <Check className="h-3.5 w-3.5" />
            {lang === 'sw' ? 'Hifadhi Imefanikiwa!' : 'Saved to browser cache successfully!'}
          </span>
        )}
      </div>

      {/* SMTP CONNECTION TEST UTILITY */}
      <div className={`mt-3.5 p-3 rounded-sm border ${
        isDark ? 'bg-zinc-900 border-zinc-800/80' : 'bg-neutral-100 border-black/5'
      }`}>
        <label className="block text-[11px] font-bold text-neutral-400 mb-1.5">
          👉 {lang === 'sw' ? 'Pima Muunganisho wako wa SMTP' : 'Test Your SMTP Transmission Pipeline'}
        </label>
        <div className="flex gap-2 text-xs">
          <input
            type="email"
            value={testEmail}
            onChange={e => setTestEmail(e.target.value)}
            placeholder={lang === 'sw' ? 'Barua pepe ya kuhakikiki e.g. fredrickdavid149@gmail.com' : 'Recipient profile mail e.g. user@gmail.com'}
            className={`flex-1 py-1.5 px-2 bg-transparent border rounded-sm focus:outline-none focus:border-[#C15B32] ${
              isDark ? 'border-zinc-800 text-zinc-200' : 'border-neutral-300 text-neutral-800'
            }`}
          />
          <button
            type="button"
            disabled={isTesting}
            onClick={handleTestConnection}
            className="px-3 py-1.5 bg-[#C15B32]/10 hover:bg-[#C15B32] text-[#C15B32] hover:text-white border border-[#C15B32]/40 rounded-sm font-mono text-[10px] uppercase tracking-wider flex items-center gap-1 cursor-pointer disabled:opacity-50"
          >
            {isTesting ? '...' : <Send className="h-3 w-3" />}
            {lang === 'sw' ? 'TUMA JARIBIO' : 'TEST SMTP'}
          </button>
        </div>

        {testStatus && (
          <div className={`mt-3 p-2.5 rounded-sm text-[11px] border leading-relaxed space-y-1.5 ${
            testStatus.success 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' 
              : 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400'
          }`}>
            <div className="font-bold flex items-center gap-1">
              {testStatus.success ? <Check className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
              {testStatus.message}
            </div>

            {testStatus.logs && testStatus.logs.length > 0 && (
              <div className="mt-1.5">
                <span className="font-mono text-[9px] font-bold block mb-0.5 text-zinc-500 uppercase">
                  {lang === 'sw' ? 'Kumbukumbu za Muamala (Direct Trace Logs):' : 'Transaction Trace Logs:'}
                </span>
                <div className="p-1.5 bg-black/40 text-[9px] font-mono rounded-sm max-h-32 overflow-y-auto space-y-0.5 text-zinc-300">
                  {testStatus.logs.map((log, idx) => (
                    <div key={idx} className="whitespace-pre-wrap">{log}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
