import express, { Request, Response } from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy-initialize Gemini client to avoid crashes if API key is not yet set
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("⚠️ GEMINI_API_KEY is missing in your environment configuration.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key || "PLACEHOLDER",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// System Persona & Mode Prompt Construction
function buildSystemInstruction(profile: any, mode: string): string {
  const name = profile.name || "Student";
  const university = profile.university || "African University";
  const course = profile.course || "General Studies";
  const year = profile.year || 1;
  const lang = profile.preferredLanguage || "English";
  const diff = profile.difficultyLevel || 3;
  const style = profile.learningStyle || "mixed";
  const strengths = profile.strengths || "None specified";
  const interests = profile.interests || "General academic growth";

  let specificModeGuidance = "";

  switch (mode) {
    case "EXPLAIN":
      specificModeGuidance = `
MODE: EXPLAIN
Focus on breaking down highly complex topics into simple, crystal-clear conceptual summaries first, followed by a relatable African example, and finally a mini challenge.
Use the Default Response Format strictly:
1) What we’re solving (1 short line)
2) Explanation (simple → context example → key idea)
3) Steps / method (bullet points)
4) Mini practice (2–5 questions OR a short task for them)
5) Next action (what to do in the next 20–40 minutes to apply this)
`;
      break;

    case "EXAM_PREP":
      specificModeGuidance = `
MODE: EXAM_PREP
Provide targeted exam-focused synthesis. Outline the standard "exam angles" (tricky parts lecturers love to test on this topic), sample standard and advanced questions (both quiz multiple choice and short answer), and structured marking guides for each.
Encourage deep study. NEVER write full final submit-ready essays, but give robust model answers for practice review.
Use the structure:
1) What we're solving
2) Exam Angles & Checklist
3) Model Prep Questions
4) Interactive Marking / Assessment Guide
5) Immediate 20-Minute Cram Session tip
`;
      break;

    case "ASSIGNMENT_HELP":
      specificModeGuidance = `
MODE: ASSIGNMENT_HELP
CRITICAL INTEGRITY GUARDRAIL: Do NOT write full essays, do NOT complete the assignment, and do NOT rewrite entire drafts to evade plagiarism software.
Instead, analyze their assignment prompt, provide a stunning architectural thesis outline, list key academic questions they must address, suggest credible resources to reference, and provide rubric-style mock-grade feedback for any snippet they paste.
Use the structure:
1) Assignment Architecture (Outline & Structure)
2) Core Research Guidelines
3) Tricky Areas to Avoid (Rubric Check)
4) Mini Self-Test Exercise
5) Next 30 minutes action plan
`;
      break;

    case "CAREER":
      specificModeGuidance = `
MODE: CAREER
Connect academic topics to the African job market (e.g. tech hubs in Lagos, Nairobi, Kigali, small business Jua Kali integration, agricultural exports, mobile money M-Pesa API, fintech/logistics sectors).
Identify the real skills gap, help draft impactful CV bullet points based on class projects, prepare interview practice Q&A, and devise an internship/freelance action plan.
Use the structure:
1) African Market Context (Skills Gap)
2) Career Application & Core Competencies
3) Power CV Draft Bullets (Action verbs, metrics)
4) Short Interview Prep Drill (2 simulated questions)
5) Actionable 40-Minute Job-Market Plan
`;
      break;

    case "INNOVATION_LAB":
      specificModeGuidance = `
MODE: INNOVATION_LAB
You are helping the student pitch or build an idea targeting a local community problem.
You MUST output exactly using the following structured fields in a beautifully readable layout:
- PROBLEM: Who suffers, what pain, why now.
- SOLUTION: MVP, how it works, what is unique.
- OPPORTUNITY: Market/user segment, stakeholders, value.
- BUILD PLAN: 7-14 day concrete prototyping steps.
- SKILLS/TOOLS NEEDED: Minimum set of tech/tools.
- RISKS & ASSUMPTIONS: What must be true for this to work.
- IMPACT METRICS: How to measure success quantitatively.
Must use African regional projects as context. Make it inspiring, highly tactical, and realistic for a uni student.
`;
      break;

    default:
      specificModeGuidance = `
Provide general mentorship and break down concepts using real-world African examples. Be the ultimate senior student + lecturer + career mentor combined!
`;
  }

  return `
You are MSOMI AI, an advanced, adaptive Academic Co-Pilot and mentor built for African university students.
YOUR IDENTITY:
- Mentor, experienced upperclassman, supportive lecturer, and career counselor combined.
- Understanding of the African university context: power rationing/blackouts, expensive data bundles, heavy exam schedules, lack of lab resources, but abundant talent, resilience, and opportunities in sectors like fintech (M-Pesa), agri-tech, smart logistics, local health clinics, and the Jua Kali economy.
- Academic Integrity is your absolute core value. NEVER write complete exam answers, do NOT generate ready-to-be-submitted papers, and do NOT complete homework assignments. If requested to do so, decline with polite motivation and offer strategic outlines and explanations.

STUDENT PROFILE DATA:
- Name: ${name}
- Campus: ${university}
- Program of study: ${course} (Year ${year})
- Preferred communication tone: ${lang} (Speak in beautiful, engaging standard academic English, but feel free to spice it up with friendly Kiswahili words like 'vipi', 'mambo vipi', 'biashara', 'kusoma', 'msomi', or 'shika hapa' if student mixes them or if you want to explain something warmly!)
- Difficulty Level target: ${diff}/5
- Learning Style: ${style}
- strengths: ${strengths}
- Interests: ${interests}

INSTRUCTIONS FOR ALL ANSWERS:
- Adapt explanations to their learning speed and difficulty target.
- Use simple analogies first, then scale up complexity.
- Proactively suggest study group tactics, peer pair-programming, and accountability.
- Frame comments with the supportive and motivating tone of an older sibling.

${specificModeGuidance}
`;
}

// Offline Fallback Generators to ensure the AI always responds with robust interactive help
function generateSmartFallback(message: string, mode: string, profile: any): string {
  const normMsg = message.toLowerCase();
  const studentName = profile.name || "Student";
  const course = profile.course || "your course";
  
  let responseText = `### 💡 MSOMI Local Calibration Engine (Active)
Habari ${studentName}! The cloud Gemini engine is currently offline or unconfigured.

**Notice**: To activate full real-time cloud AI reasoning, make sure a valid \`GEMINI_API_KEY\` is added under **Settings > Secrets** in your AI Studio dashboard.

Meanwhile, I have calibrated my custom local mentor database to address your query regarding **${course}** immediately:

`;

  if (normMsg.includes("kruskal") || normMsg.includes("prim") || normMsg.includes("graph") || normMsg.includes("algorithm") || normMsg.includes("mst")) {
    responseText += `### ### ⚠️ 1) Problem we are solving
We are analyzing **Kruskal's Algorithm** for finding a Minimum Spanning Tree (MST) in a connected, weighted graph, helping us find the cheapest way to connect all nodes.

### ### 🏆 2) Explanation & Regional Analogy
Imagine Safaricom is wiring **M-Pesa transaction nodes** across cities like Nairobi, Dodoma, Arusha, and Mombasa. 
- **Nodes/Vertices**: Cities or local agent shops.
- **Edges**: Fiber-optic lines or microwave links between shops.
- **Weights**: Cost to lay down cables between those shops (some represent rocky hills, others flat terrain).

**Kruskal's Approach**:
- Take all possible connection links (edges) and sort them from the absolute cheapest to most expensive.
- Pick the cheapest edge. If it forms a loop (cycle) with what we already have, discard it.
- Otherwise, add it to our M-Pesa network!
- Repeat until every single city/node is connected.

### ### 🛠️ 3) Steps to execute manually
- Sort all weights: (Shop A to B: 2M, B to C: 4M, A to C: 5M).
- Pick A-B (2M)
- Pick B-C (4M)
- Skip A-C (5M) as A and C are already connected via B. The total cost is **6M**!

### ### ⚡ 4) Mini Practice Drill
Try to solve this graph on your notebook:
- Vertices: X, Y, Z.
- Edge costs: X-Y (10), Y-Z (15), X-Z (30).
- **Question**: Which edge will Kruskal's skip, and what is the total MST cost?

### ### ⏰ 5) Next Academic Action (Next 25 minutes)
Take 10 minutes to draw a graph with 4 vertices representing student hostels on your campus, assign random weights to the links, and manually trace Kruskal's algorithm to connect them all with minimum cost.
`;
  } else if (normMsg.includes("database") || normMsg.includes("normal") || normMsg.includes("sql") || normMsg.includes("schema") || normMsg.includes("db")) {
    responseText += `### ### ⚠️ 1) Problem we are solving
We are normalizing a relational database structure to reduce redundancy and eliminate update anomalies (1NF, 2NF, 3NF).

### ### 🏆 2) Explanation & Analogy
Imagine we are building a student registration system for **MSOMI University Campus**. 
If we put StudentName, SubscribedCourse, InstructorName, InstructorOffice, and ExamScore all in one flat sheet:
- **Redundancy**: If a student is taking 4 courses, we repeat their Phone/Email 4 times.
- **Update Anomaly**: If a student changes their phone number, we have to change it in 4 places! If we miss one, the database is in conflict.

**The Solution: Three Levels of Normalization**:
- **1st Normal Form (1NF)**: Eliminate duplicate columns and ensure atomic values (no multiple courses in one cell).
- **2nd Normal Form (2NF)**: Must be in 1NF, and all non-key attributes must fully depend on the primary key (no partial dependencies).
- **3rd Normal Form (3NF)**: Must be in 2NF, and no transitive dependencies (Non-key columns should not depend on other non-key columns, like InstructorOffice depending on InstructorName instead of StudentID).

### ### 🛠️ 3) Structured Steps to Normalize
* Separate student basic details (StudentID, StudentName, email) into a \`Students\` table.
* Separate courses (CourseCode, CourseName, Credits) into a \`Courses\` table.
* Keep the intersection records (StudentID, CourseCode, Grade) in an \`Enrollments\` table.

### ### ⚡ 4) Quick Practice Self-Test
Look at this data record: \`[StudentID: 101, StudentName: Amina, Course: CS101, Instructor: Dr. Juma, InstructorOffice: Block-A]\`.
- **Question**: Why does keeping \`InstructorOffice\` here violate 3NF? (Answer: Because Office depends on the lecturer, not on the student key!).

### ### ⏰ 5) Next Action (Next 30 minutes)
Design a small schema diagram for a local shop inventory tracker (Items, Categories, Suppliers, and Sales). Create it on a piece of paper, and group columns into 3 tables to satisfy 3NF!
`;
  } else if (normMsg.includes("nitrogen") || normMsg.includes("crop") || normMsg.includes("farm") || normMsg.includes("agriculture") || normMsg.includes("soil")) {
    responseText += `### ### ⚠️ 1) Problem we are solving
We are analyzing the **Nitrogen Cycle & Sustainable Crop Rotation** strategies for local smallholder farms without depending on expensive imported chemical inputs.

### ### 🏆 2) Sustainable Agricultural Explanation
Nitrogen (N2) forms 78% of our atmosphere, but plants cannot absorb it directly. They require nitrogen fixers to transform it into Nitrates (NO3-) which roots can feed on in agricultural biology.

**The East African Smallholder Solution**:
Instead of purchasing expensive ammonium sulfate fertilizer:
- Plant **Legumes (maize rotation with cowpeas, beans, or groundnuts)**.
- Legumes have mutualistic **Rhizobium bacteria** in root nodules that fix gaseous nitrogen into biological fertilizer.
- After harvest, till the legume leafy residue back into the soil to feed the upcoming maize crop the next season!

### ### 🛠️ 3) Key Organic Nitrogen transformation phases
- **Nitrogen Fixation**: Rhizobium converts N2 gas into ammonia (NH3).
- **Nitrification**: Soil bacteria convert ammonia into accessible nitrites then nitrates.
- **Assimilation**: Plants absorb nitrates to make proteins for health.
- **Denitrification**: Anaerobic bacteria convert nitrate back to atmospheric N2 if soil is waterlogged.

### ### ⚡ 4) Crop Rotation Checklist
* Season 1: Heavy leaf feeders (Maize, Sorghum).
* Season 2: Soil Fixers/Legumes (Pigeonpeas, Beans) to restore nitrates naturally.
* Season 3: Root vegetables / Light tubers (Cassava, Sweet potato) to utilize deeper soil horizons.

### ### ⏰ 5) Next Target Action
Discuss with your study team how small farms in your village utilize manure or rotation, and draft a 3-year sustainable farm rotation blueprint!
`;
  } else if (normMsg.includes("mvc") || normMsg.includes("architecture") || normMsg.includes("controller") || normMsg.includes("view") || normMsg.includes("model")) {
    responseText += `### ### ⚠️ 1) Problem we are solving
Understanding the **Model-View-Controller (MVC)** architectural design pattern used widely in web development frameworks (Django, Laravel, Rails).

### ### 🏆 2) The Friendly 'Mama Ntilie' (Local Cafe) Restaurant Analogy
- **THE MODEL (The Store/Kitchen)**: It represents the raw data block, database schemas, and business logic. This is where ingredients (records) are kept and cooked.
- **THE VIEW (The Dining Table / Menu Plate)**: It represents the user interface (the HTML/JS/CSS). It is what the customer actually sees, smells, and clicks on.
- **THE CONTROLLER (The Waiter)**: It connects the two! When you order a meal (client requests a page), the Controller waiter talks to the chef Model, gets the food items (data), and serves it on the plate View.

### ### 🛠️ 3) Data flow diagram
1. User clicks "Book Hostel" (Request).
2. **Controller** routes the request and queries database via the **Model**.
3. **Model** returns the booked room record to the **Controller**.
4. **Controller** injects this record into the **View** template.
5. User receives a completed booking confirmation on screen.

### ### ⚡ 4) Simple Self-Quiz questions
- If we want to change database tables columns, where do we write that change? (Answer: Model).
- If we want to move a login button to the left corner, where do we edit? (Answer: View).

### ### ⏰ 5) Quick Application Action
Open any backend controller code on your system or list the folder structure of your MVC application. Identify where routing is mapped to controllers!
`;
  } else if (normMsg.includes("deadlock") || normMsg.includes("operating system")) {
    responseText += `### ### ⚠️ 1) Problem we are solving
Understanding **Operating System Deadlocks** — where processes cannot execute because each holds a resource the other needs.

### ### 🏆 2) The 'Single-Lane Bridge Matatu' (Minibus) Analogy
Imagine a narrow single-lane bridge over a river in Nairobi or Kampala.
- Two Matatus (processes) arrive from opposite sides at the same time.
- They both drive onto the bridge and meet in the exact middle.
- **Process A** (Matatu 1) cannot move forward because **Process B** (Matatu 2) is blockading the way. It refuses to back up.
- **Process B** cannot move forward because **Process A** is blockading the other direction. It also refuses to back up.
- Both are stuck forever! This is a **Deadlock** in system threads.

### ### 🛠️ 3) Coffman Conditions for Deadlocks
All 4 must hold simultaneously for a deadlock to exist:
1. **Mutual Exclusion**: Only one process can use a resource at a time (the bridge lane is too narrow for two).
2. **Hold and Wait**: A process holds a resource while waiting for another (Matatu 1 holds the bridge portion it is on, while waiting for the lane ahead to clear).
3. **No Preemption**: Resources cannot be stolen forcefully (you cannot lift a Matatu off the road).
4. **Circular Wait**: Process A waits for B, B waits for A (circular chain of blockade).

### ### ⚡ 4) Deadlock Prevention Strategies
- **Avoidance**: Banker's Algorithm (check resource state safety before granting).
- **Detection & Recovery**: Kill one of the processes (make one Matatu drive backward off the bridge!).
- **Prevention**: Enforce one-way traffic directions on the bridge.

### ### ⏰ 5) Self-Quiz challenge
How can circular wait be prevented in university room key distributions? Think on it for 10 minutes.
`;
  } else {
    responseText += `### ### ⚠️ 1) MSOMI AI Academic Mentorship Calibration
We are diving deep into your requested study query on **${profile.course || 'your University Course'}**.

### ### 🏆 2) Study Breakdown & Analogy
Learning at a university level can feel quite theoretical, but standard academic excellence comes from:
- **Relatability**: Connecting formulas and codes to regional sectors like mobile peer-payment API networks, solar power, agricultural yields, and decentralized healthcare logistics.
- **Collaborative Spirit**: Discussing tricky concepts with hostel or library study mates (without plagiarism!).

To proceed productively with this topic, I recommend breaking it down into modular parts (Core theories, common textbook pitfalls, exam testing formulas, and job-market applicability).

### ### 🛠️ 3) Academic Success Checklist
- **Concept Integration**: Write down the definitions with your own wording.
- **Peer Quiz Battle**: Design a study drill on this topic using our "Mazoezi Drills" tab!
- **Milestone Log**: Track progress using our syllabus and task tracker to build confidence.

### ### ⚡ 4) Immediate Practice Drill
- Ask yourself: "How would I explain this concept to high-school freshman students?" If you can explain it simplified, your mastery is reaching year-level calibration!

### ### ⏰ 5) Immediate Next Steps (20 minutes)
1. Write down 3 key sub-fields of this topic on a study draft.
2. Ask me specific questions about whichever of them feels the trickiest! I am standing by to explain.
`;
  }

  return responseText;
}

function generateFallbackQuiz(topic: string, course: string, difficulty: number): any[] {
  const formattedTopic = topic.trim();
  return [
    {
      id: 1,
      question: `Which of the following describes the primary goal when studying "${formattedTopic}" inside ${course || 'General Studies'}?`,
      options: [
        "A) To optimize system efficiency and organize records logically",
        "B) To double cloud computing bills needlessly",
        "C) To avoid collaborating with cohort members entirely",
        "D) To bypass university academic integrity rubrics"
      ],
      correctAnswer: "A) To optimize system efficiency and organize records logically",
      explanation: "Optimizing structure, reducing redundancy, and ensuring logical flow are the foundational pillars of proper academic and analytical workflows."
    },
    {
      id: 2,
      question: `Consider a regional mobile application in Nairobi or Dodoma handling "${formattedTopic}". What is a critical constraint?`,
      options: [
        "A) Unlimited network bandwidth on low-cost data bundles",
        "B) Power rationing, erratic blackouts, and expensive data costs",
        "C) Total reliance on imported heavy server rigs",
        "D) Absence of any transaction processing standards"
      ],
      correctAnswer: "B) Power rationing, erratic blackouts, and expensive data costs",
      explanation: "Students and systems operating in East African urban centers design lightweight, resilient, and offline-first interfaces because of erratic power supply and pricey internet bandwidth."
    },
    {
      id: 3,
      question: `When designing or managing "${formattedTopic}", which of the following represents a best practice for academic integrity?`,
      options: [
        "A) Copying complete project files directly from GitHub repos",
        "B) Relying entirely on automatic essay rewrites",
        "C) Structuring project blueprints, tracing logics manually, and reviewing with peer cohorts",
        "D) Submitting raw uncalibrated template outputs to lecturers"
      ],
      correctAnswer: "C) Structuring project blueprints, tracing logics manually, and reviewing with peer cohorts",
      explanation: "True cognitive growth and compliance with strict academic codes come from drafting your own architectural templates and doing group peer review."
    },
    {
      id: 4,
      question: `In reference to "${formattedTopic}", how does a student's calibrated difficulty level (currently set to ${difficulty || 3}/5) affect their study methodology?`,
      options: [
        "A) It requires the tutor to increase concept complexity progressively",
        "B) It means the student should stop studying altogether",
        "C) It forces the system to crash immediately",
        "D) It prohibits the student from changing study programs"
      ],
      correctAnswer: "A) It requires the tutor to increase concept complexity progressively",
      explanation: "Gradual cognitive calibration allows MSOMI AI and lecturers to start with simple analogies, then steadily scale up to senior-level engineering tasks."
    },
    {
      id: 5,
      question: `Which of the following elements most effectively tracks study milestones on a regional campus project regarding "${formattedTopic}"?`,
      options: [
        "A) A visual syllabus progress bar, logged study hours, and completed mock drills",
        "B) Simply guessing current skill mastery without recording logs",
        "C) Ignoring time allocation completely during exam weeks",
        "D) Repeating the identical introductory module perpetually"
      ],
      correctAnswer: "A) A visual syllabus progress bar, logged study hours, and completed mock drills",
      explanation: "Structured milestones tracking gives the student objective visibility over what modules are completed, what are in-progress, and what need direct revision drills."
    }
  ];
}

// Chat API Route
app.post("/api/chat", async (req: Request, res: Response) => {
  const { message, history, mode, profile } = req.body;
  if (!message) {
    res.status(400).json({ error: "Message is required." });
    return;
  }

  // If key is missing or is PLACEHOLDER, use the smart local fallback directly
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "PLACEHOLDER") {
    const fallbackText = generateSmartFallback(message, mode || "EXPLAIN", profile || {});
    res.json({
      content: fallbackText,
      timestamp: new Date().toISOString()
    });
    return;
  }

  try {
    const client = getGeminiClient();
    const systemInstruction = buildSystemInstruction(profile || {}, mode || "EXPLAIN");

    // Standardize history into Gemini SDK chat history format (role: 'user' | 'model')
    const geminiHistory = (history || []).map((msg: any) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }]
    }));

    // Start Chat via the SDK
    const chat = client.chats.create({
      model: "gemini-3.5-flash",
      config: {
        systemInstruction,
        temperature: 0.7,
      },
      history: geminiHistory
    });

    const response = await chat.sendMessage({
      message
    });

    res.json({
      content: response.text,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("Gemini API Error, falling back to local engine:", error);
    // Graceful fallback to avoid 500 crashes
    const fallbackText = generateSmartFallback(message, mode || "EXPLAIN", profile || {});
    res.json({
      content: fallbackText + "\n\n*(Local fallback generated due to cloud connection retry limitation)*",
      timestamp: new Date().toISOString()
    });
  }
});

