export interface User {
  id: string;
  name: string;
  email: string;
  studentId: string;
  major: string;
  joinedDate: string;
}

export type SubjectId =
  | "kannada"
  | "science"
  | "maths"
  | "english"
  | "python"
  | "c"
  | "java"
  | "cs_majors";

export interface SubjectInfo {
  id: SubjectId;
  name: string;
  icon: string; // lucide icon identifier
  color: string; // tailwind border/accent color
  description: string;
  curriculumTopics: string[];
}

export interface DoubtQuestion {
  id: string;
  text: string;
  imageUrl?: string;
  solution?: string;
  subjectId: SubjectId;
  timestamp: string;
  isSolved: boolean;
}

export interface StudyGuide {
  id: string;
  subjectId: SubjectId;
  title: string;
  curriculumDetails: string;
  goals: string;
  academicLevel: string;
  guideMarkdown: string;
  createdAt: string;
}

export interface PracticeAttempt {
  id: string;
  subjectId: SubjectId;
  topic: string;
  score: number; // percentage out of 100
  totalQuestions: number;
  date: string;
}

export interface SubjectProgress {
  subjectId: SubjectId;
  studyHours: number;
  milestonesCompleted: number;
  totalMilestones: number;
  weakTopics: string[];
}

export const SUBJECTS_LIST: SubjectInfo[] = [
  {
    id: "kannada",
    name: "Kannada (ಕನ್ನಡ)",
    icon: "BookOpen",
    color: "border-red-500 hover:shadow-red-500/20 text-red-400",
    description: "Literature, Grammar (ವ್ಯಾಕರಣ), and composition skills for Karnataka board and university level.",
    curriculumTopics: ["Kannada Grammar (ವ್ಯಾಕರಣ)", "Prose (ಗದ್ಯಾಂಶ)", "Poetry (ಪದ್ಯಾಂಶ)", "Translation & Essays"]
  },
  {
    id: "science",
    name: "General Science",
    icon: "Beaker",
    color: "border-emerald-500 hover:shadow-emerald-500/20 text-emerald-400",
    description: "Physics fundamentals, Chemical reactions, Cellular Biology, and Earth sciences.",
    curriculumTopics: ["Chemical Reactions & Equations", "Light - Reflection & Refraction", "Life Processes", "Electricity & Magnetism"]
  },
  {
    id: "maths",
    name: "Mathematics",
    icon: "Percent",
    color: "border-blue-500 hover:shadow-blue-500/20 text-blue-400",
    description: "Algebra, Calculus, Geometry, Trigonometry, and analytical mathematical problems.",
    curriculumTopics: ["Quadratic Equations", "Trigonometric Identities", "Differential Calculus & Integration", "Probability & Statistics"]
  },
  {
    id: "english",
    name: "English Literature & Grammar",
    icon: "FileText",
    color: "border-purple-500 hover:shadow-purple-500/20 text-purple-400",
    description: "Comprehensive English grammar, active writing templates, comprehension, and key text summaries.",
    curriculumTopics: ["Tense & Voice Rules", "Reported Speech & Concord", "Reading Comprehension Analysis", "Formal Letter & Essay Writing"]
  },
  {
    id: "python",
    name: "Python Programming (Phyton)",
    icon: "FileCode",
    color: "border-yellow-500 hover:shadow-yellow-500/20 text-yellow-400",
    description: "Variables, structures, OOP concepts, File handling, and Data Science introductions with Python.",
    curriculumTopics: ["Data Types & List Comprehensions", "Functions & Variable Scope", "Object-Oriented Python (Classes/Inheritance)", "File Handling & Error Handling"]
  },
  {
    id: "c",
    name: "C Programming",
    icon: "Cpu",
    color: "border-cyan-500 hover:shadow-cyan-500/20 text-cyan-400",
    description: "Pointers, memory management, low-level compilation structures, and C syntax mechanics.",
    curriculumTopics: ["Pointers & Dynamic Memory Allocation", "Structures & Unions in C", "File I/O and System Headers", "Bitwise Operations & Struct Packing"]
  },
  {
    id: "java",
    name: "Java Programming",
    icon: "Terminal",
    color: "border-orange-500 hover:shadow-orange-500/20 text-orange-400",
    description: "Multithreading, OOP hierarchies, JVM architecture, Collections framework, and Exception handling.",
    curriculumTopics: ["Polymorphism & Abstract Classes", "Java Collections Framework (Map, Set, List)", "Multithreading & ExecutorService", "Java Exception Handling Specs"]
  },
  {
    id: "cs_majors",
    name: "Undergrad Computer Science Majors",
    icon: "Layers",
    color: "border-pink-500 hover:shadow-pink-500/20 text-pink-400",
    description: "Core academic topics for Undergraduate Computer Science students: Data Structures, Algorithms, DBMS, Operating Systems.",
    curriculumTopics: ["Data Structures & Graph Algorithms", "Database Normalization & SQL Queries", "OS Scheduling & Memory Swapping", "Computer Networks & TCP/IP stack"]
  }
];
