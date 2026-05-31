import { BookOpen, Beaker, Percent, FileText, FileCode, Cpu, Terminal, Layers, BookCheck } from "lucide-react";
import { SubjectId, SUBJECTS_LIST, SubjectInfo } from "../types";

const getIcon = (iconName: string) => {
  switch (iconName) {
    case "BookOpen": return <BookOpen className="shrink-0" size={24} />;
    case "Beaker": return <Beaker className="shrink-0" size={24} />;
    case "Percent": return <Percent className="shrink-0" size={24} />;
    case "FileText": return <FileText className="shrink-0" size={24} />;
    case "FileCode": return <FileCode className="shrink-0" size={24} />;
    case "Cpu": return <Cpu className="shrink-0" size={24} />;
    case "Terminal": return <Terminal className="shrink-0" size={24} />;
    case "Layers": return <Layers className="shrink-0" size={24} />;
    default: return <BookOpen className="shrink-0" size={24} />;
  }
};

interface SubjectSelectorProps {
  selectedSubjectId: SubjectId;
  onSelectSubject: (id: SubjectId) => void;
}

export default function SubjectSelector({ selectedSubjectId, onSelectSubject }: SubjectSelectorProps) {
  return (
    <div id="subject-selection-module" className="bg-[#111] border border-white/5 rounded-2xl p-6 relative overflow-hidden shadow-2xl">
      <div className="absolute top-0 right-0 p-8 text-cyan-400/5 select-none font-black text-6xl pointer-events-none uppercase font-display">
        Syllabus
      </div>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-white/5 mb-6 gap-3 text-left">
        <div>
          <h2 className="font-display font-medium text-md text-white flex items-center gap-2">
            <BookCheck className="text-cyan-400 group-hover:scale-110 transition-transform" size={18} />
            Academic Curriculum Subjects
          </h2>
          <p className="text-xs text-[#cccccc] mt-1">
            Choose your focus module for personalized doubt solving and study blueprints.
          </p>
        </div>
        <div className="text-[10px] px-2.5 py-1 bg-white/5 border border-white/10 rounded-full text-white/60 font-mono self-start md:self-auto">
          Active: <span className="text-cyan-400 font-bold uppercase">{selectedSubjectId}</span>
        </div>
      </div>

      <div id="subject-cards-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {SUBJECTS_LIST.map((subject: SubjectInfo) => {
          const isSelected = subject.id === selectedSubjectId;
          return (
            <button
              key={subject.id}
              id={`subject-card-${subject.id}`}
              onClick={() => onSelectSubject(subject.id)}
              className={`text-left p-4 rounded-xl border transition-all duration-300 relative group overflow-hidden cursor-pointer ${
                isSelected
                  ? `bg-[#1c1c1c] border-cyan-400/40 shadow-lg scale-[1.01]`
                  : "bg-[#0a0a0a]/60 border-white/5 hover:border-white/10 text-[#cccccc] hover:bg-[#0c0c0c]"
              }`}
            >
              {/* Card visual highlight glow */}
              <div
                className={`absolute inset-0 bg-gradient-to-br from-white/2 to-transparent transition-opacity duration-300 ${
                  isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-40"
                }`}
              ></div>

              <div className="flex items-center gap-3 relative z-10">
                <div
                  className={`p-2.5 rounded-lg border transition-all ${
                    isSelected
                      ? "bg-[#050505] border-white/10 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.1)]"
                      : "bg-[#050505] border-white/5 text-white/30 group-hover:text-[#e0e0e0]"
                  }`}
                >
                  {getIcon(subject.icon)}
                </div>
                <div>
                  <h3 className="font-display font-medium text-xs md:text-sm text-white group-hover:text-cyan-400 transition-colors">
                    {subject.name}
                  </h3>
                  <span className="text-[9px] font-mono text-white/30">
                    {subject.id === "cs_majors" ? "Engineering/UG" : "School & College Coding"}
                  </span>
                </div>
              </div>

              {/* Subject details description */}
              <p className="mt-3 text-xs text-white/50 line-clamp-2 relative z-10 leading-relaxed">
                {subject.description}
              </p>

              {/* Mini syllabus indicators */}
              <div className="mt-4 flex flex-wrap gap-1 relative z-10">
                {subject.curriculumTopics.slice(0, 2).map((topic, index) => (
                  <span
                    key={index}
                    className="text-[9px] bg-[#050505] px-1.5 py-0.5 rounded border border-white/5 text-white/40 truncate max-w-[120px]"
                  >
                    {topic}
                  </span>
                ))}
                {subject.curriculumTopics.length > 2 && (
                  <span className="text-[8px] bg-[#050505] text-white/20 px-1 rounded border border-white/5 self-center">
                    +{subject.curriculumTopics.length - 2} more
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
