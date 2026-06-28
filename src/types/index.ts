export interface Question {
  id: number;
  category: string;
  question: string;
  answer: string;
  diagrams: string[];
}

export type Category = "AI" | "UI / UX" | "React" | "JavaScript" | "Next.js";
