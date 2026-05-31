import { useState, useEffect } from "react";
import { 
  Award, 
  TrendingUp, 
  PlusCircle, 
  Flame, 
  Activity, 
  Clock, 
  Sparkles, 
  Loader2, 
  ShieldCheck, 
  Trash2,
  AlertCircle
} from "lucide-react";
import Markdown from "react-markdown";
import { SubjectId, SUBJECTS_LIST, PracticeAttempt, SubjectProgress } from "../types";

interface ProgressTrackerProps {
  selectedSubjectId: SubjectId;
  milestonesFinishedCount: number; // passed from active guide checklist
}

export default function ProgressTracker({ selectedSubjectId, milestonesFinishedCount }: ProgressTrackerProps) {
  // Stats
  const [attempts, setAttempts] = useState<PracticeAttempt[]>([]);
  const [progressRecords, setProgressRecords] = useState<Record<SubjectId, SubjectProgress>>({
    kannada: { subjectId: "kannada", studyHours: 4, milestonesCompleted: 0, totalMilestones: 7, weakTopics: [] },
    science: { subjectId: "science", studyHours: 8, milestonesCompleted: 0, totalMilestones: 7, weakTopics: ["lens focal equations"] },
    maths: { subjectId: "maths", studyHours: 12, milestonesCompleted: 0, totalMilestones: 7, weakTopics: ["differentiation quotient rule"] },
    english: { subjectId: "english", studyHours: 3, milestonesCompleted: 0, totalMilestones: 7, weakTopics: [] },
    python: { subjectId: "python", studyHours: 6, milestonesCompleted: 0, totalMilestones: 7, weakTopics: ["object class inheritance"] },
    c: { subjectId: "c", studyHours: 10, milestonesCompleted: 0, totalMilestones: 7, weakTopics: ["pointer heaps", "structures"] },
    java: { subjectId: "java", studyHours: 7, milestonesCompleted: 0, totalMilestones: 7, weakTopics: ["multithreading executor"] },
    cs_majors: { subjectId: "cs_majors", studyHours: 15, milestonesCompleted: 0, totalMilestones: 7, weakTopics: ["B-Tree disk IO indexing", "Dijkstra relaxation"] },
  });

  // Log new quiz form
  const [topicName, setTopicName] = useState<string>("");
  const [scorePercentage, setScorePercentage] = useState<number>(80);

  // Focus topic inputs
  const [newWeakTopic, setNewWeakTopic] = useState<string>("");

  // AI advisory
  const [advisorMarkdown, setAdvisorMarkdown] = useState<string>("");
  const [isAdvising, setIsAdvising] = useState<boolean>(false);
  const [advisoryError, setAdvisoryError] = useState<string>("");

  const activeSubject = SUBJECTS_LIST.find(s => s.id === selectedSubjectId) || SUBJECTS_LIST[0];

  useEffect(() => {
    // Load practice logs
    const savedLogs = localStorage.getItem("exam_prep_practice_attempts");
    if (savedLogs) {
      try {
        setAttempts(JSON.parse(savedLogs));
      } catch (e) {
        console.error("Failed to parse attempts list", e);
      }
    } else {
      // Seed initial high-quality mock database for realistic HD graphs on first launch
      const initialSeed: PracticeAttempt[] = [
        { id: "seed-1", subjectId: "maths", topic: "Trigonometric Proofs", score: 85, totalQuestions: 10, date: "2026-05-25" },
        { id: "seed-2", subjectId: "science", topic: "Electricity Circuits", score: 72, totalQuestions: 12, date: "2026-05-27" },
        { id: "seed-3", subjectId: "c", topic: "Pointer Arrays", score: 65, totalQuestions: 8, date: "2026-05-29" },
        { id: "seed-4", subjectId: "cs_majors", topic: "3NF Schemas", score: 90, totalQuestions: 15, date: "2026-05-30" },
      ];
      setAttempts(initialSeed);
      localStorage.setItem("exam_prep_practice_attempts", JSON.stringify(initialSeed));
    }

    // Load progress hours
    const savedHours = localStorage.getItem("exam_prep_study_progress_v1");
    if (savedHours) {
      try {
        setProgressRecords(JSON.parse(savedHours));
      } catch (e) {
        console.error("Failed to parse hours tracker", e);
      }
    }
  }, []);

  const saveAttemptsAndRecords = (newAttempts: PracticeAttempt[], newRecords: Record<SubjectId, SubjectProgress>) => {
    setAttempts(newAttempts);
    setProgressRecords(newRecords);
    localStorage.setItem("exam_prep_practice_attempts", JSON.stringify(newAttempts));
    localStorage.setItem("exam_prep_study_progress_v1", JSON.stringify(newRecords));
  };

  // Add study hours
  const handleLogHours = (hoursToAdd: number) => {
    const nextRecords = { ...progressRecords };
    nextRecords[selectedSubjectId] = {
      ...nextRecords[selectedSubjectId],
      studyHours: nextRecords[selectedSubjectId].studyHours + hoursToAdd
    };
    saveAttemptsAndRecords(attempts, nextRecords);
  };

  // Add practice score attempt
  const handleScoreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicName.trim()) return;

    const newAttempt: PracticeAttempt = {
      id: `attempt-${Date.now()}`,
      subjectId: selectedSubjectId,
      topic: topicName,
      score: scorePercentage,
      totalQuestions: 10,
      date: new Date().toISOString().split("T")[0]
    };

    const nextAttempts = [newAttempt, ...attempts];
    saveAttemptsAndRecords(nextAttempts, progressRecords);
    setTopicName("");
    setScorePercentage(80);
  };

  const handleDeleteAttempt = (id: string) => {
    const nextAttempts = attempts.filter(a => a.id !== id);
    saveAttemptsAndRecords(nextAttempts, progressRecords);
  };

  // Add difficulty weak issue topic
  const handleAddWeakTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeakTopic.trim()) return;

    const nextRecords = { ...progressRecords };
    const currentList = nextRecords[selectedSubjectId].weakTopics || [];
    
    if (!currentList.includes(newWeakTopic.trim())) {
      nextRecords[selectedSubjectId] = {
        ...nextRecords[selectedSubjectId],
        weakTopics: [...currentList, newWeakTopic.trim()]
      };
      saveAttemptsAndRecords(attempts, nextRecords);
    }
    setNewWeakTopic("");
  };

  const handleRemoveWeakTopic = (topicToRemove: string) => {
    const nextRecords = { ...progressRecords };
    nextRecords[selectedSubjectId] = {
      ...nextRecords[selectedSubjectId],
      weakTopics: (nextRecords[selectedSubjectId].weakTopics || []).filter(t => t !== topicToRemove)
    };
    saveAttemptsAndRecords(attempts, nextRecords);
  };

  // Overall calculations
  const totalHours = Object.values(progressRecords).reduce((acc, curr) => acc + curr.studyHours, 0);
  const activeSubjectHours = progressRecords[selectedSubjectId]?.studyHours || 0;
  const currentWeakTopics = progressRecords[selectedSubjectId]?.weakTopics || [];

  // Filter attempts for calculated stats
  const subjectAttempts = attempts.filter(a => a.subjectId === selectedSubjectId);
  const subjectAverage = subjectAttempts.length > 0 
    ? Math.round(subjectAttempts.reduce((acc, c) => acc + c.score, 0) / subjectAttempts.length)
    : 0;

  const overallAverage = attempts.length > 0
    ? Math.round(attempts.reduce((acc, c) => acc + c.score, 0) / attempts.length)
    : 0;

  // Study hours goal progress (say out of 50 target)
  const hoursBarPercentage = Math.min(100, Math.round((totalHours / 60) * 100));

  // Call AI Performance diagnostics
  const handleGenerateAdvisor = async () => {
    setIsAdvising(true);
    setAdvisoryError("");
    setAdvisorMarkdown("");

    try {
      const payload = {
        subject: activeSubject.name,
        practiceAttempts: subjectAttempts.length,
        weakTopics: currentWeakTopics.length > 0 ? currentWeakTopics : ["concept definitions", "exam time-management"],
        avgScore: subjectAttempts.length > 0 ? subjectAverage : 75
      };

      const response = await fetch("/api/progress-diagnostics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to compile progress review.");
      }

      setAdvisorMarkdown(data.diagnostics);

    } catch (err: any) {
      console.error(err);
      setAdvisoryError(err.message || "Diagnostic report pipeline busy. Please try again.");
    } finally {
      setIsAdvising(false);
    }
  };

  // Build subject-scores data for our Custom SVG HD graph bar
  const graphData = SUBJECTS_LIST.map(sub => {
    const subAtts = attempts.filter(a => a.subjectId === sub.id);
    const avg = subAtts.length > 0 
      ? Math.round(subAtts.reduce((acc, curr) => acc + curr.score, 0) / subAtts.length)
      : 0;
    return {
      subId: sub.id,
      name: sub.name.split(" ")[0], // Short name
      avgScore: avg,
      color: sub.id === selectedSubjectId ? "#6366f1" : "#3b82f6" // Highlight selected subject
    };
  });

  return (
    <div id="diagnostics-tracker" className="space-y-6">
      
      {/* Visual top indicator dials */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
        
        <div className="bg-[#111111]/80 backdrop-blur-md border border-white/5 hover:border-cyan-400/20 p-5 rounded-3xl flex items-center gap-4 shadow-2xl duration-300 transition-all group relative overflow-hidden">
          <div className="p-3 bg-[#050505] border border-white/5 text-cyan-400 rounded-2xl group-hover:scale-105 duration-200 transition-transform">
            <Clock size={16} className="animate-spin text-cyan-400" style={{ animationDuration: "12s" }} />
          </div>
          <div>
            <span className="text-[9px] text-white/40 uppercase tracking-widest font-mono block">Logged Hours (All)</span>
            <p className="text-lg md:text-xl font-display font-bold text-white mt-0.5">{totalHours}h <span className="text-[10px] text-white/20 font-mono">/60h Goal</span></p>
          </div>
        </div>

        <div className="bg-[#111111]/80 backdrop-blur-md border border-white/5 hover:border-cyan-400/20 p-5 rounded-3xl flex items-center gap-4 shadow-2xl duration-300 transition-all group relative overflow-hidden">
          <div className="p-3 bg-[#050505] border border-white/5 text-cyan-400 rounded-2xl group-hover:scale-105 duration-200 transition-transform">
            <Award size={16} className="text-cyan-400" />
          </div>
          <div>
            <span className="text-[9px] text-white/40 uppercase tracking-widest font-mono block">Active Milestones</span>
            <p className="text-lg md:text-xl font-display font-bold text-white mt-0.5">{milestonesFinishedCount} <span className="text-[10px] text-white/20 font-mono">/ 7 Days</span></p>
          </div>
        </div>

        <div className="bg-[#111111]/80 backdrop-blur-md border border-white/5 hover:border-cyan-400/20 p-5 rounded-3xl flex items-center gap-4 shadow-2xl duration-300 transition-all group relative overflow-hidden">
          <div className="p-3 bg-[#050505] border border-white/5 text-cyan-400 rounded-2xl group-hover:scale-105 duration-200 transition-transform">
            <TrendingUp size={16} className="text-cyan-400" />
          </div>
          <div>
            <span className="text-[9px] text-white/40 uppercase tracking-widest font-mono block">Subject {activeSubject.name.split(" ")[0]} Average</span>
            <p className="text-lg md:text-xl font-display font-bold text-white mt-0.5">{subjectAverage > 0 ? `${subjectAverage}%` : "No scores"}</p>
          </div>
        </div>

        <div className="bg-[#111111]/80 backdrop-blur-md border border-white/5 hover:border-cyan-400/20 p-5 rounded-3xl flex items-center gap-4 shadow-2xl duration-300 transition-all group relative overflow-hidden">
          <div className="p-3 bg-[#050505] border border-white/5 text-emerald-400 rounded-2xl group-hover:scale-105 duration-200 transition-transform">
            <Flame size={16} className="text-emerald-400" />
          </div>
          <div>
            <span className="text-[9px] text-white/40 uppercase tracking-widest font-mono block">Overall Average Grade</span>
            <p className="text-lg md:text-xl font-display font-bold text-white mt-0.5">{overallAverage > 0 ? `${overallAverage}%` : "No tests"}</p>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch mt-3">
        
        {/* Left Form controls for logging hours and topics - Styled as Bento Stack */}
        <div id="logging-column" className="lg:col-span-5 flex flex-col gap-6 text-left">
          
          {/* Study hours logged anytime anywhere */}
          <div className="bg-[#111111]/80 backdrop-blur-md border border-white/5 hover:border-cyan-400/20 p-5 rounded-3xl shadow-2xl space-y-4 transition-all duration-300 relative overflow-hidden group flex-1">
            <div>
              <h3 className="font-display font-medium text-white text-xs uppercase tracking-wide">
                Log New Study Sessions
              </h3>
              <p className="text-[11px] text-white/40 mt-1">
                Study anywhere & log. Easily click intervals to increase hours for <span className="text-cyan-400 font-medium">{activeSubject.name}</span>.
              </p>
            </div>

            <div className="flex bg-[#050505] p-3 rounded-xl border border-white/5 justify-between items-center gap-3">
              <span className="text-xs text-white/70">Current hours focused: <span className="text-white font-bold font-mono pl-1">{activeSubjectHours} hrs</span></span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => handleLogHours(1)}
                  className="py-1 px-2.5 bg-white/5 hover:bg-white/10 text-[10px] text-white font-mono rounded-lg border border-white/5 cursor-pointer transition-transform active:scale-95"
                >
                  +1 hr
                </button>
                <button
                  type="button"
                  onClick={() => handleLogHours(2)}
                  className="py-1 px-2 text-[10px] bg-white hover:bg-neutral-200 text-black font-semibold rounded-lg cursor-pointer transition-transform active:scale-95 text-center font-mono"
                >
                  +2 hrs
                </button>
              </div>
            </div>

            {/* Total Goals progress visual custom bar */}
            <div>
              <div className="flex justify-between items-center text-[10px] text-white/40 font-mono mb-1.5">
                <span>Total Study Target Progress</span>
                <span className="text-cyan-400 font-bold">{hoursBarPercentage}%</span>
              </div>
              <div className="w-full bg-[#050505] h-2 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${hoursBarPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Test scores logger */}
          <div className="bg-[#111111]/80 backdrop-blur-md border border-white/5 hover:border-cyan-400/20 p-5 rounded-3xl shadow-2xl space-y-4 transition-all duration-300 relative overflow-hidden group flex-1">
            <div>
              <h3 className="font-display font-medium text-white text-xs uppercase tracking-wide">
                Log Practice Assessment Score
              </h3>
              <p className="text-[11px] text-white/40 mt-1">
                Pinpoint test readiness by logging self-marked practice exams.
              </p>
            </div>

            <form onSubmit={handleScoreSubmit} className="space-y-3">
              <div>
                <label className="block text-[8px] uppercase tracking-widest font-bold text-white/40 mb-1 font-mono">
                  Mock Exam / Topic / Chapter Name
                </label>
                <input
                  id="metric-topic-input"
                  type="text"
                  required
                  className="w-full bg-[#050505] border border-white/5 focus:border-cyan-400/50 rounded-xl p-2 px-3 text-xs text-white focus:outline-none"
                  placeholder="E.g., Matrices Part B, Unit 2 class inheritance..."
                  value={topicName}
                  onChange={(e) => setTopicName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block text-[8px] uppercase tracking-widest font-bold text-white/40 mb-1 font-mono">
                    Score / Metric (%)
                  </label>
                  <input
                    id="metric-score-input"
                    type="number"
                    min="0"
                    max="100"
                    className="w-full bg-[#050505] border border-white/5 focus:border-cyan-400/50 rounded-xl p-2 text-xs text-white focus:outline-none text-center font-mono"
                    value={scorePercentage}
                    onChange={(e) => setScorePercentage(Number(e.target.value))}
                  />
                </div>
                <button
                  id="log-score-submit-btn"
                  type="submit"
                  className="w-full py-2 px-3 self-end bg-white hover:bg-neutral-200 text-black font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all text-center cursor-pointer font-sans"
                >
                  <PlusCircle size={14} />
                  Add Log
                </button>
              </div>
            </form>
          </div>

          {/* Weak areas identification tracking */}
          <div className="bg-[#111111]/80 backdrop-blur-md border border-white/5 hover:border-cyan-400/20 p-5 rounded-3xl shadow-2xl space-y-4 transition-all duration-300 relative overflow-hidden group flex-1">
            <div>
              <h3 className="font-display font-medium text-white text-xs uppercase tracking-wide">
                Identify Weak Sub-topics
              </h3>
              <p className="text-[11px] text-white/40 mt-1">
                Mark areas needing improvement. The diagnostic AI checks this checklist closely.
              </p>
            </div>

            <form onSubmit={handleAddWeakTopic} className="flex gap-2">
              <input
                id="weak-topic-input"
                type="text"
                className="flex-1 bg-[#050505] border border-white/5 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-cyan-400/50 placeholder-white/20"
                placeholder="E.g., balancing redox, pointers..."
                value={newWeakTopic}
                onChange={(e) => setNewWeakTopic(e.target.value)}
              />
              <button
                type="submit"
                className="py-2 px-3.5 bg-red-950/20 hover:bg-red-900 border border-red-900/40 text-xs text-red-400 hover:text-white rounded-xl cursor-pointer transition-colors"
              >
                Flag Topic
              </button>
            </form>

            <div className="flex flex-wrap gap-1.5 mt-2">
              {currentWeakTopics.length === 0 ? (
                <span className="text-[10px] text-white/30 italic py-1">No weak areas specified. Add difficult topics above.</span>
              ) : (
                currentWeakTopics.map((topic, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1.5 text-[10px] bg-red-950/20 border border-red-900/30 text-red-300 py-1 px-2.5 rounded-lg"
                  >
                    <span>{topic}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveWeakTopic(topic)}
                      className="hover:text-white font-bold font-mono text-[10px] focus:outline-none cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Right Cockpit with high quality Responsive Custom SVG Graph bar and AI diagnostics recommendations - Styled as companion Bento Blocks */}
        <div className="lg:col-span-7 flex flex-col gap-6 text-left">
          
          {/* Responsive Custom SVG high-definition styled graph card */}
          <div className="bg-[#111111]/80 backdrop-blur-md border border-white/5 hover:border-cyan-400/20 p-5 rounded-3xl shadow-2xl transition-all duration-300 relative overflow-hidden group">
            <div className="flex justify-between items-center pb-2 border-b border-white/5 mb-4 font-sans">
              <h3 className="font-display font-medium text-white text-xs uppercase tracking-wide flex items-center gap-2">
                <Activity size={15} className="text-cyan-400 group-hover:scale-110 transition-transform" />
                Score Performance by Subject
              </h3>
              <span className="text-[9px] font-mono text-white/30 uppercase">Interactive HD Graph</span>
            </div>

            {/* SVG implementation */}
            <div className="w-full relative py-2">
              <svg 
                viewBox="0 0 500 240" 
                className="w-full h-auto text-[10px] font-mono"
              >
                {/* Horizontal Grid lines */}
                <line x1="40" y1="30" x2="480" y2="30" stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="3 3" />
                <text x="15" y="34" fill="rgba(255,255,255,0.3)" className="text-[8px]">100%</text>
                
                <line x1="40" y1="80" x2="480" y2="80" stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="3 3" />
                <text x="15" y="84" fill="rgba(255,255,255,0.3)" className="text-[8px]">75%</text>
                
                <line x1="40" y1="130" x2="480" y2="130" stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="3 3" />
                <text x="15" y="134" fill="rgba(255,255,255,0.3)" className="text-[8px]">50%</text>
                
                <line x1="40" y1="180" x2="480" y2="180" stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="3 3" />
                <text x="15" y="184" fill="rgba(255,255,255,0.3)" className="text-[8px]">25%</text>

                {/* Base line */}
                <line x1="40" y1="200" x2="480" y2="200" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />

                {/* Draw glowing bars */}
                {graphData.map((d, index) => {
                  const barWidth = 32;
                  const spacing = (440 - (graphData.length * barWidth)) / (graphData.length + 1);
                  const x = 50 + index * (barWidth + spacing);
                  
                  // Limit the height to avoid breaking boundaries
                  const maxBarHeight = 170; // 200 - 30
                  const barHeight = Math.max(8, Math.min(maxBarHeight, (d.avgScore / 100) * maxBarHeight));
                  const y = 200 - barHeight;

                  const isCurrent = d.subId === selectedSubjectId;

                  return (
                    <g key={d.subId} className="group">
                      {/* Bar Fill */}
                      <rect
                        x={x}
                        y={y}
                        width={barWidth}
                        height={barHeight}
                        rx="4"
                        fill={isCurrent ? "url(#neon-blue-gradient)" : "url(#standard-blue-gradient)"}
                        className="transition-all duration-500 hover:opacity-90"
                      />

                      {/* Display metric score labels on top of bar on focus */}
                      {d.avgScore > 0 ? (
                        <text
                          x={x + barWidth / 2}
                          y={y - 6}
                          fill="#ffffff"
                          textAnchor="middle"
                          fontSize="9"
                          fontWeight={isCurrent ? "bold" : "normal"}
                        >
                          {d.avgScore}%
                        </text>
                      ) : (
                        <text
                          x={x + barWidth / 2}
                          y={200 - 10}
                          fill="#4b5563"
                          textAnchor="middle"
                          fontSize="8"
                          fontStyle="italic"
                        >
                          N/A
                        </text>
                      )}

                      {/* X axis subject labels */}
                      <text                        x={x + barWidth / 2}
                        y="218"
                        fill={isCurrent ? "#22d3ee" : "rgba(255,255,255,0.4)"}
                        fontWeight={isCurrent ? "bold" : "normal"}
                        textAnchor="middle"
                        fontSize="8.5"
                        letterSpacing="0.05em"
                        className="truncate"
                      >
                        {d.name}
                      </text>
                    </g>
                  );
                })}

                {/* Definitions for futuristic neon colors */}
                <defs>
                  <linearGradient id="neon-blue-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity="1" />
                    <stop offset="100%" stopColor="#0891b2" stopOpacity="0.8" />
                  </linearGradient>
                  <linearGradient id="standard-blue-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#818cf8" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.4" />
                  </linearGradient>
                </defs>
              </svg>            </div>
            
            <p className="text-[10px] text-white/30 text-center font-sans mt-2">
              💡 Cyan bar highlights current focus subject. Indigo bars indicate other subjects' log averages.
            </p>
          </div>

          {/* AI Advisor Card based on real data metrics */}
          <div className="bg-[#111111]/80 backdrop-blur-md border border-white/5 hover:border-cyan-400/20 p-5 rounded-3xl shadow-2xl overflow-hidden min-h-[220px] flex flex-col justify-between transition-all duration-300 relative group">
            <div>
              <div className="flex justify-between items-center pb-2 border-b border-white/5 mb-4 font-sans">
                <h3 className="font-display font-medium text-white text-xs uppercase tracking-wide flex items-center gap-2">
                  <Sparkles size={15} className="text-cyan-400 group-hover:scale-110 transition-transform" />
                  AI Academic Diagnostics & Strategy
                </h3>
                <span className="text-[9px] font-mono text-white/30 uppercase">24/7 Action Advice</span>
              </div>

              {advisorMarkdown ? (
                <div id="ai-advisor-response" className="markdown-body text-left p-3 bg-[#050505] rounded-xl border border-white/5 max-h-[300px] overflow-y-auto font-sans text-xs">
                  <Markdown>{advisorMarkdown}</Markdown>
                </div>
              ) : (
                <div className="py-8 text-center text-white/10 font-sans">
                  <ShieldCheck size={36} className="mx-auto text-white/5 mb-2" />
                  <p className="text-xs text-white/40">
                    No active diagnostics compiled yet. Hit Compile below to run academic diagnostic advice on {activeSubject.name}.
                  </p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-white/5 mt-4 flex justify-between items-center gap-4">
              <span className="text-[10px] text-white/30 leading-relaxed font-mono">
                Reads: weak topics, hours, scores history.
              </span>
              <button
                id="generate-advisor-feedback-btn"
                onClick={handleGenerateAdvisor}
                disabled={isAdvising}
                className={`py-1.5 px-4 font-display text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
                  isAdvising 
                    ? "bg-white/5 text-white/20 cursor-not-allowed border border-white/5" 
                    : "bg-white hover:bg-neutral-200 text-black cursor-pointer hover:shadow-cyan-400/5 active:scale-95"
                }`}
              >
                {isAdvising ? (
                  <>
                    <Loader2 size={12} className="animate-spin text-cyan-400" />
                    Consulting Diagnostics...
                  </>
                ) : (
                  <>
                    <Sparkles size={12} className="text-cyan-400" />
                    Compile Diagnostic Review
                  </>
                )}
              </button>
            </div>

            {advisoryError && (
              <div className="p-2.5 bg-red-950/20 border border-red-900/30 rounded-lg text-[10px] text-red-300 mt-2">
                {advisoryError}
              </div>
            )}
          </div>

          {/* Practice History Scoreboard Logs list */}
          <div className="bg-[#111111]/80 backdrop-blur-md border border-white/5 hover:border-cyan-400/20 p-5 rounded-3xl shadow-2xl font-sans transition-all duration-300 relative group">
            <h3 className="font-display font-bold text-xs text-white uppercase tracking-wider mb-4 text-left">
              Assessment Scoreboard History
            </h3>
            
            {attempts.length === 0 ? (
              <p className="text-xs text-white/30 italic py-3 text-center">No scores tracked yet. Log practice tests above.</p>
            ) : (
              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                {attempts.map((attempt) => {
                  const sInfo = SUBJECTS_LIST.find(s => s.id === attempt.subjectId);
                  return (
                    <div
                      key={attempt.id}
                      className="p-2.5 bg-[#050505] hover:bg-[#0c0c0c] border border-white/5 rounded-xl flex items-center justify-between gap-4 transition-colors"
                    >
                      <div className="text-left select-none">
                        <span className="text-[9px] font-mono text-cyan-400 font-bold uppercase">{sInfo?.name.split(" ")[0]}</span>
                        <p className="text-xs text-white font-medium truncate max-w-[240px] mt-0.5">{attempt.topic}</p>
                        <span className="text-[8px] text-white/20 font-mono">{attempt.date}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                          attempt.score >= 85 
                            ? "bg-emerald-950/40 text-emerald-400 border border-emerald-900/30" 
                            : attempt.score >= 70 
                            ? "bg-cyan-950/40 text-cyan-300 border border-cyan-900/30" 
                            : "bg-[#7f1d1d]/45 text-[#fca5a5] border border-red-900/30"
                        }`}>
                          {attempt.score}%
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteAttempt(attempt.id)}
                          className="text-white/20 hover:text-red-400 transition-colors cursor-pointer focus:outline-none"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
