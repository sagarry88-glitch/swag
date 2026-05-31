import { useState, useEffect } from "react";
import { 
  Sparkles, 
  BookOpen, 
  Award, 
  CheckSquare, 
  Square, 
  Flame, 
  ChevronRight, 
  Loader2, 
  CheckCircle, 
  Save, 
  Trash2,
  BookmarkCheck,
  Zap,
  HelpCircle
} from "lucide-react";
import Markdown from "react-markdown";
import { SubjectId, SUBJECTS_LIST, StudyGuide } from "../types";

interface StudyGuidesCenterProps {
  selectedSubjectId: SubjectId;
  onLoggedMilestoneComplete: (completedCount: number) => void;
}

// Interactive custom high-yield flashcard decks for each subject, used as excellent sandbox fallbacks
const FALLBACK_FLASHCARDS: Record<SubjectId, { q: string; a: string }[]> = {
  kannada: [
    { q: "ಕನ್ನಡ ವರ್ಣಮಾಲೆಯಲ್ಲಿ ಎಷ್ಟು ಅಕ್ಷರಗಳಿವೆ ಮತ್ತು ಅವುಗಳ ವಿಭಾಗಗಳು ಯಾವುವು?", a: "ಕನ್ನಡ ವರ್ಣಮಾಲೆಯಲ್ಲಿ ಒಟ್ಟು ೪೯ ಅಕ್ಷರಗಳಿವೆ. ಅವುಗಳನ್ನು ಸ್ವರಗಳು (೧೩), ಯೋಗವಾಹಗಳು (೨) ಮತ್ತು ವ್ಯಂಜನಗಳು (೩೪) ಎಂದು ಮೂರು ಭಾಗಗಳಾಗಿ ವಿಂಗಡಿಸಲಾಗಿದೆ." },
    { q: "ಲೋಪ ಸಂಧಿ ಎಂದರೆ ಏನು? ಉದಾಹರಣೆ ನೀಡಿ.", a: "ಸ್ವರದ ಮುಂದೆ ಸ್ವರವು ಬಂದು ಸಂಧಿ ಆಗುವಾಗ, ಪೂರ್ವಸ್ವರವು ಅರ್ಥಕ್ಕೆ ಲೋಪವಾಗದಂತೆ ಬಿಟ್ಟುಹೋಗುವುದೇ ಲೋಪಸಂಧಿ. ಉದಾ: ಊರು + ಊರು = ಊರೂರು." },
    { q: "ಜೈಮಿನಿ ಭಾರತ ಕಾವ್ಯದ ಕರ್ತೃ ಯಾರು?", a: "ಜೈಮಿನಿ ಭಾರತ ಕಾವ್ಯದ ಕರ್ತೃ ಮಹಾಕವಿ ಲಕ್ಷ್ಮೀಶ. ಇದು ಭಾಮಿನಿ ಷಟ್ಪದಿ ಛಂದಸ್ಸಿನಲ್ಲಿದೆ." },
    { q: "ದ್ವಿರುಕ್ತಿ ಎಂದರೆ ಏನು?", a: "ಒಂದೇ ಶಬ್ದವನ್ನು ತೀವ್ರತೆ, ಉತ್ಸಾಹ ಅಥವಾ ಆಶ್ಚರ್ಯವನ್ನು ವ್ಯಕ್ತಪಡಿಸಲು ಎರಡು ಬಾರಿ ಉಚ್ಚರಿಸುವುದು ದ್ವಿರುಕ್ತಿ ಎನಿಸುತ್ತದೆ. ಉದಾ: ಬೇಗಬೇಗ, ದೊಡ್ಡದೊಡ್ಡ." },
    { q: "ಕನ್ನಡದ ಪ್ರಥಮ ರಾಷ್ಟ್ರಕವಿ ಯಾರು?", a: "ಮಂಜೇಶ್ವರ ಗೋವಿಂದ ಪೈ ಅವರು ಕನ್ನಡದ ಪ್ರಥಮ ರಾಷ್ಟ್ರಕವಿ ಬಿರುದನ್ನು ಪಡೆದಿದ್ದಾರೆ." }
  ],
  science: [
    { q: "What is the function of Mitochondria in a cell?", a: "Mitochondria are the powerhouse of the cell. They generate chemical energy in the form of Adenosine Triphosphate (ATP) via cellular respiration." },
    { q: "State Ohm's Law and its formula.", a: "Ohm's Law states that the current passing through a conductor is directly proportional to the voltage drop across it, provided physical limits remain constant. Formula: V = I * R." },
    { q: "What is the difference between an Acid and a Base?", a: "Acids produce hydrogen ions (H+) in aqueous solutions and have a pH < 7. Bases produce hydroxide ions (OH-) and have a pH > 7." },
    { q: "Why do stars twinkle while planets do not?", a: "Stars twinkle because they are point sources of light affected by turbulent atmospheric refraction. Planets, being closer, act as extended light sources whose fluctuations average out." },
    { q: "Which gas is released during photosynthesis?", a: "Oxygen (O2) gas is released as a byproduct during the photolysis of water in the light reaction of photosynthesis." }
  ],
  maths: [
    { q: "What is the quadratic formula to find roots of ax² + bx + c = 0?", a: "The roots are given by x = [-b ± √(b² - 4ac)] / (2a)." },
    { q: "State Pythagorean theorem and its conditions.", a: "In a right-angled triangle, the square of the hypotenuse is equal to the sum of the squares of the other two sides: a² + b² = c²." },
    { q: "What is the derivative of e^(5x) with respect to x?", a: "Using the chain rule: dy/dx = 5 * e^(5x)." },
    { q: "Explain the difference between Permutations and Combinations.", a: "Permutations represent arrangements where order matters (e.g. lockers), while Combinations represent selections where order does not matter (e.g. squads)." },
    { q: "What is Euler's Formula for polyhedra?", a: "Euler's Formula is F + V - E = 2, where F is faces, V is vertices, and E is edges." }
  ],
  english: [
    { q: "What is a split infinitive in grammar?", a: "A split infinitive occurs when an adverb or phrase is placed between 'to' and the base verb. Example: 'to quickly run' instead of 'to run quickly'." },
    { q: "What is the difference between 'Its' and 'It's'?", a: "'Its' is a possessive pronoun indicating association, while 'It's' is a contraction of 'it is' or 'it has'." },
    { q: "Define an Onomatopoeia with two examples.", a: "An onomatopoeia is a word that phonetically mimics or resembles the sound that it describes. Examples: 'Buzz', 'Boom', 'Sizzle'." },
    { q: "When do we use 'whom' instead of 'who'?", a: "'Who' is used as the subject of a sentence, while 'whom' is used as the object of a verb or preposition." },
    { q: "What is a metaphor?", a: "A figure of speech that directly compares one thing to another for rhetorical effect, without using comparison words like 'like' or 'as'. Example: 'Time is a thief'." }
  ],
  python: [
    { q: "What is the difference between a list and a tuple in Python?", a: "Lists are mutable (can be changed after creation, declared with brackets []), whereas tuples are immutable (read-only once built, declared with parentheses ())." },
    { q: "What does the dynamic self variable do in Python class methods?", a: "The 'self' keyword references the active instance of the class being created or operated upon, enabling access to attributes and local object memory." },
    { q: "Explain list comprehensions with a quick syntax example.", a: "List comprehension is a concise way to create lists. Example: standard squares = [x**2 for x in range(5)] produces [0, 1, 4, 9, 16]." },
    { q: "What is the difference between 'is' and '==' in Python?", a: "'==' checks for equality of values, while 'is' checks for identity (whether both variables point to the same object in internal memory)." },
    { q: "How do you handle runtime errors gracefully in Python?", a: "By using try-except blocks. Example:\ntry:\n  # code\nexcept ZeroDivisionError:\n  # recovery" }
  ],
  c: [
    { q: "What is a pointer variable in C?", a: "A pointer is a variable that stores the physical memory address of another variable or data resource instead of storing raw values." },
    { q: "What does the malloc() function do and where is it located?", a: "malloc() stands for Memory Allocation. It allocates a specific chunk of bytes on the heap at runtime and returns a void pointer. It is in <stdlib.h>." },
    { q: "What is a segmentation fault in C?", a: "A segmentation fault occurs when a program attempts to access a memory block that it is not permitted to touch, such as dereferencing a NULL pointer." },
    { q: "Explain the difference between a Structure and a Union in C.", a: "A struct allocates unique memory for every member, whereas a union shares the same memory space among all members, sizing itself to the largest item." },
    { q: "Why is it critical to use free() after calling dynamic allocation?", a: "To prevent memory leaks. Undetected leaks consume RAM continuously, eventually crashing the host container or operating system." }
  ],
  java: [
    { q: "What is Java virtual machine (JVM)?", a: "JVM is an abstract engine that compiles Java bytecode (.class files) into native machine instructions on the specific hosting operating system." },
    { q: "What does the static keyword mean in Java?", a: "A static member belongs to the class itself rather than to individual instances of that class. Only one copy exists across all occurrences." },
    { q: "What is the Java Collections Framework Map interface?", a: "It is an object mapping keys to values (e.g., HashMap, TreeMap). Duplicate keys are prohibitively isolated; each key maps to exactly one value." },
    { q: "Explain the difference between Method Overloading and Method Overriding.", a: "Overloading occurs in the same class (same name, different parameter signature). Overriding occurs in subclass inheritance (same name, same signature, custom behavior)." },
    { q: "What is garbage collection in Java?", a: "It is an automatic JVM background thread that flags and sweeps objects that are no longer referenced in the program heap, reclaiming memory automatically." }
  ],
  cs_majors: [
    { q: "What is B-Tree database indexing and why is it preferred over Binary Search Trees?", a: "B-Trees are self-balancing multi-way search trees. They minimize disk I/O operations by packaging massive nodes matching the virtual disk segment blocks." },
    { q: "State the difference between TCP and UDP protocols.", a: "TCP is connection-oriented, offering reliable, ordered, error-checked packet streaming. UDP is connectionless, prioritizing low latency over packet recovery." },
    { q: "Explain the ACID properties of databases.", a: "A: Atomicity (all or nothing), C: Consistency (valid states), I: Isolation (concurrent safety), D: Durability (survives crashes)." },
    { q: "Explain Dijkstra's shortest path time complexity parameters.", a: "Using a binary heap, it is O((V + E) * log V) as vertex extraction takes log V and relaxation checks happen E times." },
    { q: "What is virtual memory and swapping in an OS?", a: "Virtual memory maps logical addresses to physical RAM, utilizing disk storage (backing store) to swap inactive segments in and out when RAM overhead is high." }
  ]
};

