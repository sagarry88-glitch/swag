import { useState, useEffect } from "react";
import AuthScreen from "./components/AuthScreen";
import DoubtSolvingHub from "./components/DoubtSolvingHub";
import StudyGuidesCenter from "./components/StudyGuidesCenter";
import ProgressTracker from "./components/ProgressTracker";
import { User, SubjectId, SUBJECTS_LIST } from "./types";
import { 
  GraduationCap, 
  LogOut, 
  HelpCircle, 
  FileText, 
  Activity, 
  BookOpen, 
  Flame,
  Award,
  BookCheck,
  TrendingUp,
  Menu,
  X,
  Sparkles 
} from "lucide-react";

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<SubjectId>("cs_majors");
  const [activeTab, setActiveTab] = useState<"tutor" | "blueprint" | "diagnostics">("tutor");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  
  // Outer progress indicator counts
  const [milestonesFinishedCount, setMilestonesFinishedCount] = useState<number>(0);
  const [logTrigger, setLogTrigger] = useState<number>(0);
  const [overallAverage, setOverallAverage] = useState<number>(85);

  // Auto-authenticate existing student session
  useEffect(() => {
    const savedUser = localStorage.getItem("exam_prep_user");
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        console.warn("Stale student session removed.");
        localStorage.removeItem("exam_prep_user");
      }
    }
    
    // Compute dynamic test score average for the stats header badge
    const savedLogs = localStorage.getItem("exam_prep_practice_attempts");
    if (savedLogs) {
      try {
        const attempts = JSON.parse(savedLogs);
        if (attempts && attempts.length > 0) {
          const avg = Math.round(attempts.reduce((acc: number, c: any) => acc + c.score, 0) / attempts.length);
          setOverallAverage(avg);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [logTrigger]);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    
    // Auto adapt subject selector to Computer Science if they are CS major
    if (user.major && user.major.includes("Computer Science")) {
      setSelectedSubjectId("cs_majors");
    } else {
      setSelectedSubjectId("science");
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("exam_prep_user");
    setCurrentUser(null);
  };

  // Callback to force metric score-bars to refresh
  const triggerStatsRefresh = () => {
    setLogTrigger(prev => prev + 1);
  };

  const handleMilestonesUpdate = (completedCount: number) => {
    setMilestonesFinishedCount(completedCount);
  };

  if (!currentUser) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  }

  const activeSubjectInfo = SUBJECTS_LIST.find(s => s.id === selectedSubjectId) || SUBJECTS_LIST[0];

  const sidebarContent = (
    <>
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg text-black flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.25)]">
            <GraduationCap size={18} className="text-black font-extrabold" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-white leading-none">
              EXAM<span className="text-cyan-400">PREP</span> HD
            </h1>
            <p className="text-[9px] uppercase tracking-widest text-white/40 mt-1">CS Undergrad Edition</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        {/* Core View Tabs Switching */}
        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] text-white/30 px-3 mb-2.5 font-mono">Academic Workspace</p>
          <ul className="space-y-1">
            <li>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("tutor");
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 transition-all text-xs font-semibold cursor-pointer ${
                  activeTab === "tutor"
                    ? "bg-white/5 border-l-2 border-cyan-400 text-white"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <HelpCircle size={14} className={activeTab === "tutor" ? "text-cyan-400" : "text-white/40"} />
                24/7 AI Doubt Solver
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("blueprint");
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 transition-all text-xs font-semibold cursor-pointer ${
                  activeTab === "blueprint"
                    ? "bg-white/5 border-l-2 border-cyan-400 text-white"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <FileText size={14} className={activeTab === "blueprint" ? "text-cyan-400" : "text-white/40"} />
                Custom 7-Day Roadmaps
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("diagnostics");
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 transition-all text-xs font-semibold cursor-pointer ${
                  activeTab === "diagnostics"
                    ? "bg-white/5 border-l-2 border-cyan-400 text-white"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <Activity size={14} className={activeTab === "diagnostics" ? "text-cyan-400" : "text-white/40"} />
                Progress Cockpit
              </button>
            </li>
          </ul>
        </div>

        {/* Subjects list */}
        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] text-white/30 px-3 mb-2.5 font-mono">Core Course Syllabus</p>
          <ul className="space-y-1">
            {SUBJECTS_LIST.map((subject) => {
              const isActive = subject.id === selectedSubjectId;
              return (
                <li key={subject.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSubjectId(subject.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between text-xs font-medium cursor-pointer transition-colors ${
                      isActive
                        ? "bg-white/5 border-l-2 border-cyan-400 text-white"
                        : "text-white/60 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <span className="truncate pr-2">{subject.name}</span>
                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0"></div>}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* Student Profile Ledger info bottom of sidebar */}
      <div className="p-4 border-t border-white/10 bg-[#060606]">
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white text-xs uppercase select-none shadow-md">
            {currentUser.name ? currentUser.name[0] : "S"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
            <p className="text-[9px] text-white/40 truncate uppercase tracking-wider">{currentUser.studentId || "Student ID"}</p>
          </div>
        </div>
        <div className="mt-2.5 px-1 flex items-center justify-between text-[10px] text-white/30 font-mono">
          <span>Standard: {currentUser.major?.split(" ")[0]}</span>
          <span>Prep v1.5</span>
        </div>
      </div>
    </>
  );

  return (
    <div id="full-workspace-orchestrator" className="min-h-screen bg-gradient-to-tr from-indigo-50/70 via-purple-50/40 to-sky-100/40 text-slate-800 font-sans flex flex-col md:flex-row overflow-hidden selection:bg-indigo-500/10 selection:text-indigo-900">
      
      {/* 1. Left Sidebar for desktop */}
      <aside className="w-72 border-r border-[#1e293b]/10 bg-slate-900 text-slate-100 hidden md:flex flex-col h-screen sticky top-0 shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Top Nav bar */}
      <div className="md:hidden bg-slate-900 text-slate-100 border-b border-slate-800 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-gradient-to-br from-indigo-500 to-purple-500 rounded text-black flex items-center justify-center">
            <GraduationCap size={15} className="text-white" />
          </div>
          <span className="text-sm font-black text-white font-display">EXAMPREP HD</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] text-indigo-400 font-mono bg-indigo-950/40 border border-indigo-900 px-1.5 py-0.5 rounded uppercase">{activeSubjectInfo.name.split(" ")[0]}</span>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 hover:bg-white/5 text-white/80 rounded border border-white/10"
          >
            {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[49px] bg-slate-900 z-40 flex flex-col border-b border-slate-800 animate-fade-in text-slate-100">
          {sidebarContent}
        </div>
      )}

      {/* 2. Main Workspace on the right */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto h-screen">
        
        {/* Upper Header / Stats Bar */}
        <header className="h-20 border-b border-indigo-100 flex items-center justify-between px-6 md:px-8 bg-white/60 backdrop-blur-md shrink-0 gap-4 flex-wrap sm:flex-nowrap py-2 z-40">
          <div className="flex gap-4 md:gap-8 items-center select-none overflow-hidden">
            <div>
              <p className="text-[9px] font-mono tracking-widest uppercase text-slate-400 mb-0.5 font-bold">Preparation Streak</p>
              <p className="text-sm md:text-md font-bold text-slate-800 flex items-center gap-1">
                <Flame size={14} className="text-orange-500 fill-orange-500" />
                14 Days Study
              </p>
            </div>
            
            <div className="w-px h-6 bg-slate-200"></div>
            
            <div>
              <p className="text-[9px] font-mono tracking-widest uppercase text-slate-400 mb-0.5 font-bold">Average Grade</p>
              <p className="text-sm md:text-md font-bold text-indigo-600">{overallAverage > 0 ? `${overallAverage}%` : "85%"}</p>
            </div>

            <div className="w-px h-6 bg-slate-200 hidden sm:block"></div>

            <div className="hidden sm:block truncate">
              <p className="text-[9px] font-mono tracking-widest uppercase text-slate-400 mb-0.5 font-bold">Focus Subject</p>
              <p className="text-xs font-semibold text-slate-700 truncate max-w-[140px] md:max-w-none">{activeSubjectInfo.name}</p>
            </div>
          </div>

          <div className="flex gap-2.5 items-center">
            <button
              onClick={() => {
                setActiveTab("tutor");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-[10px] md:text-xs font-bold rounded-full uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-indigo-200/40 shadow-lg active:scale-95"
            >
              Ask Doubt Now
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="px-3.5 py-2 border border-slate-200 hover:border-red-500 hover:bg-red-50 text-slate-500 hover:text-red-600 text-[10px] md:text-xs font-bold rounded-full transition-all cursor-pointer"
              title="Sign Out Student Account"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Dynamic Inner Panel Cockpit View */}
        <div className="flex-1 p-4 sm:p-6 md:p-8 space-y-8 max-w-7xl w-full mx-auto">
          
          {/* Bento Grid Header */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
            {/* Bento Card 1: User Profile & Welcome */}
            <div className="md:col-span-8 bg-white/60 backdrop-blur-md border border-white/60 hover:border-indigo-400/30 p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between shadow-xl shadow-indigo-100/20 leading-relaxed transition-all duration-300 group text-left">
              <div className="absolute top-0 right-0 p-8 text-neutral-800/5 font-bold text-7xl select-none pointer-events-none tracking-tighter uppercase font-display hidden md:block select-none pointer-events-none">
                LEARN
              </div>

              <div className="space-y-1.5 relative z-10">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-indigo-500/10 border border-indigo-400/20 text-indigo-700 text-[9px] font-mono rounded-full font-bold uppercase tracking-wider">
                  <Sparkles size={10} className="animate-pulse text-indigo-600" />
                  Syllabus Study Active
                </div>
                <h2 className="font-display font-black text-slate-900 text-lg md:text-2xl tracking-tight uppercase mt-2.5">
                  Welcome back, {currentUser.name}!
                </h2>
                <p className="text-xs text-slate-600 max-w-xl">
                  Experience the 24/7 AI academic workspace. Get instant equations solving, 7-day custom roadmap binders, Kannada translation metrics, and computer science performance radar graphs.
                </p>
              </div>

              <div className="mt-4 flex items-center gap-2 relative z-10 text-[9px] font-mono text-slate-400 uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Tutor node connection: Online
              </div>
            </div>

            {/* Bento Card 2: Student Ledger Card */}
            <div className="md:col-span-4 bg-white/60 backdrop-blur-md border border-white/60 hover:border-indigo-400/30 p-6 rounded-3xl flex flex-col justify-between shadow-xl shadow-indigo-100/20 transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 text-neutral-800/5 font-bold text-7xl select-none pointer-events-none tracking-tighter uppercase font-display hidden md:block select-none pointer-events-none">
                ID
              </div>
              <div className="text-left space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-indigo-600 font-extrabold uppercase tracking-widest font-mono block">Academic Ledger</span>
                  <BookCheck size={14} className="text-indigo-600/50" />
                </div>
                <div className="space-y-1">
                  <div className="text-slate-800 text-sm font-bold font-display truncate">Stream: {currentUser.major || "Computer Science"}</div>
                  <div className="text-slate-500 font-mono text-xs">Enrolment: {currentUser.studentId}</div>
                  <div className="text-slate-400 font-mono text-[9px]">Class: Standard regional syllabus</div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 font-mono">
                <span>Standard: {currentUser.major?.split(" ")[0]}</span>
                <span>Prep v1.5</span>
              </div>
            </div>
          </div>

          {/* Core Panel Content Switches wrapper */}
          <section id="orchestrator-active-panel">
            {activeTab === "tutor" && (
              <DoubtSolvingHub
                key={`tutor-${selectedSubjectId}-${logTrigger}`}
                selectedSubjectId={selectedSubjectId}
                onLoggedSolveAttempt={triggerStatsRefresh}
              />
            )}

            {activeTab === "blueprint" && (
              <StudyGuidesCenter
                key={`blueprint-${selectedSubjectId}`}
                selectedSubjectId={selectedSubjectId}
                onLoggedMilestoneComplete={handleMilestonesUpdate}
              />
            )}

            {activeTab === "diagnostics" && (
              <ProgressTracker
                key={`tracker-${selectedSubjectId}-${logTrigger}`}
                selectedSubjectId={selectedSubjectId}
                milestonesFinishedCount={milestonesFinishedCount}
              />
            )}
          </section>

        </div>

        {/* Elegant Minimal Footer */}
        <footer className="border-t border-indigo-100 bg-white/40 py-6 text-center text-[10px] text-slate-400 tracking-wider">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="font-mono text-slate-500">
              EXAMPREP HD • Interactive Exam Preparation Suite
            </p>
            <p className="text-slate-400">
              Karnataka Regional Syllabus • CS Undergrad Modules • 24/7 Academic Solver Nodes
            </p>
          </div>
        </footer>

      </main>

    </div>
  );
}
