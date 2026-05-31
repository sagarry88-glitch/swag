import { useState, useRef, useEffect } from "react";
import { 
  Sparkles, 
  UploadCloud, 
  History, 
  HelpCircle, 
  CheckCircle2, 
  ThumbsUp, 
  AlertCircle, 
  Image as ImageIcon,
  BookOpen, 
  X,
  Loader2,
  Trash2,
  Camera
} from "lucide-react";
import Markdown from "react-markdown";
import { SubjectId, SUBJECTS_LIST, DoubtQuestion } from "../types";

interface DoubtSolvingHubProps {
  selectedSubjectId: SubjectId;
  onLoggedSolveAttempt: () => void; // call when student solves a doubt to increment statistics
}

// Sample academic helper questions to let students easily test drive in Sandbox
const SAMPLE_QUERIES: Record<SubjectId, { label: string; text: string; hasImage: boolean; base64Mock?: string }[]> = {
  kannada: [
    { 
      label: "ಕನ್ನಡ ಸಂಧಿಗಳ ವಿವರಣೆ", 
      text: "ಕನ್ನಡದಲ್ಲಿ ಲೋಪ ಸಂಧಿ ಮತ್ತು ಆದೇಶ ಸಂಧಿ ನಡುವಿನ ವ್ಯತ್ಯಾಸವನ್ನು ಉದಾಹರಣೆಗಳೊಂದಿಗೆ ವಿವರಿಸಿ.",
      hasImage: false 
    },
    { 
      label: "ಪ್ರಬಂಧ ರಚನೆ ಸಲಹೆಗಳು", 
      text: "ಪರಿಸರ ಮಾಲಿನ್ಯ ನಿಯಂತ್ರಣದ ಬಗ್ಗೆ ಉತ್ತಮ ಪ್ರಬಂಧ ಬರೆಯಲು ಪ್ರಮುಖಾಂಶಗಳು ಯಾವುವು?",
      hasImage: false 
    }
  ],
  science: [
    { 
      label: "Light Reflection Diagram Bug", 
      text: "Please look at the attached lens schematic. Why is the image formed at the principal focus inverted? Explain the focal formula 1/f = 1/v - 1/u.",
      hasImage: true,
      base64Mock: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" // Mock small transparent png
    },
    { 
      label: "Chemical Equation Balancing", 
      text: "How do I balance Fe + H2O -> Fe3O4 + H2? Explain the step-by-step law of conservation of mass in this context.",
      hasImage: false 
    }
  ],
  maths: [
    { 
      label: "Solve Trigonometric Identity", 
      text: "Prove that: (sin θ - 2 sin³ θ) / (2 cos³ θ - cos θ) = tan θ step by step.",
      hasImage: false 
    },
    { 
      label: "Calculus Derivative Screen", 
      text: "Please find the derivative of f(x) = (3x^2 + 5x - 2) / (x - 2) with explanations of quotient rule criteria.",
      hasImage: true,
      base64Mock: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
    }
  ],
  english: [
    { 
      label: "Active to Passive Conversion", 
      text: "Explain how tense rules change when converting 'The student answered all exam questions perfectly' to Passive Voice.",
      hasImage: false 
    }
  ],
  python: [
    { 
      label: "List Comprehension explanation", 
      text: "What is list comprehension in Python? Show structured examples for converting a temperature list in Celsius to Fahrenheit.",
      hasImage: false 
    },
    { 
      label: "Debug Type Error in Class", 
      text: "Why does my class function throw 'TypeError: method() takes 0 positional arguments but 1 was given'? Help me fix standard self parameters.",
      hasImage: false 
    }
  ],
  c: [
    { 
      label: "C Pointer Stack Buffer Error", 
      text: "Explain how pointer arithmetic works in C when accessing a multi-dimensional array like int grid[4][4] via direct pointer offset syntax.",
      hasImage: false 
    }
  ],
  java: [
    { 
      label: "Multithreading Deadlock Fix", 
      text: "How do I avoid thread deadlock in synchronized Java instances? Provide a code framework showing lock ordering hierarchy.",
      hasImage: false 
    }
  ],
  cs_majors: [
    { 
      label: "Database Normalization (3NF vs BCNF)", 
      text: "Explain the absolute difference between 3rd Normal Form (3NF) and Boyce-Codd Normal Form (BCNF) with relational schema examples.",
      hasImage: false 
    },
    { 
      label: "Dijkstra's Complex Graph Complexity", 
      text: "Why is Dijkstra's shortest path algorithm complexity O((V+E) log V) with binary heap? Explain the vertex extraction cycles.",
      hasImage: false 
    }
  ]
};