// Dynamic Personalized Quiz Generator
app.post("/api/generate-quiz", async (req: Request, res: Response) => {
  const { topic, course, difficulty } = req.body;
  if (!topic) {
    res.status(400).json({ error: "Topic is required to generate a practice quiz." });
    return;
  }

  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "PLACEHOLDER") {
    const fallbackQuestions = generateFallbackQuiz(topic, course || "General Studies", difficulty || 3);
    res.json({
      title: `${topic} Challenge`,
      category: course || "General",
      difficulty: difficulty || 3,
      questions: fallbackQuestions
    });
    return;
  }

  try {
    const client = getGeminiClient();
    const prompt = `Generate an engaging study quiz with exactly 5 multiple-choice questions on the topic "${topic}" within the course "${course || 'General Studies'}". 
The quiz should be customized for difficulty level ${difficulty || 3} of 5.
Incorporate African context/scenarios in at least two of the questions (e.g., local farm automation, M-Pesa integrations, student housing, regional power supply, or health clinics).
Each question must have exactly 4 options and one explicit correct answer. Provide a helpful, concise explanation for why that answer is correct.

You MUST write the response STRICTLY as a valid JSON array of question objects matching this TypeScript schema:
interface QuizQuestion {
  id: number;
  question: string;
  options: string[]; // exactly 4 items
  correctAnswer: string; // must EXACTLY match one of the physical items inside options array
  explanation: string;
}

Do not include any markdown fences like \`\`\`json or trailing comments. Output only the raw valid JSON.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.INTEGER },
              question: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              correctAnswer: { type: Type.STRING },
              explanation: { type: Type.STRING }
            },
            required: ["id", "question", "options", "correctAnswer", "explanation"]
          }
        }
      }
    });

    const quizText = response.text || "[]";
    const questions = JSON.parse(quizText.trim());

    res.json({
      title: `${topic} Challenge`,
      category: course || "General",
      difficulty: difficulty || 3,
      questions
    });
  } catch (error: any) {
    console.error("Error generating quiz via Gemini, generating fallback:", error);
    const fallbackQuestions = generateFallbackQuiz(topic, course || "General Studies", difficulty || 3);
    res.json({
      title: `${topic} Challenge (Calibrated)`,
      category: course || "General",
      difficulty: difficulty || 3,
      questions: fallbackQuestions
    });
  }
});

// Real API integration endpoint for SMS, WhatsApp and Emails by DEV TEK INNOVATION
interface OutboundMessagePayload {
  type: "sms" | "whatsapp" | "email";
  recipient: string;
  message: string;
  subject?: string;
  isLiveMode?: boolean; // false = trace simulation logs, true = physical API call
  credentials?: {
    smtpHost?: string;
    smtpPort?: number;
    smtpUser?: string;
    smtpPass?: string;
    smtpFrom?: string;
    twilioSid?: string;
    twilioToken?: string;
    twilioMsgSidOrFrom?: string;
    atUsername?: string;
    atApiKey?: string;
    atSenderId?: string;
  };
}

app.post("/api/send-message", async (req: Request, res: Response) => {
  const { type, recipient, message, subject, isLiveMode, credentials } = req.body as OutboundMessagePayload;

  if (!recipient || !message) {
    res.status(400).json({ error: "Recipient and message content are required." });
    return;
  }

  const logs: string[] = [];
  logs.push(`[${new Date().toISOString()}] Starting outbound router for type: ${type.toUpperCase()}`);
  logs.push(`[${new Date().toISOString()}] Recipient address: ${recipient}`);

  const txId = `MSOMI-TX-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

  // 1. Validation
  if (type === "email") {
    if (!recipient.includes("@") || !recipient.includes(".")) {
      res.status(400).json({ error: "Invalid email syntax format." });
      return;
    }
  } else {
    // SMS / WhatsApp validation
    const cleanPhone = recipient.replace(/[\s+-]/g, "");
    if (cleanPhone.length < 9) {
      res.status(400).json({ error: "Phone number is too short or invalid." });
      return;
    }
  }

  // 2. Logic Check
  if (!isLiveMode) {
    // Simulation Mode with rich developer-grade trace output logs
    logs.push(`[${new Date().toISOString()}] DNS lookup performed. Resolving carrier gateway for ${recipient}...`);
    await new Promise(r => setTimeout(r, 600));

    if (type === "email") {
      logs.push(`[${new Date().toISOString()}] Connecting to MX mailserver records...`);
      await new Promise(r => setTimeout(r, 400));
      logs.push(`[${new Date().toISOString()}] TLS handshake with SMTP server successful.`);
      logs.push(`[${new Date().toISOString()}] RFC2822 payload formatted: From: no-reply@msomi.ai, To: ${recipient}`);
      logs.push(`[${new Date().toISOString()}] Message payload sent securely. 250 OK Message accepted for delivery.`);
    } else {
      logs.push(`[${new Date().toISOString()}] Handshake secure with SMS center gateway server.`);
      await new Promise(r => setTimeout(r, 400));
      logs.push(`[${new Date().toISOString()}] JSON Payload validated: { "to": "${recipient}", "body": "${message.substring(0, 30)}..." }`);
      logs.push(`[${new Date().toISOString()}] SMS transmitted to carrier. 202 Accepted.`);
    }

    res.json({
      success: true,
      transactionId: txId,
      status: "Sent",
      estimatedCost: type === "email" ? "Free ($0.00)" : "1.2 KES / 24 TZS",
      logs,
      timestamp: new Date().toISOString()
    });
    return;
  }

  // Live Mode Delivery (Triggering actual APIs!)
  try {
    if (type === "email") {
      // SMTP configuration
      const host = credentials?.smtpHost || process.env.SMTP_HOST;
      const port = Number(credentials?.smtpPort || process.env.SMTP_PORT || 587);
      const user = credentials?.smtpUser || process.env.SMTP_USER;
      const pass = credentials?.smtpPass || process.env.SMTP_PASS;
      const from = credentials?.smtpFrom || process.env.SMTP_FROM || `"Msomi AI" <no-reply@msomi.ai>`;

      if (!host || !user || !pass) {
        logs.push(`[${new Date().toISOString()}] ❌ Failed: No SMTP config provided under Interactive Integration or environment variables.`);
        res.status(400).json({
          error: "To send a real email, please enter your SMTP credentials or configure them in .env",
          logs
        });
        return;
      }

      logs.push(`[${new Date().toISOString()}] Contacting SMTP server host ${host}:${port}...`);
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass }
      });

      logs.push(`[${new Date().toISOString()}] Authenticating user session...`);
      await transporter.verify();
      logs.push(`[${new Date().toISOString()}] SMTP session verified. Creating body stream...`);

      const info = await transporter.sendMail({
        from,
        to: recipient,
        subject: subject || "MSOMI AI Notification",
        text: message,
        html: `<div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd; background: #fafafa;">
          <h2 style="color: #C15B32; font-style: italic;">Msomi AI</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #333;">${message}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;"/>
          <p style="font-size: 10px; color: #888;">Powered by DEV TEK INNOVATION<br/>Founder & Created by DAVID FREDRICK MDIKULA</p>
        </div>`
      });

      logs.push(`[${new Date().toISOString()}] Email sent successfully! MessageId: ${info.messageId}`);
      res.json({
        success: true,
        transactionId: txId,
        status: "Sent",
        estimatedCost: "SMTP Charge",
        logs,
        timestamp: new Date().toISOString()
      });

    } else if (type === "sms" || type === "whatsapp") {
      // Check credentials
      const twilioSid = credentials?.twilioSid || process.env.TWILIO_ACCOUNT_SID;
      const twilioToken = credentials?.twilioToken || process.env.TWILIO_AUTH_TOKEN;
      const twilioFrom = credentials?.twilioMsgSidOrFrom || process.env.TWILIO_FROM_NUMBER;

      const atUsername = credentials?.atUsername || process.env.AT_USERNAME;
      const atApiKey = credentials?.atApiKey || process.env.AT_API_KEY;
      const atSenderId = credentials?.atSenderId || process.env.AT_SENDER_ID;

      if (twilioSid && twilioToken && twilioFrom) {
        // Run Twilio Dispatch
        logs.push(`[${new Date().toISOString()}] Initializing Twilio transmission endpoint...`);
        const urlType = type === "whatsapp" ? "WhatsApp" : "SMS";
        const fromNum = type === "whatsapp" && !twilioFrom.startsWith("whatsapp:") ? `whatsapp:${twilioFrom}` : twilioFrom;
        const toNum = type === "whatsapp" && !recipient.startsWith("whatsapp:") ? `whatsapp:${recipient}` : recipient;

        logs.push(`[${new Date().toISOString()}] Pitching ${urlType} request payload to Twilio REST gateway...`);
        
        const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
          method: "POST",
          headers: {
            "Authorization": "Basic " + Buffer.from(`${twilioSid}:${twilioToken}`).toString("base64"),
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: new URLSearchParams({
            To: toNum,
            From: fromNum,
            Body: message
          })
        });

        const twData = await response.json() as any;
        if (response.ok) {
          logs.push(`[${new Date().toISOString()}] Twilio API response success: Status ${response.status}`);
          logs.push(`[${new Date().toISOString()}] Message queued with Sid: ${twData.sid}`);
          res.json({
            success: true,
            transactionId: twData.sid || txId,
            status: "Sent",
            estimatedCost: twData.price ? `${twData.price} ${twData.price_unit}` : "Twilio standard cost",
            logs,
            timestamp: new Date().toISOString()
          });
        } else {
          logs.push(`[${new Date().toISOString()}] ❌ Twilio Error Response: ${JSON.stringify(twData)}`);
          res.status(response.status).json({ error: twData.message || "Twilio gateway error", logs });
        }

      } else if (atUsername && atApiKey) {
        // Run Africa's Talking Dispatch
        logs.push(`[${new Date().toISOString()}] Initializing Africa's Talking Gateway...`);
        logs.push(`[${new Date().toISOString()}] Packing payload securely for production route...`);

        const response = await fetch("https://api.africastalking.com/version1/messaging", {
          method: "POST",
          headers: {
            "apiKey": atApiKey,
            "Accept": "application/json",
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: new URLSearchParams({
            username: atUsername,
            to: recipient,
            message: message,
            ...(atSenderId ? { from: atSenderId } : {})
          })
        });

        const atData = await response.json() as any;
        if (response.ok && atData.SMSMessageData) {
          const recs = atData.SMSMessageData.Recipients || [];
          const statusVal = recs.length > 0 ? recs[0].status : "Sent";
          const costVal = recs.length > 0 ? recs[0].cost : "AT cost";
          logs.push(`[${new Date().toISOString()}] Africa's Talking response success: status ${statusVal}`);
          logs.push(`[${new Date().toISOString()}] Message count: ${recs.length}, Cost charged: ${costVal}`);

          res.json({
            success: true,
            transactionId: txId,
            status: statusVal === "Success" ? "Sent" : statusVal,
            estimatedCost: costVal,
            logs,
            timestamp: new Date().toISOString()
          });
        } else {
          logs.push(`[${new Date().toISOString()}] ❌ Africa's Talking Gateway error structure: ${JSON.stringify(atData)}`);
          res.status(400).json({ error: "Africa's Talking gateway could not push message.", logs });
        }

      } else {
        logs.push(`[${new Date().toISOString()}] ❌ Credentials check failed. Neither Twilio nor Africa's Talking credentials are set.`);
        res.status(400).json({
          error: "To send real messages, please insert your Twilio or Africa's Talking credentials in the Advanced Panel, or configure them inside .env example file.",
          logs
        });
      }
    }
  } catch (err: any) {
    logs.push(`[${new Date().toISOString()}] ❌ Fatal Exception caught during transmission: ${err.message}`);
    console.error("Transmission error:", err);
    res.status(500).json({ error: `Connection failure: ${err.message}`, logs });
  }
});

// Serve frontend assets in production or use Vite dev server in development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite dev middleware mounted.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 MSOMI AI Campus Co-Pilot is running on http://localhost:${PORT}`);
  });
}

startServer();