export default function StudyGuidesCenter({ selectedSubjectId, onLoggedMilestoneComplete }: StudyGuidesCenterProps) {
  // Inputs
  const [curriculumDetails, setCurriculumDetails] = useState<string>("");
  const [goals, setGoals] = useState<string>("");
  const [academicLevel, setAcademicLevel] = useState<string>("Undergraduate / College Major");

  const [activeGuide, setActiveGuide] = useState<StudyGuide | null>(null);
  const [allGuides, setAllGuides] = useState<StudyGuide[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  // Interactive Checklist states for the active guide7 days
  const [milestones, setMilestones] = useState<boolean[]>([false, false, false, false, false, false, false]);

  // Flashcards state
  const [flashcardDeck, setFlashcardDeck] = useState<{ q: string; a: string }[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  const activeSubject = SUBJECTS_LIST.find(s => s.id === selectedSubjectId) || SUBJECTS_LIST[0];

  useEffect(() => {
    // Load study guides
    const saved = localStorage.getItem("exam_prep_study_guides");
    if (saved) {
      try {
        const guides: StudyGuide[] = JSON.parse(saved);
        setAllGuides(guides);
        
        // Match active guide for this subject if exists
        const matched = guides.find(g => g.subjectId === selectedSubjectId);
        if (matched) {
          loadActiveGuide(matched);
        } else {
          setActiveGuide(null);
          // Set standard flashcard deck
          setFlashcardDeck(FALLBACK_FLASHCARDS[selectedSubjectId] || FALLBACK_FLASHCARDS.science);
          setCurrentCardIndex(0);
          setIsFlipped(false);
        }
      } catch (e) {
        console.error("Failed to parse study guides library", e);
      }
    } else {
      setFlashcardDeck(FALLBACK_FLASHCARDS[selectedSubjectId] || FALLBACK_FLASHCARDS.science);
    }
  }, [selectedSubjectId]);

  const loadActiveGuide = (guide: StudyGuide) => {
    setActiveGuide(guide);
    
    // Load matching checkboxes progress
    const checkedSaved = localStorage.getItem(`exam_prep_milestones_${guide.id}`);
    if (checkedSaved) {
      try {
        setMilestones(JSON.parse(checkedSaved));
      } catch (e) {
        setMilestones([false, false, false, false, false, false, false]);
      }
    } else {
      setMilestones([false, false, false, false, false, false, false]);
    }

    // Attempt to extract custom Flashcards from the guide text!
    const extracted = extractFlashcardsFromMarkdown(guide.guideMarkdown);
    if (extracted && extracted.length > 0) {
      setFlashcardDeck(extracted);
    } else {
      // Use premium static cards
      setFlashcardDeck(FALLBACK_FLASHCARDS[guide.subjectId] || FALLBACK_FLASHCARDS.science);
    }
    setCurrentCardIndex(0);
    setIsFlipped(false);
  };

  // Helper parser scanning markdown response for flashcards
  const extractFlashcardsFromMarkdown = (md: string): { q: string; a: string }[] | null => {
    const cards: { q: string; a: string }[] = [];
    try {
      const qMatches = md.match(/Q\d+:\s*(.*?)(?=\n|A\d+:|$)/gi);
      const aMatches = md.match(/A\d+:\s*(.*?)(?=\n|Q\d+:|$)/gi);
      
      if (qMatches && aMatches && qMatches.length === aMatches.length) {
        for (let i = 0; i < qMatches.length; i++) {
          const qText = qMatches[i].replace(/Q\d+:\s*/gi, "").trim();
          const aText = aMatches[i].replace(/A\d+:\s*/gi, "").trim();
          if (qText && aText) {
            cards.push({ q: qText, a: aText });
          }
        }
      }
    } catch (e) {
      console.warn("Flashcard parser fail", e);
    }
    return cards.length >= 2 ? cards : null;
  };

  const toggleMilestone = (index: number) => {
    if (!activeGuide) return;
    const next = [...milestones];
    next[index] = !next[index];
    setMilestones(next);
    localStorage.setItem(`exam_prep_milestones_${activeGuide.id}`, JSON.stringify(next));
    
    // Notify outer progress tracker
    const completedCount = next.filter(Boolean).length;
    onLoggedMilestoneComplete(completedCount);
  };

  const handleGenerateGuideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setErrorMsg("");

    try {
      const payload = {
        subject: activeSubject.name,
        curriculum: curriculumDetails || "Standard syllabus blueprint guidelines",
        goals: goals || "Ace core topics and practice questions",
        level: academicLevel
      };

      const response = await fetch("/api/generate-study-guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Study guide production pipeline failed.");
      }

      const newGuide: StudyGuide = {
        id: `guide-${Date.now()}`,
        subjectId: selectedSubjectId,
        title: `Custom ${activeSubject.name} Study Binder`,
        curriculumDetails: curriculumDetails || "Full standard curriculum",
        goals: goals || "Master definitions & formulas",
        academicLevel: academicLevel,
        guideMarkdown: data.studyGuide,
        createdAt: new Date().toLocaleDateString()
      };

      // Upsert to lists
      const updatedGuides = allGuides.filter(g => g.subjectId !== selectedSubjectId);
      updatedGuides.push(newGuide);
      
      setAllGuides(updatedGuides);
      localStorage.setItem("exam_prep_study_guides", JSON.stringify(updatedGuides));
      loadActiveGuide(newGuide);

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "AI Study guide engine experienced heavy traffic. Please click Retry.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteGuide = () => {
    if (!activeGuide) return;
    if (confirm("Are you sure you want to delete this study guide from your binder?")) {
      const updated = allGuides.filter(g => g.id !== activeGuide.id);
      setAllGuides(updated);
      localStorage.setItem("exam_prep_study_guides", JSON.stringify(updated));
      localStorage.removeItem(`exam_prep_milestones_${activeGuide.id}`);
      setActiveGuide(null);
      setFlashcardDeck(FALLBACK_FLASHCARDS[selectedSubjectId] || FALLBACK_FLASHCARDS.science);
      onLoggedMilestoneComplete(0);
    }
  };

  return (
    <div id="study-guides-dashboard" className="space-y-6">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Input Configuration Column */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          <div className="bg-white/70 backdrop-blur-md border border-white/60 p-5 rounded-3xl shadow-xl shadow-indigo-100/10 focus-within:border-indigo-400/30 transition-all duration-300 group">
            <h3 className="font-display font-bold text-slate-800 text-xs mb-4 flex items-center justify-between font-sans">
              <span className="flex items-center gap-2">
                <BookmarkCheck size={14} className="text-indigo-600" />
                Study Blueprint Maker
              </span>
              <span className="text-[9px] font-mono text-slate-400 tracking-widest uppercase">CONFIG</span>
            </h3>

            <form onSubmit={handleGenerateGuideSubmit} className="space-y-4">
              <div className="text-left font-sans">
                <label className="block text-[8px] uppercase tracking-widest font-bold text-slate-400 mb-1 font-mono">
                  Education Standard / Grade Level
                </label>
                <select
                  id="guide-level-select"
                  className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none transition-all"
                  value={academicLevel}
                  onChange={(e) => setAcademicLevel(e.target.value)}
                >
                  <option value="High School (K-10 / CBSE / KSEEB)">High School (10th Standard / secondary)</option>
                  <option value="Pre-University College (PUC / Grade 11-12)">Pre-University (12th / High-School Spec)</option>
                  <option value="Undergraduate (UG Computer Science Degree)">Undergrad Computer Science (University Level)</option>
                  <option value="Regional Language Literature Division">Regional Literature Major</option>
                  <option value="Professional Developer Self-Taught">Professional / Coding Bootcamp Track</option>
                </select>
              </div>

              <div className="text-left font-sans">
                <label className="block text-[8px] uppercase tracking-widest font-bold text-slate-400 mb-1 font-mono">
                  Specify Curriculum / Prescribed Syllabus
                </label>
                <textarea
                  id="guide-curriculum-textarea"
                  rows={3}
                  className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none resize-none font-sans transition-all leading-relaxed"
                  placeholder="E.g., Karnataka Board 10th science standard, Unit 4 light lenses, or Visvesvaraya Technological University DS Syllabus..."
                  value={curriculumDetails}
                  onChange={(e) => setCurriculumDetails(e.target.value)}
                />
              </div>

              <div className="text-left font-sans">
                <label className="block text-[8px] uppercase tracking-widest font-bold text-slate-400 mb-1 font-mono">
                  Your High-Impact Target Goals / Gaps
                </label>
                <input
                  id="guide-goals-input"
                  type="text"
                  className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition-all"
                  placeholder="E.g., Practice pointer math, balance equations, or get a 95% score"
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                />
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs flex items-center gap-2 text-red-600 text-left">
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                id="generate-guide-btn"
                type="submit"
                disabled={isGenerating}
                className={`w-full font-display text-xs font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all ${
                  isGenerating 
                    ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed" 
                    : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100/55 cursor-pointer active:scale-95"
                }`}
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={14} className="animate-spin text-indigo-300" />
                    AI Organizing Binder...
                  </>
                ) : (
                  <>
                    <Sparkles size={14} className="text-indigo-200" />
                    Assemble Custom Study Guide
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Active Recall Interactive Flashcards Deck Card Flipper */}
          <div id="flashcards-widget" className="bg-white/70 backdrop-blur-md border border-white/60 hover:border-indigo-200/40 p-5 rounded-3xl shadow-xl shadow-indigo-100/10 space-y-4 transition-all duration-300 relative overflow-hidden group">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 text-left font-sans">
              <h4 className="font-display font-medium text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5 font-bold">
                <Zap size={14} className="text-indigo-600 animate-pulse" />
                Active Recall Cards
              </h4>
              <span className="text-[10px] font-mono text-slate-400">
                Card {currentCardIndex + 1}/{flashcardDeck.length}
              </span>
            </div>

            {flashcardDeck.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4 text-center">No revision cards found. Custom guides build active flashcards here.</p>
            ) : (
              <div className="space-y-4">
                
                {/* 3D Tactile flippable container */}
                <button
                  type="button"
                  id="tactile-flashcard-flipper"
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="w-full text-left min-h-[140px] bg-slate-50/50 border border-slate-200 hover:border-indigo-400/40 rounded-xl p-4 flex flex-col justify-between transition-all cursor-pointer relative overflow-hidden group shadow-sm font-sans"
                >
                  <div className="absolute top-2 right-2 text-[9px] font-mono text-slate-400 group-hover:text-slate-500 transition-colors uppercase">
                    Click to flip
                  </div>

                  <div className="flex-1 flex items-center justify-center text-center px-2">
                    {!isFlipped ? (
                      <p className="font-display font-medium text-xs md:text-sm text-slate-800 leading-relaxed text-center w-full">
                        {flashcardDeck[currentCardIndex]?.q}
                      </p>
                    ) : (
                      <p className="font-sans text-xs text-indigo-600 leading-relaxed font-semibold whitespace-pre-wrap text-center w-full">
                        {flashcardDeck[currentCardIndex]?.a}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-2 border-t border-slate-100 flex justify-between items-center text-[10px] font-mono w-full">
                    <span className="text-slate-400">Mode: {!isFlipped ? "Question" : "Answer Revealed"}</span>
                    <span className={`h-2 w-2 rounded-full ${!isFlipped ? "bg-slate-200" : "bg-indigo-600 animate-pulse"}`}></span>
                  </div>
                </button>

                {/* Deck togglers */}
                <div className="flex justify-between items-center gap-2 font-display text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentCardIndex((prev) => (prev > 0 ? prev - 1 : flashcardDeck.length - 1));
                      setIsFlipped(false);
                    }}
                    className="flex-1 py-1.5 px-3 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-700 text-center cursor-pointer font-medium shadow-sm"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentCardIndex((prev) => (prev < flashcardDeck.length - 1 ? prev + 1 : 0));
                      setIsFlipped(false);
                    }}
                    className="flex-1 py-1.5 px-3 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-700 text-center cursor-pointer font-medium shadow-sm"
                  >
                    Next Card
                  </button>
                </div>

              </div>
            )}
          </div>

        </div>

        {/* Right Active Guide Viewer Column */}
        <div className="lg:col-span-8 bg-white/70 backdrop-blur-md border border-white/60 rounded-3xl shadow-xl shadow-indigo-100/10 overflow-hidden min-h-[500px] flex flex-col transition-all duration-300">
          
          {activeGuide ? (
            <div id="guide-viewer" className="flex flex-col flex-1">
              
              {/* Floating top bar control */}
              <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left font-sans">
                <div className="flex items-center gap-2">
                  <BookmarkCheck className="text-indigo-600" size={18} />
                  <div>
                    <h4 className="font-display font-medium text-xs text-slate-900 uppercase tracking-wider font-bold">
                      {activeGuide.title}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Synthesized: {activeGuide.createdAt} • {activeGuide.academicLevel}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleDeleteGuide}
                  className="py-1 px-3 bg-white border border-slate-200 text-slate-500 hover:text-red-600 hover:border-red-100 hover:bg-red-50 rounded-lg text-[11px] font-medium cursor-pointer transition-all shadow-sm"
                >
                  Delete Blueprint
                </button>
              </div>

              {/* 7-day structured checking dashboard */}
              <div className="p-5 border-b border-slate-100 bg-slate-50/30 text-left">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-display font-bold text-slate-800 tracking-wide uppercase flex items-center gap-1.5 font-sans">
                    <CheckSquare size={14} className="text-indigo-600" />
                    Interactive 7-Day Achievement Checklist
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {milestones.filter(Boolean).length}/7 Finished
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-7 gap-2">
                  {Array.from({ length: 7 }).map((_, i) => {
                    const isChecked = milestones[i];
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => toggleMilestone(i)}
                        className={`p-2.5 rounded-lg border text-left transition-all relative flex flex-col justify-between overflow-hidden cursor-pointer ${
                          isChecked 
                            ? "bg-indigo-50/60 border-indigo-200 text-indigo-700 shadow-sm" 
                            : "bg-white border-slate-200 text-slate-400 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex justify-between items-start w-full">
                          <span className="text-[10px] text-slate-400 font-mono">Day {i + 1}</span>
                          {isChecked ? <CheckCircle size={10} className="text-indigo-600 animate-pulse" /> : <Square size={10} className="text-slate-300" />}
                        </div>
                        <span className="text-[10px] font-display font-medium mt-1 pr-1 truncate">
                          {isChecked ? "Review Done" : "Mark Clear"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Real Content container */}
              <div className="p-6 overflow-y-auto max-h-[500px] text-left flex-1 bg-white/40 font-sans">
                <div className="markdown-body">
                  <Markdown>{activeGuide.guideMarkdown}</Markdown>
                </div>
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center space-y-4 px-6 text-slate-300">
              <BookOpen size={56} className="text-slate-200 shrink-0" />
              <div>
                <h4 className="font-display font-medium text-slate-400 text-xs uppercase tracking-wider font-bold font-sans">No Active Syllabus Guide Created</h4>
                <p className="text-xs text-slate-500 max-w-[280px] mx-auto mt-2 leading-relaxed">
                  Use the left form to specify your curriculum. The AI will curate a personalized 7-day study guide and active recall flashcards instantly.
                </p>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
