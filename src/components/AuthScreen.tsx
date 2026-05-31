import { useState } from "react";
import { LogIn, UserPlus, BookOpen, GraduationCap, ShieldAlert } from "lucide-react";
import { User } from "../types";

interface AuthScreenProps {
  onLoginSuccess: (user: User) => void;
}

export default function AuthScreen({ onLoginSuccess }: AuthScreenProps) {
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [studentId, setStudentId] = useState<string>("");
  const [major, setMajor] = useState<string>("Computer Science");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleTestDrive = () => {
    const demoStudent: User = {
      id: "demo-student-101",
      name: "Sagar Kumar",
      email: "sagarry88@gmail.com",
      studentId: "USN-2026-CS109",
      major: "Undergrad Computer Science",
      joinedDate: new Date().toLocaleDateString()
    };
    localStorage.setItem("exam_prep_user", JSON.stringify(demoStudent));
    onLoginSuccess(demoStudent);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all credentials.");
      return;
    }

    // Simple robust localStorage simulation authentication
    const storedUsersJson = localStorage.getItem("exam_prep_registered_users");
    const registeredUsers: any[] = storedUsersJson ? JSON.parse(storedUsersJson) : [];
    
    const matchedUser = registeredUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (matchedUser) {
      const userObj: User = {
        id: matchedUser.id,
        name: matchedUser.name,
        email: matchedUser.email,
        studentId: matchedUser.studentId || `STU-${Math.floor(1000 + Math.random() * 9000)}`,
        major: matchedUser.major || "Computer Science",
        joinedDate: matchedUser.joinedDate || new Date().toLocaleDateString()
      };
      localStorage.setItem("exam_prep_user", JSON.stringify(userObj));
      onLoginSuccess(userObj);
    } else {
      // Default fallback for demo simplicity so they don't get frustrated
      const localAutoUser: User = {
        id: `usr-${Date.now()}`,
        name: email.split("@")[0].toUpperCase(),
        email: email,
        studentId: "USN-2026-AUTO",
        major: "Computer Science Major",
        joinedDate: new Date().toLocaleDateString()
      };
      localStorage.setItem("exam_prep_user", JSON.stringify(localAutoUser));
      onLoginSuccess(localAutoUser);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password || !studentId) {
      setError("Please provide all registration details.");
      return;
    }

    const storedUsersJson = localStorage.getItem("exam_prep_registered_users");
    const registeredUsers: any[] = storedUsersJson ? JSON.parse(storedUsersJson) : [];

    const alreadyExists = registeredUsers.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (alreadyExists) {
      setError("A student with this email is already registered.");
      return;
    }

    const newRegistered = {
      id: `usr-${Date.now()}`,
      name,
      email,
      studentId,
      major,
      joinedDate: new Date().toLocaleDateString()
    };

    registeredUsers.push(newRegistered);
    localStorage.setItem("exam_prep_registered_users", JSON.stringify(registeredUsers));

    const finalUser: User = {
      id: newRegistered.id,
      name: newRegistered.name,
      email: newRegistered.email,
      studentId: newRegistered.studentId,
      major: newRegistered.major,
      joinedDate: newRegistered.joinedDate
    };

    localStorage.setItem("exam_prep_user", JSON.stringify(finalUser));
    onLoginSuccess(finalUser);
  };

  return (
    <div id="auth-screen-container" className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-indigo-50/80 via-purple-50/40 to-sky-100/50 text-slate-800 p-4 relative overflow-hidden font-sans">
      {/* Visual background accents mimicking HD futuristic particle grids */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>
      
      {/* Decorative floating grids */}
      <div className="absolute top-10 right-10 leading-none text-slate-900/5 font-mono text-[9px] select-none tracking-widest opacity-15 pointer-events-none">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i}>{"1010101 ".repeat(8)}</div>
        ))}
      </div>
      
      <div id="auth-card-wrapper" className="w-full max-w-sm bg-white/70 backdrop-blur-md border border-white/80 rounded-3xl shadow-2xl relative overflow-hidden p-6 md:p-8">
        
        {/* Glowing header line */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-indigo-500 via-purple-500 to-sky-400"></div>
        
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-50 rounded-2xl border border-indigo-100 text-indigo-600 mb-3 shadow-md select-none">
            <GraduationCap size={32} />
          </div>
          <h1 className="font-display text-xl md:text-2xl font-black tracking-tight text-slate-950 leading-none">
            EXAM<span className="text-indigo-600">PREP</span> HD
          </h1>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed font-medium">
            24/7 Premium Exam Prep & AI Doubt Solver Portal
          </p>
        </div>

        {error && (
          <div id="auth-error-notif" className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs flex items-center gap-2 text-red-600 text-left">
            <ShieldAlert size={16} className="text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Action Toggle buttons */}
        <div className="flex bg-slate-100/80 p-1 rounded-xl border border-slate-200/50 mb-5 font-display text-xs">
          <button
            type="button"
            className={`flex-1 py-1.5 rounded-lg font-bold transition-all text-center cursor-pointer ${
              !isRegistering
                ? "bg-white text-slate-900 border border-slate-200/80 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
            onClick={() => {
              setIsRegistering(false);
              setError("");
            }}
          >
            Student Login
          </button>
          <button
            type="button"
            className={`flex-1 py-1.5 rounded-lg font-bold transition-all text-center cursor-pointer ${
              isRegistering
                ? "bg-white text-slate-900 border border-slate-200/80 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
            onClick={() => {
              setIsRegistering(true);
              setError("");
            }}
          >
            New Registration
          </button>
        </div>

        {!isRegistering ? (
          <form id="login-form-element" onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="text-left font-sans">
              <label className="block text-[9px] font-bold text-slate-500 mb-1 font-mono tracking-widest uppercase">
                Email Address
              </label>
              <input
                id="login-email-input"
                type="email"
                required
                className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl py-2 px-3.5 text-xs text-slate-800 focus:outline-none transition-all"
                placeholder="you@school.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="text-left font-sans">
              <label className="block text-[9px] font-bold text-slate-500 mb-1 font-mono tracking-widest uppercase">
                Password
              </label>
              <input
                id="login-password-input"
                type="password"
                required
                className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl py-2 px-3.5 text-xs text-slate-800 focus:outline-none transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              id="login-btn-submit"
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-indigo-100 transition-all cursor-pointer"
            >
              <LogIn size={14} />
              Let's Study
            </button>
          </form>
        ) : (
          <form id="register-form-element" onSubmit={handleRegisterSubmit} className="space-y-4">
            <div className="text-left font-sans">
              <label className="block text-[9px] font-bold text-slate-500 mb-1 font-mono tracking-widest uppercase">
                Full Name
              </label>
              <input
                id="reg-name-input"
                type="text"
                required
                className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none transition-all"
                placeholder="Sagar Ry"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="text-left font-sans">
              <label className="block text-[9px] font-bold text-slate-500 mb-1 font-mono tracking-widest uppercase">
                Register / Roll Number / Student ID
              </label>
              <input
                id="reg-stu-id-input"
                type="text"
                required
                className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none transition-all"
                placeholder="USN-2026-CS405"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
              />
            </div>

            <div className="text-left font-sans">
              <label className="block text-[9px] font-bold text-slate-500 mb-1 font-mono tracking-widest uppercase">
                Academic Program / Stream
              </label>
              <select
                id="reg-major-select"
                className="w-full bg-white text-slate-800 border border-slate-200 focus:border-indigo-500 rounded-xl py-2 px-3 text-xs focus:outline-none transition-all"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
              >
                <option value="Undergrad Computer Science (UGCS)">Undergrad Computer Science Major</option>
                <option value="Pre-University Science">Pre-University Science Division</option>
                <option value="High School General Stream">High School / K-12 Student</option>
                <option value="Regional Literature Major (Kannada)">Regional Literature & Languages</option>
                <option value="Other Technical Major">Other Technical/Engineering</option>
              </select>
            </div>

            <div className="text-left font-sans">
              <label className="block text-[9px] font-bold text-slate-500 mb-1 font-mono tracking-widest uppercase">
                Email Address
              </label>
              <input
                id="reg-email-input"
                type="email"
                required
                className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none transition-all"
                placeholder="student@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="text-left font-sans">
              <label className="block text-[9px] font-bold text-slate-500 mb-1 font-mono tracking-widest uppercase">
                Password
              </label>
              <input
                id="reg-password-input"
                type="password"
                required
                className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none transition-all"
                placeholder="Create strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              id="register-btn-submit"
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-indigo-100 transition-all cursor-pointer"
            >
              <UserPlus size={14} />
              Register Account & Enter
            </button>
          </form>
        )}

        <div className="relative my-6 text-center text-xs">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-200"></span>
          </div>
          <span className="relative bg-white/80 px-2 text-slate-400 uppercase tracking-widest font-display text-[9px]">
            Fast Evaluator Access
          </span>
        </div>

        {/* Demo Fast Access login button */}
        <button
          id="fast-drive-demo-btn"
          type="button"
          onClick={handleTestDrive}
          className="w-full bg-indigo-50 hover:bg-indigo-100 active:scale-[0.98] transition-all text-indigo-700 font-bold border border-indigo-100 rounded-xl py-2 px-4 text-xs font-mono flex items-center justify-center gap-2.5 cursor-pointer"
        >
          <BookOpen size={13} className="text-indigo-600 animate-pulse" />
          Quick Test-Drive Access
        </button>

        <div className="text-center mt-5 text-[10px] text-slate-400 font-medium leading-normal">
          Learn anywhere & anytime • Verified solutions in English & Regional Kannada
        </div>
      </div>
    </div>
  );
}
