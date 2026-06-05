import React, { useState } from 'react';
import { InnovationProject } from '../types';
import { Lightbulb, Plus, Trash2, Rocket, Share2, Award, ArrowUpRight, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface InnovationLabProps {
  projects: InnovationProject[];
  onAddProject: (proj: InnovationProject) => void;
  onDeleteProject: (id: string) => void;
  onSelectProject: (proj: InnovationProject) => void;
  selectedProject: InnovationProject | null;
}

// Relatable inspiring community problem seeds
const LOCAL_SEEDS = [
  "Post-harvest retail losses in local organic open-air markets",
  "Erratic grid power cuts in university student hostels",
  "Affordable healthcare diagnostics for remote health outposts",
  "Smart water rationing monitoring for municipality reserves",
  "Micro-logistics for campus-wide food deliveries"
];

export default function InnovationLab({ 
  projects, 
  onAddProject, 
  onDeleteProject, 
  onSelectProject, 
  selectedProject 
}: InnovationLabProps) {
  
  const [pitchInput, setPitchInput] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const triggerAIAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pitchInput.trim() || !customTitle.trim()) return;

    setIsAnalyzing(true);
    setErrorText(null);

    try {
      // We will call the Express backend /api/chat specifically asking for INNOVATION_LAB mode structure
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `I have a community startup innovation idea:
Title: "${customTitle}"
Idea details: "${pitchInput}"
Please design a full technical and business blueprint blueprint according to the requested MSOMI AI layout guidelines.`,
          mode: "INNOVATION_LAB",
          history: [],
          profile: {
            name: "Innovator",
            university: "Kenyatta university",
            course: "Engineering",
            year: 3
          }
        })
      });

      if (!response.ok) {
        throw new Error("Unable to fetch innovation canvas from MSOMI AI core.");
      }

      const responseData = await response.json();
      const content = responseData.content || "";

      // We will parse the content or match structured sections to save to the database.
      // If parsing fails, we dump the whole text appropriately, but let's try to slice out the blocks or use regex.
      // Better yet, write a parsing helper that extracts:
      // - PROBLEM
      // - SOLUTION
      // - OPPORTUNITY
      // - BUILD PLAN
      // - SKILLS
      // - RISKS
      // - METRIC
      const extractSection = (tag: string, fulltext: string): string => {
        const regex = new RegExp(`(?:-?\\s*${tag}\\s*:?\\s*)([\\s\\S]*?)(?=(?:-?\\s*(?:PROBLEM|SOLUTION|OPPORTUNITY|BUILD PLAN|SKILLS/TOOLS NEEDED|RISKS & ASSUMPTIONS|IMPACT METRIC|Problem|Solution|Opportunity|Build plan|Skills/tools needed|Risks & assumptions|Impact metric)\\s*:)|$)`, 'i');
        const match = fulltext.match(regex);
        return match ? match[1].trim() : "";
      };

      const extractedProblem = extractSection("PROBLEM", content) || content.substring(0, 300) + "...";
      const extractedSolution = extractSection("SOLUTION", content) || "Details in full blueprint description.";
      const extractedOpportunity = extractSection("OPPORTUNITY", content) || "See main text file.";
      const extractedBuildPlan = extractSection("BUILD PLAN", content) || "See main text file.";
      const extractedTools = extractSection("SKILLS/TOOLS NEEDED", content) || "Standard setup.";
      const extractedRisks = extractSection("RISKS & ASSUMPTIONS", content) || "Moderate technical risks.";
      const extractedImpact = extractSection("IMPACT METRIC", content) || "Customer acquisition cost.";

      const newProject: InnovationProject = {
        id: Math.random().toString(36).substr(2, 9),
        title: customTitle,
        problem: extractedProblem,
        solution: extractedSolution,
        opportunity: extractedOpportunity,
        buildPlan: extractedBuildPlan,
        toolsNeeded: extractedTools,
        risks: extractedRisks,
        impactMetric: extractedImpact,
        createdAt: new Date().toLocaleDateString('en-GB')
      };

      onAddProject(newProject);
      setCustomTitle('');
      setPitchInput('');
    } catch (err: any) {
      console.error(err);
      setErrorText("Mambo vipi, error parsing response dataset. Please try with standard outlines.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const downloadCanvasAsDoc = (proj: InnovationProject) => {
    const rawContent = `MSOMI AI - Community Innovation blueprint
Title: ${proj.title}
Date: ${proj.createdAt}

[1] PROBLEM (Who suffers, what pain, why now):
${proj.problem}

[2] SOLUTION (MVP, how it works, what’s unique):
${proj.solution}

[3] OPPORTUNITY (Market/user segment, stakeholders, value):
${proj.opportunity}

[4] BUILD PLAN (7–14 day prototype steps):
${proj.buildPlan}

[5] SKILLS & TOOLS NEEDED (Minimum set):
${proj.toolsNeeded}

[6] RISKS & ASSUMPTIONS (What must be true):
${proj.risks}

[7] IMPACT METRIC (How to measure success):
${proj.impactMetric}

--- Generated securely on MSOMI AI Growth Canvas ---`;

    const blob = new Blob([rawContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${proj.title.toLowerCase().replace(/\s+/g, "_")}_blueprint.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div id="innovation-root" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Sidebar: Projects and Templates */}
      <div className="lg:col-span-4 space-y-4">
        <div className="bg-white rounded-sm border border-black/5 p-4 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-black/40 mb-2 font-mono flex items-center gap-1">
            <Rocket className="h-4 w-4 text-[#C15B32]" /> Pitch &amp; Incubate Blueprints
          </h3>
          <p className="text-xs text-black/60 leading-relaxed mb-4">
            Input a raw idea addressing a community crisis (traffic, trash, crops, solar). MSOMI AI outputs an authoritative bento structured Lean Innovation blueprint.
          </p>

          <form onSubmit={triggerAIAnalysis} className="space-y-3">
            <div>
              <label className="block text-[10px] uppercase font-bold text-black/50 font-mono mb-1">Project Title Name</label>
              <input 
                type="text" 
                required 
                placeholder="e.g., ShambaSmart Irrigation"
                value={customTitle}
                onChange={e => setCustomTitle(e.target.value)}
                className="w-full text-xs py-2 px-3 bg-[#FCFAF7] border border-black/10 rounded-sm text-black focus:outline-none focus:border-[#C15B32]"
              />
            </div>
            
            <div>
              <label className="block text-[10px] uppercase font-bold text-black/50 font-mono mb-1">State raw idea or problem</label>
              <textarea 
                required
                rows={3}
                placeholder="Describe what pain points you observed in town and how your system works..."
                value={pitchInput}
                onChange={e => setPitchInput(e.target.value)}
                className="w-full text-xs py-2 px-3 bg-[#FCFAF7] border border-black/10 rounded-sm text-black focus:outline-none focus:border-[#C15B32] resize-none"
              />
            </div>

            {/* Micro suggestions seeds */}
            <div className="space-y-1">
              <span className="text-[10px] text-black/40 font-bold uppercase tracking-wider font-mono block">💡 Suggestion seeds:</span>
              <div className="flex flex-col gap-1.5 pt-0.5">
                {LOCAL_SEEDS.slice(0, 3).map(seed => (
                  <button 
                    key={seed} 
                    type="button"
                    onClick={() => {
                      setCustomTitle(seed.split(' ')[0] + " Smart System");
                      setPitchInput(`A customized hardware/software configuration aiming to solve the issue of ${seed.toLowerCase()} inside our university neighborhood.`);
                    }}
                    className="text-[10px] text-left text-black/75 bg-[#F5F2ED] border border-black/5 rounded-sm p-1.5 hover:border-[#C15B32] hover:bg-[#EAE4DD] truncate cursor-pointer font-sans"
                  >
                    🌱 {seed}
                  </button>
                ))}
              </div>
            </div>

            {errorText && (
              <p className="text-[10px] text-red-700 bg-red-50 p-2 rounded-sm border border-red-200">
                {errorText}
              </p>
            )}

            <button
              type="submit"
              disabled={isAnalyzing || !customTitle.trim() || !pitchInput.trim()}
              className="w-full mt-2 flex items-center justify-center gap-1.5 bg-[#C15B32] text-white font-bold hover:bg-[#1A1A1A] py-2.5 rounded-sm text-xs uppercase tracking-widest transition-all shadow-sm cursor-pointer"
            >
              <Plus className={`h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
              {isAnalyzing ? 'Analyzing Core Metrics...' : 'Incubate Idea'}
            </button>
          </form>
        </div>

        {/* Saved Ideas List */}
        <div className="bg-white rounded-sm border border-black/5 p-4 shadow-sm">
          <h4 className="text-xs font-bold text-black/40 mb-2 font-mono uppercase tracking-wider">
            Active Blueprints ({projects.length})
          </h4>

          {projects.length > 0 ? (
            <div className="space-y-1.5">
              {projects.map(proj => (
                <div 
                  key={proj.id}
                  className={`p-2.5 rounded-sm border text-xs flex justify-between items-center transition-all ${
                    selectedProject?.id === proj.id 
                      ? 'bg-[#C15B32]/10 border-[#C15B32] text-[#C15B32] font-semibold' 
                      : 'bg-[#F5F2ED]/50 border-black/5 text-black/75 hover:bg-[#F5F2ED]'
                  }`}
                >
                  <button 
                    onClick={() => onSelectProject(proj)}
                    className="flex-1 text-left font-serif italic truncate hover:underline flex items-center gap-1 cursor-pointer font-medium"
                  >
                    💡 {proj.title}
                  </button>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => onDeleteProject(proj.id)}
                      className="text-black/35 hover:text-red-600 p-1 rounded transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[10px] text-black/40 text-center py-4 bg-[#F5F2ED]/30 border border-black/5 border-dashed rounded-sm font-mono">
              No incubated blueprints yet. Enter an idea above to start.
            </p>
          )}
        </div>
      </div>

      {/* Main Canvas: Lean Bento Details represent the 7 pillars */}
      <div className="lg:col-span-8">
        {selectedProject ? (
          <div className="bg-white rounded-sm border border-black/5 p-5 md:p-6 shadow-sm space-y-5">
            <div className="flex justify-between items-start border-b border-black/5 pb-3">
              <div>
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#C15B32] bg-[#C15B32]/10 px-2.5 py-1 rounded-sm border border-transparent">
                  INCUBATOR IN OPERATION
                </span>
                <h2 className="text-xl font-serif italic font-bold text-[#1A1A1A] mt-2 flex items-center gap-1">
                  💡 {selectedProject.title}
                </h2>
              </div>
              
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => downloadCanvasAsDoc(selectedProject)}
                  className="flex items-center gap-1 bg-[#F5F2ED] hover:bg-[#EAE4DD] border border-black/10 text-black/70 px-3 py-1.5 rounded-sm text-xs font-semibold cursor-pointer"
                >
                  <Share2 className="h-3 w-3" /> Download txt
                </button>
              </div>
            </div>

            {/* BENTO LAYOUT */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Problem block */}
              <div className="bg-[#FCFAF7] p-4 rounded-sm border border-black/10 space-y-1.5 md:col-span-2">
                <span className="text-[9px] uppercase font-bold text-[#C15B32] font-mono tracking-widest">
                  ⚠️ 1. COMMUNITY PLIGHT (PROBLEM)
                </span>
                <p className="text-xs text-black/80 leading-relaxed font-sans">
                  {selectedProject.problem}
                </p>
              </div>

              {/* Solution Block */}
              <div className="bg-[#FCFAF7] p-4 rounded-sm border border-black/10 space-y-1.5 border-l-4 border-l-[#C15B32]">
                <span className="text-[9px] uppercase font-bold text-[#C15B32] font-mono tracking-widest flex items-center gap-1">
                  🏆 2. PROPOSED BLUEPRINT (MVP)
                </span>
                <p className="text-xs text-black/80 leading-relaxed font-sans">
                  {selectedProject.solution}
                </p>
              </div>

              {/* Opportunity Block */}
              <div className="bg-[#FCFAF7] p-4 rounded-sm border border-black/10 space-y-1.5">
                <span className="text-[9px] uppercase font-bold text-black/50 font-mono tracking-widest">
                  💼 3. SEGMENTS &amp; PARTNERS (OPPORTUNITY)
                </span>
                <p className="text-xs text-black/80 leading-relaxed font-sans">
                  {selectedProject.opportunity}
                </p>
              </div>

              {/* Build Plan Block */}
              <div className="bg-[#FCFAF7] p-4 rounded-sm border border-black/10 space-y-1.5 md:col-span-2">
                <span className="text-[9px] uppercase font-bold text-[#C15B32] font-mono tracking-widest">
                  ⏰ 4. FAST-TRACK BUILD PLAN (7-14 DAYS STEPS)
                </span>
                <div className="text-xs text-black/80 whitespace-pre-line leading-relaxed font-sans">
                  {selectedProject.buildPlan}
                </div>
              </div>

              {/* Tools block */}
              <div className="bg-[#FCFAF7] p-4 rounded-sm border border-black/10 space-y-1.5">
                <span className="text-[9px] uppercase font-bold text-black/50 font-mono tracking-widest">
                  🛠️ 5. MINIMUM SKILLS / TOOLS
                </span>
                <p className="text-xs text-black/80 leading-relaxed font-sans">
                  {selectedProject.toolsNeeded}
                </p>
              </div>

              {/* Risks block */}
              <div className="bg-[#FCFAF7] p-4 rounded-sm border border-black/10 space-y-1.5">
                <span className="text-[9px] uppercase font-bold text-black/50 font-mono tracking-widest">
                  ⚡ 6. CRITICAL RISKS / ASSUMPTIONS
                </span>
                <p className="text-xs text-black/80 leading-relaxed font-sans">
                  {selectedProject.risks}
                </p>
              </div>

              {/* Impact Metric block */}
              <div className="bg-[#C15B32]/5 p-4 rounded-sm border border-[#C15B32]/20 space-y-1.5 md:col-span-2">
                <span className="text-[9px] uppercase font-bold text-[#C15B32] font-mono tracking-widest flex items-center gap-1">
                  📈 7. VALUE IMPACT METRIC
                </span>
                <p className="text-xs text-black font-semibold leading-relaxed font-sans">
                  {selectedProject.impactMetric}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-black/5 flex justify-between items-center text-[10px] text-black/40">
              <span className="flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5 text-[#C15B32]" /> Grounded in African local economics</span>
              <span>Collaborate with your study group or project mates!</span>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-sm border border-black/5 p-8 text-center flex flex-col items-center justify-center min-h-[400px] shadow-sm">
            <div className="p-4 bg-[#C15B32]/10 text-[#C15B32] rounded-none border border-[#C15B32]/10 mb-3 animate-pulse">
              <Lightbulb className="h-8 w-8 text-[#C15B32]" />
            </div>
            <h3 className="text-base font-serif italic text-black font-semibold">No Blueprint Loaded</h3>
            <p className="text-xs text-black/50 max-w-sm mx-auto mt-1 leading-relaxed font-sans">
              Select an incubated blueprint on the sidebar or pitch and analyze a new community project idea! Let&apos;s build African-focused solutions.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