export default function DoubtSolvingHub({ selectedSubjectId, onLoggedSolveAttempt }: DoubtSolvingHubProps) {
  const [questionText, setQuestionText] = useState<string>("");
  const [isSolving, setIsSolving] = useState<boolean>(false);
  const [currentSolution, setCurrentSolution] = useState<string>("");
  
  // Image states
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageMime, setImageMime] = useState<string>("");
  const [imageBase64, setImageBase64] = useState<string>("");

  const [history, setHistory] = useState<DoubtQuestion[]>([]);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Camera stream scanning states
  const [showCamera, setShowCamera] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCameraStream = async () => {
    setShowCamera(true);
    setCameraError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.warn("Camera check blocked or refused", err);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (innerErr) {
        setCameraError("Camera access denied or unavailable. Please upload a file instead.");
      }
    }
  };

  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/png");
        setImagePreview(dataUrl);
        setImageMime("image/png");
        const base64 = dataUrl.split(",")[1];
        setImageBase64(base64);
        setImageFile(new File([], "camera-capture.png", { type: "image/png" }));
        setErrorMsg("");
      }
      stopCameraStream();
    }
  };

  const activeSubject = SUBJECTS_LIST.find(s => s.id === selectedSubjectId) || SUBJECTS_LIST[1];

  // Load doubt history on construct
  useEffect(() => {
    const saved = localStorage.getItem("exam_prep_doubt_history");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse doubt solver history log", e);
      }
    }
  }, []);

  const saveHistory = (newHistory: DoubtQuestion[]) => {
    setHistory(newHistory);
    localStorage.setItem("exam_prep_doubt_history", JSON.stringify(newHistory));
  };

  const handleClearHistory = () => {
    saveHistory([]);
  };

  // Convert uploaded image file to Base64 safely
  const processImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please upload a valid image file (PNG, JPG, or WEBP).");
      return;
    }
    
    setImageFile(file);
    setImageMime(file.type);
    
    // Create local object URL for instant preview
    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Extract pristine base64 payload without data:image/*;base64, prefix
      const stripped = base64String.split(",")[1];
      setImageBase64(stripped);
    };
    reader.readAsDataURL(file);
    setErrorMsg("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
    setImageBase64("");
    setImageMime("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const selectSampleQuery = (item: { label: string; text: string; hasImage: boolean; base64Mock?: string }) => {
    setQuestionText(item.text);
    if (item.hasImage) {
      setImagePreview("https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"); // HD Mock exam screenshot representation
      setImageBase64(item.base64Mock || "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==");
      setImageMime("image/png");
    } else {
      removeImage();
    }
  };

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim() && !imageBase64) {
      setErrorMsg("Please enter questions or choose sample presets first.");
      return;
    }

    setIsSolving(true);
    setErrorMsg("");
    setCurrentSolution("");

    try {
      const payload: any = {
        text: questionText,
        subject: activeSubject.name,
        image: imageBase64 ? { mimeType: imageMime || "image/png", data: imageBase64 } : null
      };

      const response = await fetch("/api/doubt-solve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Problem solving failed from tutor engine.");
      }

      setCurrentSolution(data.solution);

      // Save to locally persistent student history registry
      const newSolvedDoubt: DoubtQuestion = {
        id: `doubt-${Date.now()}`,
        text: questionText || "Solved question based on uploaded screenshot",
        imageUrl: imagePreview,
        solution: data.solution,
        subjectId: selectedSubjectId,
        timestamp: new Date().toLocaleString(),
        isSolved: true
      };

      saveHistory([newSolvedDoubt, ...history]);
      
      // Trigger outer progress milestone
      onLoggedSolveAttempt();

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "24/7 AI tutor gateway temporarily busy. Please try again.");
    } finally {
      setIsSolving(false);
    }
  };

  const loadPastDoubt = (past: DoubtQuestion) => {
    setQuestionText(past.text);
    setCurrentSolution(past.solution || "");
    if (past.imageUrl) {
      setImagePreview(past.imageUrl);
      setImageBase64("MOCKED_STALE");
    } else {
      removeImage();
    }
  };

  return (
    <div id="doubt-solver-hub" className="space-y-6 text-left">
      
      {/* Upper informational banner reminding students of 24/7 reliability */}
      <div className="bg-white/70 backdrop-blur-md border border-white/60 hover:border-indigo-200 rounded-3xl p-5 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4 select-none duration-300 transition-all shadow-xl shadow-indigo-100/10">
        <div className="absolute -right-16 -bottom-16 w-48 h-48 bg-indigo-500/5 rounded-full blur-2xl"></div>
        <div className="flex gap-4 items-center">
          <span className="p-3 bg-indigo-50 border border-indigo-100 rounded-2xl shadow-inner">
            <Sparkles size={22} className="text-indigo-600 animate-pulse" />
          </span>
          <div className="text-left font-sans">
            <h3 className="font-display font-extrabold text-slate-900 text-sm">
              24/7 AI Scholar Tutor Activated
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Ask anything, upload your homework diagrams, or select high-probability study samples for <span className="text-indigo-600 font-bold">{activeSubject.name}</span>.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-indigo-600 px-3 py-1 bg-indigo-50 border border-indigo-100/60 rounded-full">
          <span className="h-2 w-2 bg-indigo-600 rounded-full animate-ping"></span>
          Tutor Node: Active
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Ask Box Panel - Designed as an elegant Bento Box */}
        <div className="lg:col-span-7 bg-white/70 backdrop-blur-md border border-white/60 hover:border-indigo-400/30 p-6 rounded-3xl shadow-xl shadow-indigo-100/10 space-y-6 relative flex flex-col justify-between transition-all duration-300 group">
          
          <div className="space-y-6">
            {/* Header */}
            <div className="border-b border-slate-100 pb-4 text-left flex items-center justify-between">
              <h3 className="font-display font-black text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                <BookOpen size={14} className="text-indigo-600" />
                Problem Workspace
              </h3>
              <span className="text-[9px] font-mono text-slate-400 tracking-widest uppercase">INPUT BLOCK</span>
            </div>

          {/* Quick preset templates */}
          <div className="space-y-2 text-left">
            <span className="text-[10px] text-slate-400 font-display font-bold tracking-wider uppercase block">
              Sample Prep Prompts (Test-drive Sandbox):
            </span>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_QUERIES[selectedSubjectId]?.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => selectSampleQuery(sample)}
                  className="bg-slate-50 hover:bg-slate-100 border border-slate-200/80 hover:border-indigo-400/30 text-slate-700 text-xs py-1.5 px-3 rounded-lg transition-all text-left flex items-center gap-1.5 cursor-pointer max-w-full truncate"
                >
                  <Sparkles size={11} className="text-indigo-600 shrink-0" />
                  <span className="truncate font-medium">{sample.label}</span>
                </button>
              )) || (
                <span className="text-[11px] text-slate-400 italic">No samples available for this module yet. Write standard text query instead.</span>
              )}
            </div>
          </div>

          <form id="ai-doubt-solver-form" onSubmit={handleSubmitQuestion} className="space-y-4">
            
            {/* Form text input box */}
            <div>
              <textarea
                id="ai-doubt-textarea"
                rows={4}
                className="w-full bg-white border border-slate-200/80 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 rounded-xl py-3 px-4 text-xs md:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none transition-all resize-none font-sans leading-relaxed shadow-sm"
                placeholder={`Type your equations, code blocks, literal translation queries, or upload screenshots for step-by-step assistance in ${activeSubject.name}...`}
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
              />
            </div>

            {/* Drag and Drop File Attachment Box */}
            <div 
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`border border-dashed rounded-2xl p-4 md:p-5 transition-all text-center relative bg-slate-50/50 ${
                imagePreview 
                  ? "border-indigo-400 bg-indigo-50/20" 
                  : "border-slate-300 hover:border-indigo-400"
              }`}
            >
              {/* Webcam Scanning Panel overlay */}
              {showCamera ? (
                <div className="space-y-3 p-1">
                  <div className="flex justify-between items-center pb-2">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <Camera size={14} className="text-red-500 animate-pulse" />
                      Live Camera Scanner Stream
                    </span>
                    <button type="button" onClick={stopCameraStream} className="p-1 hover:bg-slate-200 text-slate-500 rounded-lg">
                      <X size={15} />
                    </button>
                  </div>
                  
                  {cameraError ? (
                    <p className="text-xs text-red-500 font-semibold p-4">{cameraError}</p>
                  ) : (
                    <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-inner bg-black max-w-sm mx-auto">
                      <video ref={videoRef} autoPlay playsInline className="w-full h-44 object-cover animate-fade-in" />
                      
                      {/* Interactive glowing scan laser overlay */}
                      <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-indigo-400 to-transparent top-1/2 left-0 right-0 z-10 animate-pulse"></div>
                    </div>
                  )}

                  {!cameraError && (
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
                    >
                      Capture Photo
                    </button>
                  )}
                  <p className="text-[10px] text-slate-500 mt-2 font-mono">
                    💡 Smart Glare Filter active: Position the material flat under diffuse light to avoid reflection artifacts.
                  </p>
                </div>
              ) : !imagePreview ? (
                <div className="space-y-4">
                  <div className="flex flex-col items-center justify-center py-2">
                    <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-2xl text-indigo-600 shadow-sm animate-bounce" style={{ animationDuration: "3s" }}>
                      <UploadCloud size={24} />
                    </div>
                    <p className="text-xs text-slate-600 mt-2 font-medium">
                      Drag & drop homework screenshots or diagram files here
                    </p>
                  </div>

                  {/* Dual Action Buttons styled uniformly as requested */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto">
                    <button
                      id="launch-cam-scanner-btn"
                      type="button"
                      onClick={startCameraStream}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-indigo-200/50 transition-all active:scale-95 cursor-pointer"
                    >
                      <Camera size={14} />
                      Launch Cam Scanner
                    </button>

                    <button
                      id="upload-image-file-btn"
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer"
                    >
                      <ImageIcon size={14} className="text-indigo-600" />
                      Upload Image File
                    </button>
                  </div>

                  <p className="text-[10px] text-slate-400 font-mono">
                    Supports JPG, PNG (Max 10MB) for equation OCR diagram scanning
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-14 h-14 bg-slate-100 border border-slate-200 rounded-lg overflow-hidden shrink-0">
                      <img 
                        src={imagePreview} 
                        alt="Screenshot Preview" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="text-left font-sans">
                      <p className="text-xs text-slate-800 font-bold">Screenshot Attached</p>
                      <p className="text-[10px] text-slate-500 font-mono text-left">
                        {imageFile ? `${(imageFile.size / (1024 * 1024)).toFixed(2)} MB` : "Attached Sample"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="p-1.5 bg-white hover:bg-red-50 text-slate-400 hover:text-red-500 border border-slate-200 rounded-md transition-colors cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              <input
                id="doubt-screenshot-upload"
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs flex items-center gap-2 text-red-600">
                <AlertCircle size={16} className="text-red-500 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex justify-between items-center pt-2">
              <span className="text-[11px] text-slate-400 font-mono hidden md:inline">
                Model: gemini-3.5-flash (Low-latency)
              </span>
              <button
                id="solve-btn-action"
                type="submit"
                disabled={isSolving}
                className={`ml-auto font-display text-xs md:text-sm font-bold py-3 px-6 rounded-2xl flex items-center gap-2 shadow-lg tracking-wider uppercase transition-all active:scale-95 ${
                  isSolving 
                    ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed" 
                    : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100/50 cursor-pointer"
                }`}
              >
                {isSolving ? (
                  <>
                    <Loader2 size={16} className="animate-spin text-white pr-1" />
                    AI Solving Doubt...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} className="text-indigo-200 animate-spin" style={{ animationDuration: "6s" }} />
                    Solve Problem Now
                  </>
                )}
              </button>
            </div>

          </form>
          </div>
        </div>

        {/* Right Active Solution Workspace Panel - Realigned as a companion Bento block */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          <div className="bg-white/70 backdrop-blur-md border border-white/60 rounded-3xl overflow-hidden shadow-xl shadow-indigo-100/10 min-h-[380px] flex flex-col transition-all duration-300">
            
            {/* Header branding workspace */}
            <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse"></span>
                <span className="text-xs text-slate-800 font-display font-semibold tracking-wider uppercase">
                  Scholar Workspace
                </span>
              </div>
              {currentSolution && (
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded font-mono">24/7 Verified</span>
                </div>
              )}
            </div>

            {/* Inner responsive display area */}
            <div id="workspace-display-box" className="p-5 flex-1 overflow-y-auto max-h-[460px]">
              {isSolving ? (
                <div className="h-full flex flex-col items-center justify-center py-16 text-center space-y-4">
                  <Loader2 size={36} className="animate-spin text-indigo-600" />
                  <div>
                    <h4 className="font-display font-medium text-slate-800 text-sm">Consulting Subject Expert Nodes</h4>
                    <p className="text-xs text-slate-500 max-w-[280px] mx-auto mt-2 leading-relaxed">
                      "Equipped with all textbook standards, grammar, and CS algorithms..."
                    </p>
                  </div>
                </div>
              ) : currentSolution ? (
                <div id="markdown-solution-box" className="prose max-w-none text-left font-sans">
                  <div className="markdown-body">
                    <Markdown>{currentSolution}</Markdown>
                  </div>

                  {/* Solutions Action Recall Indicators */}
                  <div className="mt-8 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 size={14} className="text-indigo-600" />
                      <span className="text-[11px] text-slate-600 font-medium">Was this explanation helpful?</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        type="button" 
                        onClick={() => alert("Explanation rated! Added to positive weights.")}
                        className="py-1 px-2.5 bg-white border border-slate-200 text-[10px] text-slate-700 font-display font-medium rounded-md hover:bg-slate-50 flex items-center gap-1 cursor-pointer"
                      >
                        <ThumbsUp size={10} className="text-indigo-600" />
                        Clear Step
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center py-16 text-center space-y-3 text-slate-300">
                  <HelpCircle size={44} className="text-slate-200" />
                  <div>
                    <h5 className="font-display font-medium text-slate-500 text-xs uppercase tracking-wider">Empty Workspace</h5>
                    <p className="text-xs text-slate-400 max-w-[240px] mx-auto mt-1 leading-relaxed">
                      Your step-by-step verified doubt explanations will reveal themselves here.
                    </p>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Past Doubts Log History - Bento style companion */}
          <div className="bg-white/70 backdrop-blur-md border border-white/60 p-5 rounded-3xl shadow-xl shadow-indigo-100/10 transition-all duration-300">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h4 className="font-display text-xs text-slate-800 font-bold uppercase tracking-wider flex items-center gap-1.5 font-sans">
                <History size={14} className="text-indigo-600" />
                History Log (Saved Anytime)
              </h4>
              {history.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="text-[10px] font-mono text-slate-400 hover:text-red-500 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 size={10} />
                  Clear All
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2 text-center">
                No past questions saved. Solved doubts auto-persist locally.
              </p>
            ) : (
              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1 text-left font-sans">
                {history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => loadPastDoubt(item)}
                    className="w-full text-left p-2.5 bg-white hover:bg-slate-50 border border-slate-100 hover:border-indigo-100 rounded-xl transition-all flex items-start gap-2.5 group cursor-pointer"
                  >
                    <span className="p-1 bg-indigo-50 rounded border border-indigo-100 text-indigo-600 mt-0.5 shrink-0">
                      <BookOpen size={11} />
                    </span>
                    <div className="truncate flex-1">
                      <p className="text-xs text-slate-700 group-hover:text-indigo-950 transition-colors font-medium truncate font-sans">
                        {item.text}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] font-mono text-indigo-600 uppercase font-semibold">
                          {item.subjectId}
                        </span>
                        <span className="text-[8px] font-mono text-slate-400">
                          {item.timestamp}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
