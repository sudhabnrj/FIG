export interface Question {
  id: number;
  category: string;
  question: string;
  answer: string;
  diagrams: string[];
  createdAt?: string;
  updatedAt?: string;
  authorId?: {
    name: string;
    username: string;
    avatar?: string;
  };
}

export type Category = "AI" | "UI / UX" | "React" | "JavaScript" | "Next.js";
