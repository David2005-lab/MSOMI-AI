import React, { useState, useEffect } from 'react';
import { StudentProfile, InnovationProject, StudentCV } from '../types';
import { FileText, Plus, Trash2, Copy, Check, Download, ToggleLeft, ToggleRight, Sparkles, Award, Star, Briefcase, GraduationCap, MapPin, Mail, Phone, ExternalLink } from 'lucide-react';

interface CVBuilderProps {
  profile: StudentProfile;
  innovationProjects: InnovationProject[];
}

export default function CVBuilder({ profile, innovationProjects }: CVBuilderProps) {
  const [cv, setCv] = useState<StudentCV>({
    id: 'cv-active',
    fullName: profile.name,
    email: profile.name.toLowerCase().replace(/\s+/g, '') + '@gmail.com',
    phone: '+255 712 345 678',
    location: 'Dar es Salaam, Tanzania',
    linkedin: 'linkedin.com/in/' + profile.name.toLowerCase().replace(/\s+/g, '-'),
    github: 'github.com/' + profile.name.toLowerCase().replace(/\s+/g, ''),
    summary: `Ambitious and results-driven ${profile.course} student at ${profile.university}. Possesses highly calibrated analytical strengths in ${profile.strengths || 'critical thinking and systemic analysis'}. Deeply passionate about regional innovation in sectors like ${profile.interests || 'agribusiness, finance, and software development'}.`,
    education: {
      institution: profile.university,
      degree: `Bachelor of Science in ${profile.course}`,
      duration: `2024 - Present (Year ${profile.year})`,
      gpa: `${profile.difficultyLevel + 0.3}.0 / 5.0`,
      achievements: 'Dean\'s Honor Roll student, Class Representative'
    },
    skills: ['Analytical Logic', 'System design', 'Technical Research', 'East African FinTech solutions'],
    projects: innovationProjects.map(proj => ({
      title: proj.title,
      description: proj.problem + '. Solution: ' + proj.solution,
      role: 'Project Innovator'
    })),
    experience: [
      {
        role: 'Creative Developer & Student Lead',
        organization: 'MSOMI Research Group',
        duration: 'Jan 2025 - Present',
        responsibilities: 'Collaborated with multidisciplinary study cohorts to draft analytical system designs and software blueprints.'
      }
    ],
    references: 'Available upon academic request.'
  });

  const [activeTemplate, setActiveTemplate] = useState<'swiss' | 'tech' | 'editorial'>('swiss');
  const [newSkill, setNewSkill] = useState('');
  const [copied, setCopied] = useState(false);

  // Sync profile details if changed
  useEffect(() => {
    setCv(prev => ({
      ...prev,
      fullName: profile.name,
      education: {
        ...prev.education,
        institution: profile.university,
        degree: `Bachelor of Science in ${profile.course}`,
        duration: `2024 - Present (Year ${profile.year})`
      }
    }));
  }, [profile]);

  // Pull new innovation projects automatically
  const handleImportProjects = () => {
    const freshProjects = innovationProjects.map(proj => ({
      title: proj.title,
      description: `${proj.problem}. Metrik: ${proj.impactMetric}`,
      role: 'Lead Architect & Pitcher'
    }));
    setCv(prev => ({
      ...prev,
      projects: freshProjects.length > 0 ? freshProjects : prev.projects
    }));
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    if (cv.skills.includes(newSkill.trim())) return;
    setCv(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
    setNewSkill('');
  };

  const handleRemoveSkill = (skill: string) => {
    setCv(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  };

  // Add work experience
  const handleAddExperience = () => {
    const newExp = {
      role: 'Kalamu ya Msomi (Tutor Assistant)',
      organization: 'Department Study Center',
      duration: 'Mar 2025 - Present',
      responsibilities: 'Assisted lower cohorts with complex practice Drills and syllabus trackers.'
    };
    setCv(prev => ({ ...prev, experience: [...prev.experience, newExp] }));
  };

  const handleRemoveExperience = (index: number) => {
    setCv(prev => ({
      ...prev,
      experience: prev.experience.filter((_, idx) => idx !== index)
    }));
  };

  // Add custom project manually
  const handleAddCustomProject = () => {
    setCv(prev => ({
      ...prev,
      projects: [
        ...prev.projects,
        {
          title: 'Custom Academic Research Paper',
          description: 'A comprehensive feasibility report regarding regional development models.',
          role: 'Primary Co-Author'
        }
      ]
    }));
  };

  const handleRemoveProject = (index: number) => {
    setCv(prev => ({
      ...prev,
      projects: prev.projects.filter((_, idx) => idx !== index)
    }));
  };

  const handleCopyPlainText = () => {
    const text = `
=========================================
${cv.fullName.toUpperCase()}
=========================================
${cv.location} | ${cv.phone} | ${cv.email}
LinkedIn: ${cv.linkedin || 'N/A'} | GitHub: ${cv.github || 'N/A'}

PROFESSIONAL SUMMARY:
${cv.summary}

EDUCATION:
- Institution: ${cv.education.institution}
- Degree: ${cv.education.degree} (${cv.education.duration})
- GPA: ${cv.education.gpa || 'N/A'}
- Academic Merits: ${cv.education.achievements || 'N/A'}

AREAS OF EXPERTISE:
${cv.skills.join(', ')}

CORE PROJECTS DEVELOPED:
${cv.projects.map((p, i) => `${i + 1}. ${p.title} (${p.role || 'Contributor'})
   Description: ${p.description}`).join('\n')}

LEADERSHIP & EXPERIENCE:
${cv.experience.map((e, i) => `${i + 1}. ${e.role} at ${e.organization}
   Duration: ${e.duration}
   Responsibilities: ${e.responsibilities}`).join('\n')}

REFERENCES:
${cv.references}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="cv-builder-workspace" className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-lg border border-black/5 shadow-sm">
        <div>
          <h2 className="text-lg font-serif italic text-[#1A1A1A] font-bold">Uandishi wa Kitaalamu wa CV (Executive CV Generator)</h2>
          <p className="text-xs text-black/55">
            Optimize your university milestones, dynamic research projects, and skills into high-impact academic CV templates below.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCopyPlainText}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-black hover:bg-black/85 text-white text-xs font-bold rounded-sm shadow-sm transition-all uppercase tracking-wide cursor-pointer"
          >
            {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />} {copied ? 'Copied' : 'Siri / Copy CV Text'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: interactive editor controls */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#F5F2ED] border border-black/5 p-4 rounded-sm space-y-4">
            <h3 className="text-[10px] font-mono uppercase text-black/40 font-bold tracking-widest border-b border-black/5 pb-1.5">Mabadiliko ya CV (Interactive Editor)</h3>
            
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-black/75">Email Address</label>
                <input
                  type="email"
                  value={cv.email}
                  onChange={e => setCv({ ...cv, email: e.target.value })}
                  className="w-full p-2 bg-white border border-black/10 rounded-sm focus:outline-none focus:border-[#C15B32]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-black/75">Phone Number</label>
                <input
                  type="text"
                  value={cv.phone}
                  onChange={e => setCv({ ...cv, phone: e.target.value })}
                  className="w-full p-2 bg-white border border-black/10 rounded-sm focus:outline-none focus:border-[#C15B32]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-black/75">Target Location</label>
                <input
                  type="text"
                  value={cv.location}
                  onChange={e => setCv({ ...cv, location: e.target.value })}
                  className="w-full p-2 bg-white border border-black/10 rounded-sm focus:outline-none focus:border-[#C15B32]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-semibold text-black/75">LinkedIn URL</label>
                  <input
                    type="text"
                    value={cv.linkedin}
                    onChange={e => setCv({ ...cv, linkedin: e.target.value })}
                    className="w-full p-2 bg-white border border-black/10 rounded-sm focus:outline-none focus:border-[#C15B32]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-black/75">GitHub Profile</label>
                  <input
                    type="text"
                    value={cv.github}
                    onChange={e => setCv({ ...cv, github: e.target.value })}
                    className="w-full p-2 bg-white border border-black/10 rounded-sm focus:outline-none focus:border-[#C15B32]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#1A1A1A] flex items-center justify-between">
                  <span>Professional Summary</span>
                  <span className="text-[9px] text-[#C15B32] font-mono">Calibrated and Smart</span>
                </label>
                <textarea
                  rows={4}
                  value={cv.summary}
                  onChange={e => setCv({ ...cv, summary: e.target.value })}
                  className="w-full p-2 bg-white border border-black/10 rounded-sm focus:outline-none focus:border-[#C15B32] leading-relaxed"
                />
              </div>

              <div className="pt-3 border-t border-black/5 space-y-2">
                <div className="flex justify-between items-center text-[10px] font-mono text-black/55 uppercase tracking-wide">
                  <span>Academic Expertise</span>
                  <span>Press Enter to Add</span>
                </div>
                <form onSubmit={handleAddSkill} className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="e.g. Statistical Economics"
                    value={newSkill}
                    onChange={e => setNewSkill(e.target.value)}
                    className="flex-1 p-2 bg-white border border-black/10 rounded-sm focus:outline-none focus:border-[#C15B32]"
                  />
                  <button
                    type="submit"
                    className="bg-[#C15B32] text-white px-3 text-xs font-bold rounded-sm hover:bg-[#1A1A1A] cursor-pointer"
                  >
                    +
                  </button>
                </form>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {cv.skills.map(sk => (
                    <span
                      key={sk}
                      onClick={() => handleRemoveSkill(sk)}
                      className="bg-white hover:bg-red-50 hover:text-red-700 cursor-pointer text-[10px] border border-black/5 px-2 py-0.5 rounded-sm flex items-center gap-1 transition-all"
                    >
                      {sk} <span className="text-black/30 hover:text-red-700 font-mono">✕</span>
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-black/5 space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono text-black/55 uppercase tracking-wider">Research & Innovation Projects</span>
                  <button
                    onClick={handleImportProjects}
                    className="text-[9px] bg-[#C15B32]/10 text-[#C15B32] px-2 py-0.5 rounded-sm font-bold uppercase hover:bg-[#C15B32]/20 cursor-pointer"
                  >
                    Import From Lab ({innovationProjects.length})
                  </button>
                </div>
                
                <div className="space-y-1.5">
                  {cv.projects.map((proj, idx) => (
                    <div key={idx} className="bg-white border border-black/5 p-2 rounded-sm flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <span className="font-bold text-[11px] block text-black truncate">{proj.title}</span>
                        <span className="text-[9px] text-[#C15B32] font-mono">{proj.role}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveProject(idx)}
                        className="text-black/30 hover:text-red-600 font-bold font-mono text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={handleAddCustomProject}
                    className="w-full text-center py-1.5 border border-dashed border-black/20 text-black/50 hover:text-black hover:border-black/40 text-[10px] uppercase font-bold transition-all rounded-sm cursor-pointer"
                  >
                    + Add Custom Academic Work
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-black/5 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono text-black/55 uppercase tracking-wider">Leadership & Volunteer Exp</span>
                  <button
                    onClick={handleAddExperience}
                    className="text-[9px] text-[#C15B32] font-bold uppercase tracking-wider hover:underline cursor-pointer"
                  >
                    + Add Experience
                  </button>
                </div>

                <div className="space-y-1.5">
                  {cv.experience.map((exp, idx) => (
                    <div key={idx} className="bg-white border border-black/5 p-2 rounded-sm flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <span className="font-bold text-[11px] block text-black truncate">{exp.role}</span>
                        <span className="text-[9px] text-black/50">{exp.organization}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveExperience(idx)}
                        className="text-black/30 hover:text-red-600 font-bold font-mono text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Right Side: Visual representation and layout templates selector */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="flex bg-[#F5F2ED] p-2.5 rounded-sm border border-black/5 items-center justify-between gap-3">
            <span className="text-[10px] font-mono text-black/55 uppercase tracking-wider font-bold">Chagua Staili ya CV (Academic Templates)</span>
            <div className="flex gap-1">
              <button
                onClick={() => setActiveTemplate('swiss')}
                className={`px-3 py-1 text-[10px] font-mono uppercase font-bold transition-all rounded-sm cursor-pointer ${
                  activeTemplate === 'swiss' ? 'bg-[#1A1A1A] text-white shadow-sm' : 'bg-white hover:bg-[#EAE4DD] text-black/60'
                }`}
              >
                Modern Swiss
              </button>
              <button
                onClick={() => setActiveTemplate('tech')}
                className={`px-3 py-1 text-[10px] font-mono uppercase font-bold transition-all rounded-sm cursor-pointer ${
                  activeTemplate === 'tech' ? 'bg-[#1A1A1A] text-white shadow-sm' : 'bg-white hover:bg-[#EAE4DD] text-black/60'
                }`}
              >
                Monospace Tech
              </button>
              <button
                onClick={() => setActiveTemplate('editorial')}
                className={`px-3 py-1 text-[10px] font-mono uppercase font-bold transition-all rounded-sm cursor-pointer ${
                  activeTemplate === 'editorial' ? 'bg-[#1A1A1A] text-white shadow-sm' : 'bg-white hover:bg-[#EAE4DD] text-black/60'
                }`}
              >
                Editorial Classic
              </button>
            </div>
          </div>

          <div 
            id="cv-rendering-board" 
            className="bg-white border border-black/10 rounded-sm p-6 md:p-8 shadow-sm text-left transition-all max-h-[750px] overflow-y-auto"
            style={{
              fontFamily: activeTemplate === 'editorial' ? 'var(--font-serif)' : activeTemplate === 'tech' ? 'var(--font-mono)' : 'var(--font-sans)',
              fontSize: activeTemplate === 'tech' ? '11px' : '13px'
            }}
          >
            {/* Header section depending on template */}
            {activeTemplate === 'swiss' && (
              <div className="space-y-4">
                <div className="border-b-2 border-[#1A1A1A] pb-4">
                  <h1 className="text-2xl font-black tracking-tight text-[#1A1A1A] uppercase">{cv.fullName}</h1>
                  <span className="text-xs font-mono text-[#C15B32] font-semibold tracking-wider mt-1 block">STUDENT RESEARCH FELLOW & INNOVATOR</span>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-black/60 mt-2 font-mono">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {cv.location}</span>
                    <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {cv.email}</span>
                    <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {cv.phone}</span>
                  </div>
                </div>

                <div className="space-y-5 py-2">
                  <div className="space-y-1.5">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-[#C15B32] font-mono">Professional Summary</h2>
                    <p className="text-[#1A1A1A]/85 text-xs leading-relaxed">{cv.summary}</p>
                  </div>

                  <div className="space-y-3">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-[#C15B32] font-mono">Education & Qualifications</h2>
                    <div className="border-l border-black/10 pl-3 space-y-2">
                      <div className="flex justify-between items-start text-xs">
                        <div>
                          <h3 className="font-bold text-black">{cv.education.degree}</h3>
                          <p className="text-black/55">{cv.education.institution}</p>
                        </div>
                        <span className="font-mono text-black/50 italic shrink-0">{cv.education.duration}</span>
                      </div>
                      <div className="text-[11px] text-black/75 space-y-1">
                        {cv.education.gpa && <p className="font-mono"><strong>Academic Calibrated Grade Goal / GPA:</strong> {cv.education.gpa}</p>}
                        {cv.education.achievements && <p><strong>Academic Merits & Honors:</strong> {cv.education.achievements}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-[#C15B32] font-mono">Areas of Expertise</h2>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {cv.skills.map((s, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-black/80 font-sans">
                          <span className="text-[#C15B32]">•</span> {s}
                        </div>
                      ))}
                    </div>
                  </div>

                  {cv.projects.length > 0 && (
                    <div className="space-y-3">
                      <h2 className="text-xs font-bold uppercase tracking-wider text-[#C15B32] font-mono">Academic Research & Products Developed</h2>
                      <div className="space-y-2.5">
                        {cv.projects.map((proj, i) => (
                          <div key={i} className="border-l border-black/10 pl-3">
                            <div className="flex justify-between items-baseline">
                              <h3 className="font-bold text-xs text-black">{proj.title}</h3>
                              <span className="text-[10px] font-mono text-[#C15B32]">{proj.role}</span>
                            </div>
                            <p className="text-[11px] text-black/65 mt-1 leading-relaxed">{proj.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {cv.experience.length > 0 && (
                    <div className="space-y-3">
                      <h2 className="text-xs font-bold uppercase tracking-wider text-[#C15B32] font-mono">Leadership & Co-curricular Roles</h2>
                      <div className="space-y-2.5">
                        {cv.experience.map((exp, i) => (
                          <div key={i} className="border-l border-black/10 pl-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-bold text-xs text-black">{exp.role}</h3>
                                <p className="text-[10px] text-black/55">{exp.organization}</p>
                              </div>
                              <span className="text-[10px] font-mono text-black/50 shrink-0">{exp.duration}</span>
                            </div>
                            <p className="text-[11px] text-black/65 mt-1 leading-relaxed">{exp.responsibilities}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-2">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-[#C15B32] font-mono mb-1">References</h2>
                    <p className="text-xs text-black/60 italic leading-snug">{cv.references}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTemplate === 'tech' && (
              <div className="space-y-5 font-mono">
                <div className="pb-3 border-b border-dashed border-black/20">
                  <h1 className="text-xl font-bold uppercase tracking-tight">{`<< ${cv.fullName} >>`}</h1>
                  <p className="text-black/50 mt-1"># ACADEMIC SPECIFICATION PORT: CS_STUDENT_CO_PILOT</p>
                  <div className="mt-2 text-black/65 space-y-0.5">
                    <p>LOC: {cv.location}</p>
                    <p>PHO: {cv.phone}</p>
                    <p>EML: {cv.email}</p>
                    <p>LN: {cv.linkedin}</p>
                    <p>GH: {cv.github}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="font-bold text-black uppercase tracking-wider">[{' '}Summary{' '}]</p>
                    <p className="text-black/75 leading-relaxed">{cv.summary}</p>
                  </div>

                  <div className="space-y-2">
                    <p className="font-bold text-black uppercase tracking-wider">[{' '}Education Systems{' '}]</p>
                    <div className="pl-4 space-y-2 border-l border-dashed border-black/20">
                      <p><strong>INSTITUTION:</strong> {cv.education.institution}</p>
                      <p><strong>CERTIFICATE:</strong> {cv.education.degree}</p>
                      <p><strong>DURATION:</strong> {cv.education.duration}</p>
                      <p><strong>METRIC:</strong> GPA {cv.education.gpa}</p>
                      <p><strong>AWARDS:</strong> {cv.education.achievements}</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="font-bold text-black uppercase tracking-wider">[{' '}Technical Stack{' '}]</p>
                    <p className="text-black/80">{cv.skills.join(' | ')}</p>
                  </div>

                  {cv.projects.length > 0 && (
                    <div className="space-y-3">
                      <p className="font-bold text-black uppercase tracking-wider">[{' '}Active Repos & Innovation Blueprints{' '}]</p>
                      {cv.projects.map((p, idx) => (
                        <div key={idx} className="pl-4 border-l border-dashed border-black/20 space-y-1">
                          <p className="font-bold text-[#C15B32]">*{' '}{p.title} ~ {p.role}</p>
                          <p className="text-black/65 text-[10px] leading-relaxed">{p.description}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {cv.experience.length > 0 && (
                    <div className="space-y-3">
                      <p className="font-bold text-black uppercase tracking-wider">[{' '}System Log: Leadership & Contribution{' '}]</p>
                      {cv.experience.map((e, idx) => (
                        <div key={idx} className="pl-4 border-l border-dashed border-black/20 space-y-1">
                          <p className="font-bold">{e.role} @ {e.organization} ({e.duration})</p>
                          <p className="text-[10px] text-black/65 leading-relaxed">{e.responsibilities}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="pt-2">
                    <p className="font-bold text-black uppercase tracking-wider text-xs">[{' '}References{' '}]</p>
                    <p className="text-black/60 italic">{cv.references}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTemplate === 'editorial' && (
              <div className="space-y-6 font-serif">
                <div className="text-center pb-6 border-b border-black/15">
                  <h1 className="text-3xl font-normal text-black font-serif italic">{cv.fullName}</h1>
                  <p className="text-xs tracking-[0.2em] font-sans font-bold text-black/50 uppercase mt-1">CURRICULUM VITAE</p>
                  <p className="text-xs text-black/50 italic mt-3 font-serif">
                    {cv.location} • {cv.phone} • {cv.email}
                  </p>
                  <p className="text-[10px] text-black/45 font-sans mt-1">
                    {cv.linkedin} | {cv.github}
                  </p>
                </div>

                <div className="space-y-5 text-xs">
                  <div className="space-y-1">
                    <h2 className="text-xs font-sans font-bold uppercase tracking-widest text-[#1A1A1A] border-b border-black/5 pb-1">Academic Statement</h2>
                    <p className="text-black/85 leading-relaxed font-serif text-sm italic py-1 border-l-2 border-[#C15B32] pl-3">
                      &quot;{cv.summary}&quot;
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-xs font-sans font-bold uppercase tracking-widest text-[#1A1A1A] border-b border-black/5 pb-1">Education Background</h2>
                    <div className="py-1">
                      <div className="flex justify-between font-serif mb-1">
                        <span className="font-bold text-black italic text-sm">{cv.education.institution}</span>
                        <span className="font-sans text-[10px] text-black/50 uppercase tracking-widest">{cv.education.duration}</span>
                      </div>
                      <p className="text-black/80 font-serif italic">{cv.education.degree}</p>
                      <p className="text-[11px] text-black/60 mt-2">
                        {cv.education.gpa && <span>GPA status: {cv.education.gpa}</span>}
                        {cv.education.achievements && <span className="block italic mt-0.5">• Honors: {cv.education.achievements}</span>}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-xs font-sans font-bold uppercase tracking-widest text-[#1A1A1A] border-b border-black/5 pb-1">Scholarly Areas of Study</h2>
                    <div className="flex flex-wrap gap-x-6 gap-y-1.5 pt-1">
                      {cv.skills.map((s, i) => (
                        <span key={i} className="text-black/80 italic font-serif">
                          — {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {cv.projects.length > 0 && (
                    <div className="space-y-3">
                      <h2 className="text-xs font-sans font-bold uppercase tracking-widest text-[#1A1A1A] border-b border-black/5 pb-1">Pitches, Prototypes, and Papers</h2>
                      <div className="space-y-3 pt-1">
                        {cv.projects.map((proj, i) => (
                          <div key={i} className="space-y-0.5">
                            <div className="flex justify-between items-baseline font-serif">
                              <span className="font-bold text-black italic text-sm">{proj.title}</span>
                              <span className="font-sans text-[9px] text-[#C15B32] uppercase tracking-wider font-semibold">{proj.role}</span>
                            </div>
                            <p className="text-black/65 font-serif text-xs italic mt-0.5">{proj.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {cv.experience.length > 0 && (
                    <div className="space-y-3">
                      <h2 className="text-xs font-sans font-bold uppercase tracking-widest text-[#1A1A1A] border-b border-black/5 pb-1">Extracurricular Record</h2>
                      <div className="space-y-3 pt-1">
                        {cv.experience.map((exp, i) => (
                          <div key={i} className="space-y-0.5">
                            <div className="flex justify-between items-baseline font-serif">
                              <span className="font-bold text-black italic text-sm">{exp.role}</span>
                              <span className="font-sans text-[9px] text-[#1A1A1A]/40 uppercase tracking-widest">{exp.duration}</span>
                            </div>
                            <p className="text-black/55 text-[11px] font-sans font-semibold mt-0.5">{exp.organization}</p>
                            <p className="text-black/65 font-serif text-xs leading-relaxed mt-1">{exp.responsibilities}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-2">
                    <h2 className="text-xs font-sans font-bold uppercase tracking-widest text-[#1A1A1A] border-b border-black/5 pb-1">Academic Attestation</h2>
                    <p className="text-black/65 font-serif italic pt-1">{cv.references}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
